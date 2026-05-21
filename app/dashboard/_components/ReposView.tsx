"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://sork-back.onrender.com";

const T = {
  card: "#101112", b1: "#1B1C1E", b2: "#232426", text: "#e5e2e3",
  sub: "#c6c5d8", muted: "#9A9DA3", brand: "#5E6BFF", cyan: "#50d8e9",
  violet: "#bec2ff", amber: "#ffb689", error: "#ffb4ab", green: "#92f1ff",
};
const mono = { fontFamily: "'Inter', monospace" } as const;
const head = { fontFamily: "'Manrope', sans-serif", fontWeight: 700 } as const;

interface GitHubStatus { connected: boolean; username?: string; avatarUrl?: string }
interface Repo {
  id: string; owner: string; name: string; fullName: string; isPrivate: boolean;
  language: string | null; description: string | null; stars: number;
  updatedAt: string; htmlUrl: string; openIssues: number;
}

const LANG_C: Record<string, string> = {
  TypeScript: T.cyan, JavaScript: T.amber, Python: T.violet,
  Go: "#b5d5ff", Rust: T.amber, Java: T.error, default: T.muted,
};

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const days = Math.floor(d / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function ReposView({ clerkId }: { clerkId: string }) {
  const [status, setStatus]   = useState<GitHubStatus | null>(null);
  const [repos,  setRepos]    = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState<"all" | "public" | "private">("all");
  const [oauthUrl, setOauthUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await apiGet<GitHubStatus>("/api/github/status", clerkId);
        setStatus(s);
        if (s.connected) {
          const r = await apiGet<{ repos: Repo[] }>("/api/github/repos", clerkId);
          setRepos(r.repos);
        }
      } catch { setStatus({ connected: false }); }
      setLoading(false);
    })();
  }, [clerkId]);

  const connectGitHub = async () => {
    try {
      const res = await apiGet<{ url: string }>("/api/github/oauth/init", clerkId);
      window.location.href = res.url;
    } catch { alert("GitHub OAuth not configured — set GITHUB_CLIENT_ID on backend"); }
  };

  const disconnect = async () => {
    if (!confirm("Disconnect GitHub?")) return;
    await fetch(`${API}/api/github/disconnect`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${clerkId}`, "x-clerk-user-id": clerkId },
    });
    setStatus({ connected: false });
    setRepos([]);
  };

  const filtered = repos.filter(r => {
    const matchSearch = r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "private" ? r.isPrivate : !r.isPrivate);
    return matchSearch && matchFilter;
  });

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, ...mono, fontSize: 12, color: T.muted }}>
      Loading...
    </div>
  );

  if (!status?.connected) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "80px 32px", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 4, background: "rgba(94,107,255,0.1)", border: "1px solid rgba(94,107,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
        ⌥
      </div>
      <div>
        <div style={{ ...head, fontSize: 18, color: T.text, marginBottom: 8 }}>Connect GitHub</div>
        <div style={{ ...mono, fontSize: 13, color: T.muted, maxWidth: 380 }}>
          Connect your GitHub account to scan repositories, review PRs, and resolve merge conflicts with AI.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, ...mono, fontSize: 12, color: T.muted }}>
        {["Scan any repository on demand", "AI merge conflict resolution", "Automated PR security review", "Push fixes directly to GitHub"].map(f => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: T.green }}>✓</span> {f}
          </div>
        ))}
      </div>
      <button onClick={connectGitHub}
        style={{ background: T.text, color: "#000", padding: "10px 24px", borderRadius: 2, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", ...mono }}>
        Connect GitHub
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {status.avatarUrl && <img src={status.avatarUrl} alt="" style={{ width: 28, height: 28, borderRadius: 2, border: `1px solid ${T.b2}` }} />}
          <span style={{ ...mono, fontSize: 12, color: T.sub }}>@{status.username}</span>
          <span style={{ ...mono, fontSize: 9, color: T.green, background: T.green + "15", padding: "2px 6px", borderRadius: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>Connected</span>
        </div>
        <button onClick={disconnect} style={{ ...mono, fontSize: 11, color: T.error, background: "transparent", border: `1px solid ${T.error}30`, borderRadius: 2, padding: "4px 10px", cursor: "pointer" }}>
          Disconnect
        </button>
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search repositories..."
          style={{ flex: 1, background: "#0a0a0b", border: `1px solid ${T.b1}`, borderRadius: 2, color: T.text, padding: "8px 12px", fontSize: 13, ...mono, outline: "none" }}
        />
        {(["all", "public", "private"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ ...mono, fontSize: 11, padding: "8px 14px", borderRadius: 2, border: `1px solid ${filter === f ? T.brand : T.b1}`, background: filter === f ? T.brand + "18" : "transparent", color: filter === f ? T.violet : T.muted, cursor: "pointer", textTransform: "capitalize" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, ...mono, fontSize: 11, color: T.muted }}>
        <span>{filtered.length} repos</span>
        <span>{filtered.filter(r => !r.isPrivate).length} public</span>
        <span>{filtered.filter(r => r.isPrivate).length} private</span>
      </div>

      {/* Repo grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {filtered.map(repo => (
          <div key={repo.id} style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 4, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <a href={repo.htmlUrl} target="_blank" rel="noreferrer"
                  style={{ ...head, fontSize: 13, color: T.cyan, textDecoration: "none" }}>{repo.name}</a>
                <div style={{ ...mono, fontSize: 10, color: T.muted, marginTop: 2 }}>{repo.owner}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {repo.isPrivate && (
                  <span style={{ ...mono, fontSize: 9, color: T.amber, background: T.amber + "15", padding: "2px 5px", borderRadius: 2 }}>PRIVATE</span>
                )}
              </div>
            </div>
            {repo.description && (
              <div style={{ ...mono, fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{repo.description.slice(0, 80)}{repo.description.length > 80 ? "…" : ""}</div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 12, ...mono, fontSize: 10, color: T.muted }}>
              {repo.language && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: LANG_C[repo.language] ?? LANG_C.default }} />
                  {repo.language}
                </span>
              )}
              {repo.stars > 0 && <span>★ {repo.stars}</span>}
              <span>{timeAgo(repo.updatedAt)}</span>
            </div>
            {/* Actions */}
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <a href={`/dashboard?view=pulls&repo=${repo.fullName}`}
                style={{ flex: 1, ...mono, fontSize: 10, textAlign: "center", padding: "5px 0", borderRadius: 2, background: T.brand + "18", color: T.violet, textDecoration: "none", border: `1px solid ${T.brand}30` }}>
                View PRs
              </a>
              <a href={`/dashboard?view=scans&repo=${repo.fullName}`}
                style={{ flex: 1, ...mono, fontSize: 10, textAlign: "center", padding: "5px 0", borderRadius: 2, background: "transparent", color: T.muted, textDecoration: "none", border: `1px solid ${T.b1}` }}>
                Scan
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, ...mono, fontSize: 12, color: T.muted }}>
          No repositories found
        </div>
      )}
    </div>
  );
}
