"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/api";
import dynamic from "next/dynamic";

// Monaco diff editor — loaded client-side only
const DiffEditor = dynamic(
  () => import("@monaco-editor/react").then(m => m.DiffEditor),
  { ssr: false, loading: () => <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", color: "#9A9DA3", fontFamily: "monospace", fontSize: 12 }}>Loading editor...</div> }
);

const T = {
  card: "#101112", b1: "#1B1C1E", b2: "#232426", text: "#e5e2e3",
  sub: "#c6c5d8", muted: "#9A9DA3", brand: "#5E6BFF", cyan: "#50d8e9",
  violet: "#bec2ff", amber: "#ffb689", error: "#ffb4ab", green: "#92f1ff",
};
const mono = { fontFamily: "'Inter', monospace" } as const;
const head = { fontFamily: "'Manrope', sans-serif", fontWeight: 700 } as const;

interface PR {
  number: number; title: string; author: string; authorAvatar: string;
  sourceBranch: string; targetBranch: string; mergeable: boolean | null;
  conflictCount: number; createdAt: string; htmlUrl: string;
  labels: { name: string; color: string }[];
}
interface ConflictFile {
  filePath: string; language: string; status: string;
  patch: string; currentCode: string; incomingCode: string;
}
interface AIResolution {
  resolvedCode: string; explanation: string; confidence: number;
  strategy: string; risks: string[];
}

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const days = Math.floor(d / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export default function PullRequestsView({ clerkId, repoParam }: { clerkId: string; repoParam?: string }) {
  const [repoInput, setRepoInput] = useState(repoParam ?? "");
  const [activeRepo, setActiveRepo] = useState(repoParam ?? "");
  const [pulls, setPulls]   = useState<PR[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePR, setActivePR] = useState<PR | null>(null);
  const [conflicts, setConflicts] = useState<ConflictFile[]>([]);
  const [conflictsLoading, setConflictsLoading] = useState(false);
  const [activeFile, setActiveFile] = useState<ConflictFile | null>(null);
  const [resolution, setResolution] = useState<AIResolution | null>(null);
  const [resolving, setResolving] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pushed, setPushed] = useState(false);
  const [editedCode, setEditedCode] = useState("");
  const [reviewResult, setReviewResult] = useState<Record<string, unknown> | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const loadPRs = useCallback(async (repo: string) => {
    if (!repo.includes("/")) return;
    setLoading(true);
    const [owner, name] = repo.split("/");
    try {
      const data = await apiGet<{ pulls: PR[] }>(`/api/github/repos/${owner}/${name}/pulls`, clerkId);
      setPulls(data.pulls);
      setActivePR(null);
      setConflicts([]);
      setActiveFile(null);
      setResolution(null);
    } catch { setPulls([]); }
    setLoading(false);
  }, [clerkId]);

  useEffect(() => { if (repoParam) loadPRs(repoParam); }, [repoParam, loadPRs]);

  const openPR = async (pr: PR) => {
    setActivePR(pr);
    setConflicts([]);
    setActiveFile(null);
    setResolution(null);
    setPushed(false);
    setReviewResult(null);
    setConflictsLoading(true);
    const [owner, name] = activeRepo.split("/");
    try {
      const data = await apiGet<{ conflicts: ConflictFile[]; prTitle: string; sourceBranch: string; targetBranch: string }>(
        `/api/github/repos/${owner}/${name}/pulls/${pr.number}/conflicts`, clerkId
      );
      setConflicts(data.conflicts);
      if (data.conflicts.length > 0) {
        setActiveFile(data.conflicts[0]);
        setEditedCode(data.conflicts[0].currentCode);
      }
    } catch { setConflicts([]); }
    setConflictsLoading(false);
  };

  const resolveWithAI = async () => {
    if (!activeFile) return;
    setResolving(true);
    setResolution(null);
    try {
      const res = await apiPost<AIResolution>("/api/github/resolve/ai", clerkId, {
        filePath: activeFile.filePath,
        language: activeFile.language,
        currentCode: activeFile.currentCode,
        incomingCode: activeFile.incomingCode,
      });
      setResolution(res);
      setEditedCode(res.resolvedCode ?? "");
    } catch { alert("AI resolution failed"); }
    setResolving(false);
  };

  const pushResolution = async () => {
    if (!activeFile || !activePR || !editedCode) return;
    setPushing(true);
    const [owner, name] = activeRepo.split("/");
    try {
      await apiPost("/api/github/resolve/push", clerkId, {
        owner, repo: name,
        branch: activePR.sourceBranch,
        filePath: activeFile.filePath,
        resolvedCode: editedCode,
        commitMessage: `fix(merge): resolve conflict in ${activeFile.filePath} via SORK AI`,
      });
      setPushed(true);
    } catch { alert("Push failed — check GitHub token permissions"); }
    setPushing(false);
  };

  const reviewPR = async () => {
    if (!activePR) return;
    setReviewing(true);
    const [owner, name] = activeRepo.split("/");
    try {
      const res = await apiPost<Record<string, unknown>>(
        `/api/github/repos/${owner}/${name}/pulls/${activePR.number}/review`, clerkId, {}
      );
      setReviewResult(res);
    } catch { alert("Review failed"); }
    setReviewing(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Repo selector */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={repoInput} onChange={e => setRepoInput(e.target.value)}
          placeholder="owner/repo — e.g. Atofinite5/sork-client"
          onKeyDown={e => { if (e.key === "Enter") { setActiveRepo(repoInput); loadPRs(repoInput); } }}
          style={{ flex: 1, background: "#0a0a0b", border: `1px solid ${T.b1}`, borderRadius: 2, color: T.text, padding: "9px 14px", fontSize: 13, ...mono, outline: "none" }}
        />
        <button onClick={() => { setActiveRepo(repoInput); loadPRs(repoInput); }}
          style={{ ...mono, fontSize: 12, padding: "9px 18px", borderRadius: 2, background: T.brand, color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}>
          Load PRs
        </button>
      </div>

      {loading && <div style={{ ...mono, fontSize: 12, color: T.muted, padding: 20 }}>Loading pull requests...</div>}

      {!loading && pulls.length === 0 && activeRepo && (
        <div style={{ ...mono, fontSize: 12, color: T.muted, padding: 20 }}>
          No open pull requests in {activeRepo}
        </div>
      )}

      {/* PR list + detail split view */}
      {pulls.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: activePR ? "300px 1fr" : "1fr", gap: 16 }}>

          {/* PR list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pulls.map(pr => (
              <div key={pr.number}
                onClick={() => openPR(pr)}
                style={{
                  background: activePR?.number === pr.number ? T.brand + "18" : T.card,
                  border: `1px solid ${activePR?.number === pr.number ? T.brand + "60" : T.b1}`,
                  borderRadius: 4, padding: "12px 14px", cursor: "pointer",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ ...mono, fontSize: 10, color: T.muted }}>#{pr.number}</span>
                  {pr.conflictCount > 0 && (
                    <span style={{ ...mono, fontSize: 9, color: T.error, background: T.error + "18", padding: "2px 5px", borderRadius: 2 }}>
                      {pr.conflictCount} conflicts
                    </span>
                  )}
                  {pr.mergeable === true && (
                    <span style={{ ...mono, fontSize: 9, color: T.green, background: T.green + "15", padding: "2px 5px", borderRadius: 2 }}>Clean</span>
                  )}
                </div>
                <div style={{ ...head, fontSize: 12, color: T.text, marginBottom: 4 }}>{pr.title}</div>
                <div style={{ ...mono, fontSize: 10, color: T.muted }}>
                  {pr.sourceBranch} → {pr.targetBranch} · {timeAgo(pr.createdAt)}
                </div>
              </div>
            ))}
          </div>

          {/* PR detail */}
          {activePR && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* PR header */}
              <div style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 4, padding: "14px 16px" }}>
                <div style={{ ...head, fontSize: 16, color: T.text, marginBottom: 8 }}>{activePR.title}</div>
                <div style={{ display: "flex", gap: 12, ...mono, fontSize: 11, color: T.muted, marginBottom: 12 }}>
                  <span>#{activePR.number}</span>
                  <span>by @{activePR.author}</span>
                  <span>{activePR.sourceBranch} → {activePR.targetBranch}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <a href={activePR.htmlUrl} target="_blank" rel="noreferrer"
                    style={{ ...mono, fontSize: 11, color: T.cyan, textDecoration: "none", padding: "5px 12px", border: `1px solid ${T.cyan}30`, borderRadius: 2 }}>
                    Open on GitHub ↗
                  </a>
                  <button onClick={reviewPR} disabled={reviewing}
                    style={{ ...mono, fontSize: 11, padding: "5px 12px", borderRadius: 2, border: `1px solid ${T.violet}40`, background: T.violet + "12", color: T.violet, cursor: "pointer" }}>
                    {reviewing ? "Reviewing…" : "🔍 AI Code Review"}
                  </button>
                </div>
              </div>

              {/* AI Review result */}
              {reviewResult && (
                <div style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 4, padding: "14px 16px" }}>
                  <div style={{ ...head, fontSize: 13, color: T.text, marginBottom: 10 }}>AI Code Review</div>
                  <div style={{ ...mono, fontSize: 12, color: T.sub, marginBottom: 8 }}>{reviewResult.summary as string}</div>
                  {((reviewResult.securityIssues as unknown[]) ?? []).length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {(reviewResult.securityIssues as { severity: string; file: string; description: string }[]).map((issue, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, ...mono, fontSize: 11 }}>
                          <span style={{ color: issue.severity === "critical" ? T.error : issue.severity === "high" ? T.amber : T.violet, textTransform: "uppercase", fontSize: 9, flexShrink: 0, marginTop: 1 }}>{issue.severity}</span>
                          <span style={{ color: T.sub }}>{issue.file} — {issue.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: 8, ...mono, fontSize: 11, color: (reviewResult.recommendation as string) === "approve" ? T.green : T.amber }}>
                    Recommendation: {reviewResult.recommendation as string} · Risk score: {reviewResult.riskScore as number}/100
                  </div>
                </div>
              )}

              {/* Conflict file list */}
              {conflictsLoading && <div style={{ ...mono, fontSize: 12, color: T.muted }}>Fetching conflicts…</div>}

              {conflicts.length > 0 && (
                <>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {conflicts.map(f => (
                      <button key={f.filePath} onClick={() => { setActiveFile(f); setEditedCode(f.currentCode); setResolution(null); setPushed(false); }}
                        style={{ ...mono, fontSize: 10, padding: "4px 10px", borderRadius: 2, border: `1px solid ${activeFile?.filePath === f.filePath ? T.brand : T.b1}`, background: activeFile?.filePath === f.filePath ? T.brand + "18" : "transparent", color: activeFile?.filePath === f.filePath ? T.violet : T.muted, cursor: "pointer" }}>
                        {f.filePath.split("/").pop()}
                      </button>
                    ))}
                  </div>

                  {activeFile && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {/* File header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ ...mono, fontSize: 12, color: T.sub }}>{activeFile.filePath}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => { setEditedCode(activeFile.currentCode); setResolution(null); }}
                            style={{ ...mono, fontSize: 11, padding: "5px 12px", borderRadius: 2, border: `1px solid ${T.b1}`, background: "transparent", color: T.muted, cursor: "pointer" }}>
                            Accept Current
                          </button>
                          <button onClick={() => { setEditedCode(activeFile.incomingCode); setResolution(null); }}
                            style={{ ...mono, fontSize: 11, padding: "5px 12px", borderRadius: 2, border: `1px solid ${T.b1}`, background: "transparent", color: T.muted, cursor: "pointer" }}>
                            Accept Incoming
                          </button>
                          <button onClick={resolveWithAI} disabled={resolving}
                            style={{ ...mono, fontSize: 11, padding: "5px 16px", borderRadius: 2, border: "none", background: T.brand, color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                            {resolving ? "Resolving…" : "⚡ Ask SORK AI"}
                          </button>
                        </div>
                      </div>

                      {/* Monaco diff editor */}
                      <div style={{ border: `1px solid ${T.b1}`, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ display: "flex", ...mono, fontSize: 10, color: T.muted, borderBottom: `1px solid ${T.b1}` }}>
                          <div style={{ flex: 1, padding: "6px 12px", background: "#0a0a0b", borderRight: `1px solid ${T.b1}` }}>← CURRENT ({activePR.sourceBranch})</div>
                          <div style={{ flex: 1, padding: "6px 12px", background: "#0a0a0b" }}>INCOMING ({activePR.targetBranch}) →</div>
                        </div>
                        <DiffEditor
                          height="360px"
                          language={activeFile.language ?? "plaintext"}
                          original={activeFile.incomingCode}
                          modified={activeFile.currentCode}
                          theme="vs-dark"
                          options={{ readOnly: false, minimap: { enabled: false }, fontSize: 12, lineNumbers: "on", wordWrap: "on" }}
                        />
                      </div>

                      {/* AI resolution result */}
                      {resolution && (
                        <div style={{ background: T.card, border: `1px solid ${T.green}30`, borderRadius: 4, padding: "14px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <div style={{ ...head, fontSize: 13, color: T.green }}>AI Resolution Ready</div>
                            <div style={{ ...mono, fontSize: 10, color: T.muted }}>
                              confidence {Math.round((resolution.confidence ?? 0) * 100)}% · {resolution.strategy}
                            </div>
                          </div>
                          <div style={{ ...mono, fontSize: 11, color: T.sub, marginBottom: 8 }}>{resolution.explanation}</div>
                          {resolution.risks?.length > 0 && (
                            <div style={{ ...mono, fontSize: 10, color: T.amber }}>
                              ⚠ {resolution.risks.join(", ")}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Push button */}
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={pushResolution} disabled={pushing || pushed || !editedCode}
                          style={{ ...mono, fontSize: 12, padding: "9px 20px", borderRadius: 2, border: "none", background: pushed ? T.green + "30" : T.green, color: pushed ? T.green : "#000", cursor: pushed ? "default" : "pointer", fontWeight: 700, opacity: pushing ? 0.7 : 1 }}>
                          {pushed ? "✓ Pushed to GitHub" : pushing ? "Pushing…" : "Push Resolution to GitHub"}
                        </button>
                        {pushed && (
                          <a href={activePR.htmlUrl} target="_blank" rel="noreferrer"
                            style={{ ...mono, fontSize: 12, padding: "9px 16px", borderRadius: 2, border: `1px solid ${T.b1}`, color: T.cyan, textDecoration: "none" }}>
                            View PR ↗
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {!conflictsLoading && conflicts.length === 0 && (
                <div style={{ background: T.card, border: `1px solid ${T.green}30`, borderRadius: 4, padding: 20, textAlign: "center" }}>
                  <div style={{ ...head, fontSize: 14, color: T.green, marginBottom: 6 }}>✓ No conflicts detected</div>
                  <div style={{ ...mono, fontSize: 12, color: T.muted }}>This PR is clean and ready to merge.</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
