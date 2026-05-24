"use client";

/**
 * Multi-agent project scanner — runs the full pipeline on a project from the browser.
 *
 *   Cohere embed → Groq fast triage → NVIDIA heavy review → Groq summary
 *
 * Users drop a folder (webkitdirectory) or files, we serialize them, send to
 * /api/agent/scan, and render the report with per-file code highlights.
 */

import { useState, useRef, useCallback } from "react";
import { apiPost, apiGet } from "@/lib/api";
import { FolderOpen, Loader2, FileCode, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const SUPPORTED_EXTS = [".ts",".tsx",".js",".jsx",".py",".go",".rs",".java",".cs",".rb",".php",".vue",".svelte"];
const MAX_FILE_SIZE  = 80_000;
const MAX_FILES      = 25;

interface FilePayload { path: string; language: string; content: string }
interface Finding {
  severity: "critical" | "high" | "medium" | "low" | "info";
  line: number; cwe: string; title: string; description: string; fix: string; confidence: number;
}
interface AgentResult {
  ok: boolean;
  projectName: string;
  filesScanned: number;
  totalFiles: number;
  filesDeepReviewed: number;
  stages: { name: string; status: string; provider?: string; ms?: number }[];
  counts: { critical: number; high: number; medium: number; low: number; total: number };
  summary: string;
  findings: { filePath: string; language: string; issues: Finding[]; riskScore: number; deepReviewed: boolean }[];
  heavyAnalysis: { filePath: string; recommendation?: string; verifiedIssues?: Finding[]; missedIssues?: Finding[] }[];
  durationMs: number;
}
interface RoutingStatus {
  routing: {
    chat:  { source: string; provider: string; model: string };
    embed: { source: string; provider: string; model: string };
    heavy: { source: string; provider: string; model: string };
  };
}

const T = {
  card: "#101112", b1: "#1B1C1E", b2: "#232426",
  text: "#e5e2e3", sub: "#c6c5d8", muted: "#9A9DA3",
  brand: "#5E6BFF", cyan: "#50d8e9", violet: "#bec2ff",
  amber: "#ffb689", error: "#ffb4ab", green: "#92f1ff",
};
const mono = { fontFamily: "'Inter', monospace" } as const;
const head = { fontFamily: "'Manrope', sans-serif", fontWeight: 700, letterSpacing: "-0.04em" } as const;

const LANG_MAP: Record<string,string> = {
  ts:"typescript",tsx:"typescript",js:"javascript",jsx:"javascript",
  py:"python",go:"go",rs:"rust",java:"java",cs:"csharp",
  rb:"ruby",php:"php",vue:"vue",svelte:"svelte",
};

function sevColor(s: string) {
  return s === "critical" ? T.error : s === "high" ? T.amber : s === "medium" ? T.violet : T.muted;
}

export default function ProjectScanner({ clerkId }: { clerkId: string }) {
  const [files, setFiles]   = useState<FilePayload[]>([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [routing, setRouting] = useState<RoutingStatus["routing"] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async (list: FileList) => {
    const arr = Array.from(list);
    const supported = arr.filter(f => {
      const ext = "." + (f.name.split(".").pop()?.toLowerCase() ?? "");
      return SUPPORTED_EXTS.includes(ext) && f.size <= MAX_FILE_SIZE;
    }).slice(0, MAX_FILES);

    const loaded = await Promise.all(supported.map(async f => {
      const content = await f.text();
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      // webkitRelativePath gives folder/file.ts; fallback to f.name
      const fileWithPath = f as File & { webkitRelativePath?: string };
      const path = fileWithPath.webkitRelativePath || f.name;
      return { path, language: LANG_MAP[ext] ?? ext, content } as FilePayload;
    }));
    setFiles(loaded);
    setResult(null);
  }, []);

  async function runScan() {
    if (!files.length || scanning) return;
    setScanning(true);
    setResult(null);
    try {
      // Get routing status first (which providers user has wired)
      const status = await apiGet<RoutingStatus>("/api/agent/status", clerkId);
      setRouting(status.routing);

      const res = await apiPost<AgentResult>("/api/agent/scan", clerkId, {
        files,
        projectName: files[0]?.path.split("/")[0] ?? "project",
      });
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Scan failed: " + (err instanceof Error ? err.message : "unknown"));
    }
    setScanning(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Header card ── */}
      <div style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 4, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <FolderOpen style={{ width: 18, height: 18, color: T.violet }} />
          <span style={{ ...head, fontSize: 16, color: T.text }}>Multi-Agent Project Scanner</span>
        </div>
        <p style={{ ...mono, fontSize: 11, color: T.muted, lineHeight: 1.6, marginBottom: 16 }}>
          Drop your project folder. SORK runs the full pipeline:
          <span style={{ color: T.violet }}> Cohere embed</span> →
          <span style={{ color: T.cyan }}> Groq fast triage</span> →
          <span style={{ color: T.amber }}> NVIDIA deep review</span> →
          report with line-level fixes.
        </p>

        {/* Input row */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            ref={folderRef}
            type="file"
            // @ts-expect-error — webkitdirectory is non-standard but works in all browsers
            webkitdirectory=""
            directory=""
            multiple
            style={{ display: "none" }}
            onChange={e => e.target.files && loadFiles(e.target.files)}
          />
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={SUPPORTED_EXTS.join(",")}
            style={{ display: "none" }}
            onChange={e => e.target.files && loadFiles(e.target.files)}
          />
          <button onClick={() => folderRef.current?.click()} disabled={scanning}
            style={{ ...mono, fontSize: 11, padding: "8px 14px", borderRadius: 2, background: T.brand, color: "#fff", border: "none", fontWeight: 600, cursor: scanning ? "not-allowed" : "pointer", opacity: scanning ? 0.5 : 1 }}>
            📁 Drop Project Folder
          </button>
          <button onClick={() => fileRef.current?.click()} disabled={scanning}
            style={{ ...mono, fontSize: 11, padding: "8px 14px", borderRadius: 2, background: "transparent", color: T.sub, border: `1px solid ${T.b2}`, cursor: scanning ? "not-allowed" : "pointer" }}>
            Or Select Files
          </button>
          {files.length > 0 && (
            <button onClick={runScan} disabled={scanning}
              style={{ ...mono, fontSize: 11, padding: "8px 18px", borderRadius: 2, background: T.green, color: "#000", border: "none", fontWeight: 700, cursor: scanning ? "not-allowed" : "pointer", marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              {scanning ? <><Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> Scanning…</> : `⚡ Run Multi-Agent Scan (${files.length} files)`}
            </button>
          )}
        </div>

        {/* File preview */}
        {files.length > 0 && !scanning && !result && (
          <div style={{ marginTop: 14, ...mono, fontSize: 10, color: T.muted, maxHeight: 100, overflowY: "auto", borderTop: `1px solid ${T.b1}`, paddingTop: 10 }}>
            {files.slice(0, 8).map(f => (
              <div key={f.path} style={{ padding: "2px 0", color: T.sub }}>
                <span style={{ color: T.cyan }}>{f.language}</span> · {f.path} <span style={{ color: T.muted }}>({(f.content.length / 1024).toFixed(1)} KB)</span>
              </div>
            ))}
            {files.length > 8 && <div style={{ color: T.muted, padding: "2px 0" }}>… and {files.length - 8} more</div>}
          </div>
        )}
      </div>

      {/* ── Scanning progress ── */}
      {scanning && (
        <div style={{ background: T.card, border: `1px solid ${T.brand}30`, borderRadius: 4, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Loader2 style={{ width: 16, height: 16, color: T.brand }} className="animate-spin" />
            <span style={{ ...mono, fontSize: 12, color: T.violet }}>Multi-agent pipeline running…</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, ...mono, fontSize: 10, color: T.muted }}>
            <div>→ Stage 1: <span style={{ color: T.violet }}>Cohere</span> indexing project for memory context</div>
            <div>→ Stage 2: <span style={{ color: T.cyan }}>Groq</span> fast triage across {files.length} files</div>
            <div>→ Stage 3: <span style={{ color: T.amber }}>NVIDIA</span> deep review on suspicious code</div>
            <div>→ Stage 4: aggregating findings with line-level fixes</div>
          </div>
        </div>
      )}

      {/* ── Routing status ── */}
      {routing && !scanning && (
        <div style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 4, padding: "10px 16px", display: "flex", gap: 16, ...mono, fontSize: 10, color: T.muted, flexWrap: "wrap" }}>
          <span>Routing:</span>
          {(["chat","embed","heavy"] as const).map(t => (
            <span key={t}>
              <span style={{ color: T.muted }}>{t}:</span>{" "}
              <span style={{ color: routing[t].source === "byok" ? T.green : T.cyan }}>
                {routing[t].provider}
              </span>{" "}
              <span style={{ color: T.muted, fontSize: 9 }}>({routing[t].source})</span>
            </span>
          ))}
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <>
          {/* Summary */}
          <div style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 4, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ ...head, fontSize: 15, color: T.text }}>{result.summary}</span>
              <span style={{ ...mono, fontSize: 10, color: T.muted }}>{(result.durationMs / 1000).toFixed(1)}s · {result.filesScanned} files scanned</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { label: "Critical", val: result.counts.critical, color: T.error },
                { label: "High",     val: result.counts.high,     color: T.amber },
                { label: "Medium",   val: result.counts.medium,   color: T.violet },
                { label: "Low",      val: result.counts.low,      color: T.muted },
              ].map(s => (
                <div key={s.label} style={{ background: "#0a0a0b", border: `1px solid ${T.b1}`, borderRadius: 2, padding: "10px 14px" }}>
                  <div style={{ ...mono, fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                  <div style={{ ...head, fontSize: 22, color: s.color, marginTop: 2 }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stage timeline */}
          <div style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 4, padding: "14px 18px" }}>
            <div style={{ ...mono, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Pipeline Stages</div>
            <div style={{ display: "flex", gap: 0 }}>
              {result.stages.map((s, i) => (
                <div key={s.name} style={{ flex: 1, display: "flex", alignItems: "center" }}>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 2, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ ...mono, fontSize: 11, fontWeight: 600, color: T.cyan }}>{s.name}</div>
                    <div style={{ ...mono, fontSize: 9, color: T.muted, marginTop: 2 }}>{s.provider}</div>
                    <div style={{ ...mono, fontSize: 9, color: s.status === "ok" ? T.green : T.muted, marginTop: 2 }}>
                      {s.status} · {s.ms ? `${s.ms}ms` : "—"}
                    </div>
                  </div>
                  {i < result.stages.length - 1 && <span style={{ color: T.muted, padding: "0 6px" }}>→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Per-file findings */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result.findings.filter(f => f.issues.length > 0).map(file => (
              <div key={file.filePath} style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 4, overflow: "hidden" }}>
                <button onClick={() => setExpanded(expanded === file.filePath ? null : file.filePath)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <FileCode style={{ width: 14, height: 14, color: T.cyan }} />
                    <span style={{ ...mono, fontSize: 12, color: T.text }}>{file.filePath}</span>
                    {file.deepReviewed && (
                      <span style={{ ...mono, fontSize: 9, color: T.amber, background: T.amber + "15", padding: "2px 6px", borderRadius: 2 }}>NVIDIA DEEP-REVIEWED</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {file.issues.map((i, idx) => (
                      <span key={idx} style={{ ...mono, fontSize: 9, color: sevColor(i.severity), background: sevColor(i.severity) + "18", padding: "2px 5px", borderRadius: 2 }}>
                        {i.severity[0].toUpperCase()}
                      </span>
                    ))}
                    <span style={{ ...mono, fontSize: 10, color: T.muted, marginLeft: 8 }}>{expanded === file.filePath ? "▾" : "▸"}</span>
                  </div>
                </button>
                {expanded === file.filePath && (
                  <div style={{ padding: "10px 14px 14px", borderTop: `1px solid ${T.b1}`, background: "#0a0a0b" }}>
                    {file.issues.map((issue, idx) => (
                      <div key={idx} style={{ padding: "10px 0", borderBottom: idx < file.issues.length - 1 ? `1px solid ${T.b1}` : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          {issue.severity === "critical" ? <XCircle style={{ width: 12, height: 12, color: T.error }} />
                            : issue.severity === "high" ? <AlertTriangle style={{ width: 12, height: 12, color: T.amber }} />
                            : <CheckCircle2 style={{ width: 12, height: 12, color: T.muted }} />}
                          <span style={{ ...mono, fontSize: 9, color: sevColor(issue.severity), background: sevColor(issue.severity) + "18", padding: "1px 5px", borderRadius: 2, textTransform: "uppercase", fontWeight: 600 }}>{issue.severity}</span>
                          <span style={{ ...mono, fontSize: 11, color: T.text, fontWeight: 600 }}>{issue.title}</span>
                          <span style={{ ...mono, fontSize: 9, color: T.muted }}>· {issue.cwe} · line {issue.line} · {Math.round((issue.confidence ?? 0) * 100)}%</span>
                        </div>
                        <div style={{ ...mono, fontSize: 11, color: T.sub, marginBottom: 8, lineHeight: 1.5 }}>{issue.description}</div>
                        <div style={{ ...mono, fontSize: 10, color: T.green, background: "rgba(146,241,255,0.06)", border: `1px solid ${T.green}25`, padding: "6px 10px", borderRadius: 2 }}>
                          💡 <strong>Fix:</strong> {issue.fix}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {result.findings.filter(f => f.issues.length > 0).length === 0 && (
              <div style={{ background: T.card, border: `1px solid ${T.green}30`, borderRadius: 4, padding: 24, textAlign: "center" }}>
                <CheckCircle2 style={{ width: 32, height: 32, color: T.green, margin: "0 auto 8px" }} />
                <div style={{ ...head, fontSize: 14, color: T.green, marginBottom: 4 }}>Clean codebase</div>
                <div style={{ ...mono, fontSize: 11, color: T.muted }}>No security issues detected in {result.filesScanned} files.</div>
              </div>
            )}
          </div>

          {/* NVIDIA recommendations */}
          {result.heavyAnalysis.length > 0 && (
            <div style={{ background: T.card, border: `1px solid ${T.amber}30`, borderRadius: 4, padding: 18 }}>
              <div style={{ ...head, fontSize: 13, color: T.amber, marginBottom: 12 }}>🧠 NVIDIA Deep Analysis</div>
              {result.heavyAnalysis.map(h => h.recommendation && (
                <div key={h.filePath} style={{ marginBottom: 10, padding: "10px 14px", background: "#0a0a0b", borderRadius: 2 }}>
                  <div style={{ ...mono, fontSize: 11, color: T.violet, fontWeight: 600, marginBottom: 4 }}>{h.filePath}</div>
                  <div style={{ ...mono, fontSize: 11, color: T.sub, lineHeight: 1.6 }}>{h.recommendation}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
