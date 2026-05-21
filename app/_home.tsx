"use client";

import Link from "next/link";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import SiteNav from "@/components/SiteNav";
import { ShimmerIcon } from "@/components/ShimmerIcon";
import type { IconType } from "@/components/ShimmerIcon";

/* ─── Dot-grid helper ────────────────────────────────── */
const dotBg = {
  backgroundImage: "radial-gradient(#232426 1px, transparent 1px)",
  backgroundSize: "16px 16px",
} as const;

/* ─── Interactive Hero Dashboard ─────────────────────── */
type HeroView = "command" | "scans" | "fixes" | "verified" | "keys" | "reports";

const SIDEBAR_ITEMS: { icon: IconType; label: string; view: HeroView }[] = [
  { icon: "command",  label: "Command",  view: "command"  },
  { icon: "scans",    label: "Scans",    view: "scans"    },
  { icon: "fixes",    label: "Fixes",    view: "fixes"    },
  { icon: "verified", label: "Verified", view: "verified" },
  { icon: "keys",     label: "API Keys", view: "keys"     },
  { icon: "reports",  label: "Reports",  view: "reports"  },
];

/* Center pane content per view */
function CenterPane({ view }: { view: HeroView }) {
  const SCAN_ROWS = [
    { file: "src/api/auth.ts",       lang: "ts", sev: "CRITICAL", sevC: "#ffb4ab", status: "Pending Fix",  statusC: "#ffb689" },
    { file: "src/db/queries.ts",     lang: "ts", sev: "HIGH",     sevC: "#ffb689", status: "Fix Ready",    statusC: "#50d8e9" },
    { file: "scripts/deploy.py",     lang: "py", sev: "MEDIUM",   sevC: "#bec2ff", status: "Pending",      statusC: "#9A9DA3" },
    { file: "internal/handler.go",   lang: "go", sev: "LOW",      sevC: "#c6c5d8", status: "Clean",        statusC: "#92f1ff" },
  ];

  if (view === "command") return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "ISSUES FOUND",  value: "47",     dot: "#ffb4ab", note: "3 critical · 8 high"  },
          { label: "FIXES APPLIED", value: "31",     dot: "#92f1ff", note: "66% fix rate"          },
          { label: "CODE QUALITY",  value: "87/100", dot: "#E5FD17", note: "↑ improving this week" },
        ].map(s => (
          <div key={s.label} className="bg-custom-card-bg border border-white/[0.05] rounded-xl p-4" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
            <div className="text-[10px] text-custom-text-muted font-mono-data font-bold uppercase tracking-widest mb-2">{s.label}</div>
            <div className="flex items-center gap-2 font-h3 text-h3 text-on-surface font-bold tracking-tight">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.dot }} />
              {s.value}
            </div>
            <div className="text-[11px] text-custom-text-muted mt-1">{s.note}</div>
          </div>
        ))}
      </div>
      {/* Pipeline strip */}
      <div className="bg-custom-card-bg border border-white/[0.05] rounded-xl p-4" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
        <div className="text-[10px] text-custom-text-muted font-mono-data uppercase tracking-widest mb-3">Active Pipeline</div>
        <div className="flex items-center gap-0">
          {[
            { label: "Safety Gate", color: "#ffb689" },
            { label: "Triage",      color: "#50d8e9" },
            { label: "Fix Agent",   color: "#92f1ff" },
            { label: "Verify",      color: "#bec2ff" },
          ].map((p, i) => (
            <div key={p.label} className="flex items-center flex-1">
              <div className="flex-1 rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-1.5 h-1.5 rounded-full mx-auto mb-1" style={{ background: p.color }} />
                <div className="text-[10px] font-mono-data font-semibold" style={{ color: p.color }}>{p.label}</div>
              </div>
              {i < 3 && <span className="text-custom-text-muted px-1 text-[10px]">→</span>}
            </div>
          ))}
        </div>
      </div>
      {/* Launch card */}
      <div className="bg-custom-card-bg border border-custom-btn-primary/30 rounded-xl p-4" style={{ background: "rgba(94,107,255,0.06)" }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-h4 text-on-surface font-bold mb-1">Ready to scan</div>
            <div className="text-[12px] text-custom-text-muted font-mono-data">Run <code className="text-secondary bg-secondary/10 px-1.5 py-0.5 rounded text-[11px]">sork scan --path ./src</code> or launch from here</div>
          </div>
          <button className="bg-custom-btn-primary text-white px-4 py-2 rounded-lg text-label-sm font-bold uppercase tracking-wider transition-all hover:brightness-110">⚡ Launch</button>
        </div>
      </div>
    </div>
  );

  if (view === "scans") return (
    <div className="animate-fade-in">
      <div className="bg-custom-card-bg border border-white/[0.05] rounded-xl overflow-hidden" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-custom-divider-light">
          <div className="text-[10px] font-mono-data font-bold text-on-surface uppercase tracking-widest">Scan Queue</div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-[10px] text-secondary font-mono-data uppercase tracking-widest">LIVE</span>
          </div>
        </div>
        <table className="w-full text-[12px] font-mono-data">
          <thead>
            <tr className="border-b border-custom-divider-light" style={{ background: "#0a0a0b" }}>
              {["", "File", "Lang", "Severity", "Status", ""].map(h => (
                <th key={h} className="px-4 py-2 text-left text-[9px] text-custom-text-muted uppercase tracking-widest font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCAN_ROWS.map((r, i) => (
              <tr key={i} data-demo={`scan-row-${i}`} className="border-b border-custom-divider-light transition-colors hover:bg-white/[0.02]"
                style={{ borderLeft: i === 0 ? "2px solid #5E6BFF" : "2px solid transparent" }}>
                <td className="px-3 py-2.5"><span className="w-1.5 h-1.5 rounded-full block" style={{ background: r.sevC }} /></td>
                <td className="px-3 py-2.5 text-on-surface font-medium">{r.file}</td>
                <td className="px-3 py-2.5"><span className="bg-custom-divider text-custom-text-muted px-1.5 py-0.5 rounded text-[9px] uppercase">{r.lang}</span></td>
                <td className="px-3 py-2.5 text-[9px] font-bold uppercase" style={{ color: r.sevC }}>{r.sev}</td>
                <td className="px-3 py-2.5 text-[10px]" style={{ color: r.statusC }}>{r.status}</td>
                <td className="px-3 py-2.5 text-custom-btn-primary text-[10px] cursor-pointer hover:underline" data-demo={`scan-review-${i}`}>Review →</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (view === "fixes") return (
    <div className="flex flex-col gap-3 animate-fade-in">
      {[
        { file: "src/api/auth.ts:47", cwe: "CWE-89", title: "SQL Injection", score: 98, patch: `- const q = "SELECT * FROM users WHERE id=" + id;\n+ const q = db.prepare("SELECT * FROM users WHERE id=?").get(id);`, color: "#ffb4ab" },
        { file: "src/db/queries.ts:12", cwe: "CWE-476", title: "Null Dereference", score: 91, patch: `- const user = getUser(id);\n- return user.email;\n+ const user = getUser(id);\n+ return user?.email ?? null;`, color: "#ffb689" },
      ].map((fix, i) => (
        <div key={i} className="bg-custom-card-bg border border-white/[0.05] rounded-xl overflow-hidden" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-custom-divider-light">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono-data font-bold" style={{ color: fix.color }}>{fix.cwe}</span>
              <span className="text-[12px] text-on-surface font-semibold">{fix.title}</span>
              <span className="text-[10px] text-custom-text-muted font-mono-data">{fix.file}</span>
            </div>
            <span className="text-[10px] font-mono-data text-secondary">confidence {fix.score}%</span>
          </div>
          <pre className="p-3 text-[11px] font-mono-data leading-relaxed overflow-x-auto" style={{ background: "#070708", color: "#9A9DA3" }}>
            {fix.patch.split("\n").map((line, j) => (
              <div key={j} style={{ color: line.startsWith("+") ? "#92f1ff" : line.startsWith("-") ? "#ffb4ab" : "#9A9DA3" }}>{line}</div>
            ))}
          </pre>
          <div className="flex gap-2 px-4 py-3 border-t border-custom-divider-light">
            <button data-demo={`fix-apply-${i}`} className="flex-1 bg-custom-btn-primary text-white py-2 rounded-lg text-label-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all">✓ Apply Fix</button>
            <button className="flex-1 border border-custom-divider text-on-surface-variant py-2 rounded-lg text-label-sm font-bold uppercase tracking-wider hover:bg-white/[0.04] transition-all">✗ Reject</button>
          </div>
        </div>
      ))}
    </div>
  );

  if (view === "verified") return (
    <div className="flex flex-col gap-3 animate-fade-in">
      <div className="bg-custom-card-bg border border-white/[0.05] rounded-xl p-4" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
        <div className="text-[10px] text-custom-text-muted font-mono-data uppercase tracking-widest mb-3">Verified Fixes — Deploy Ready</div>
        {[
          { file: "src/api/auth.ts",   cwe: "CWE-89",  score: 98, label: "SQL Injection fixed"     },
          { file: "internal/main.go",  cwe: "CWE-476", score: 94, label: "Null crash eliminated"   },
          { file: "utils/parser.py",   cwe: "CWE-22",  score: 88, label: "Path traversal resolved" },
        ].map((v, i) => (
          <div key={i} data-demo={`verified-item-${i}`} className="flex items-center gap-4 py-3 border-b border-custom-divider-light last:border-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[13px] font-bold font-mono-data flex-shrink-0"
              style={{ background: "rgba(146,241,255,0.08)", border: "1px solid rgba(146,241,255,0.15)", color: "#92f1ff" }}>
              {v.score}
            </div>
            <div className="flex-1">
              <div className="text-[13px] text-on-surface font-medium">{v.label}</div>
              <div className="text-[10px] text-custom-text-muted font-mono-data mt-0.5">{v.file} · {v.cwe}</div>
            </div>
            <span className="text-[10px] font-bold text-secondary font-mono-data uppercase bg-secondary/10 px-2 py-1 rounded">CLEAN</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (view === "keys") return (
    <div className="flex flex-col gap-3 animate-fade-in">
      <div className="bg-custom-card-bg border border-white/[0.05] rounded-xl p-4" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] text-custom-text-muted font-mono-data uppercase tracking-widest">License Keys</div>
          <button className="text-[10px] text-custom-btn-primary font-mono-data font-bold uppercase hover:underline">+ New Key</button>
        </div>
        {[
          { name: "prod-key-01",  key: "SORK-••••••••••••9f3a", status: "ok",     usage: "2,841 scans" },
          { name: "dev-key-02",   key: "SORK-••••••••••••b12c", status: "ok",     usage: "198 scans"   },
          { name: "staging-key",  key: "SORK-••••••••••••44ee", status: "limited", usage: "12 scans"    },
        ].map((k, i) => (
          <div key={i} data-demo={`key-row-${i}`} className="flex items-center gap-4 py-2.5 border-b border-custom-divider-light last:border-0">
            <div className="flex-1">
              <div className="text-[12px] text-on-surface font-medium">{k.name}</div>
              <div className="text-[10px] text-custom-text-muted font-mono-data mt-0.5">{k.key}</div>
            </div>
            <div className="text-[10px] text-custom-text-muted font-mono-data">{k.usage}</div>
            <span className="text-[10px] font-bold font-mono-data uppercase px-2 py-1 rounded"
              style={{ color: k.status === "ok" ? "#92f1ff" : "#ffb689", background: k.status === "ok" ? "rgba(146,241,255,0.08)" : "rgba(255,182,137,0.08)" }}>
              {k.status}
            </span>
          </div>
        ))}
      </div>
      <div className="bg-custom-card-bg border border-white/[0.05] rounded-xl p-4">
        <div className="text-[10px] text-custom-text-muted font-mono-data uppercase tracking-widest mb-3">BYOK Credentials</div>
        {[
          { name: "Groq Key", provider: "Groq", status: "ok" },
          { name: "Cohere Key", provider: "Cohere", status: "ok" },
        ].map((b, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-custom-divider-light last:border-0">
            <div className="text-[12px] text-on-surface">{b.name} <span className="text-custom-text-muted text-[10px]">({b.provider})</span></div>
            <span className="text-[10px] text-secondary font-bold font-mono-data">● ACTIVE</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (view === "reports") return (
    <div className="flex flex-col gap-3 animate-fade-in">
      <div className="bg-custom-card-bg border border-white/[0.05] rounded-xl p-4" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] font-mono-data font-bold text-on-surface uppercase tracking-widest">7-Day Scan Activity</div>
          <div className="flex gap-3 text-[10px] text-custom-text-muted font-mono-data">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-secondary" />Scans</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-custom-btn-primary" />Fixes</span>
          </div>
        </div>
        <div data-demo="reports-chart" className="relative h-[120px]">
          <div className="absolute inset-0 flex flex-col justify-between py-1 opacity-10">
            {[0,1,2,3].map(i => <div key={i} className="border-t border-white w-full" />)}
          </div>
          <svg className="absolute bottom-0 w-full h-[90%]" preserveAspectRatio="none" viewBox="0 0 100 60">
            <defs>
              <linearGradient id="rpt-g1" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#50d8e9" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#50d8e9" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="rpt-g2" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#5E6BFF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#5E6BFF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,45 C15,40 25,48 40,30 C55,12 65,22 80,8 C90,0 95,5 100,2 L100,60 L0,60 Z" fill="url(#rpt-g1)" />
            <path d="M0,45 C15,40 25,48 40,30 C55,12 65,22 80,8 C90,0 95,5 100,2" fill="none" stroke="#50d8e9" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M0,55 C20,50 35,56 50,42 C65,28 80,38 100,22" fill="url(#rpt-g2)" />
            <path d="M0,55 C20,50 35,56 50,42 C65,28 80,38 100,22" fill="none" stroke="#5E6BFF" strokeWidth="1" strokeDasharray="2,2" />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
              <span key={d} className="text-[8px] text-custom-text-muted font-mono-data">{d}</span>
            ))}
          </div>
        </div>
      </div>
      {/* Health score card */}
      <div className="bg-custom-card-bg border border-white/[0.05] rounded-xl p-4">
        <div className="text-[10px] text-custom-text-muted font-mono-data uppercase tracking-widest mb-3">Project Health</div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-[22px] font-bold font-h3 text-on-surface flex-shrink-0"
            style={{ background: "conic-gradient(#92f1ff 0% 87%, rgba(255,255,255,0.05) 87% 100%)", padding: 3 }}>
            <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: "#101112" }}>87</div>
          </div>
          <div>
            <div className="text-[13px] text-on-surface font-semibold mb-1">Good — 87/100</div>
            <div className="text-[11px] text-custom-text-muted font-mono-data">0 critical · 2 high · 4 medium issues</div>
          </div>
        </div>
      </div>
    </div>
  );

  return null;
}

/* ─── Right Sork.ai panel ────────────────────────────── */
/* ─── Chat exchanges that auto-type in Sork.ai panel ─── */
const CHAT_EXCHANGES = [
  {
    cmd: "sork scan ./src",
    lines: [
      { t: "Scanning 47 files...",                          c: "#9A9DA3" },
      { t: "CRITICAL auth.ts:47 — SQL injection (CWE-89)", c: "#ffb4ab" },
      { t: "HIGH handler.go:34 — null dereference",        c: "#ffb689" },
      { t: "Blocking your commit. Run sork fix to patch.", c: "#bec2ff" },
    ],
  },
  {
    cmd: "sork fix auth.ts",
    lines: [
      { t: "Patch generated — 2 lines changed, nothing else.", c: "#9A9DA3" },
      { t: "Verify score: 98/100. Zero new vulnerabilities.",  c: "#92f1ff" },
      { t: "Your commit is now secure and error-free. ✓",     c: "#92f1ff" },
    ],
  },
  {
    cmd: "sork doctor",
    lines: [
      { t: "Health: 87/100 · 0 secrets exposed",         c: "#9A9DA3" },
      { t: "0 hallucinated APIs in AI-generated code ✓", c: "#92f1ff" },
      { t: "Last 7 commits: all passed SORK gate ✓",     c: "#bec2ff" },
    ],
  },
  {
    cmd: "git push origin main",
    lines: [
      { t: "SORK gate running pre-push check...",    c: "#9A9DA3" },
      { t: "✓ No critical issues. ✓ No AI artifacts.", c: "#92f1ff" },
      { t: "Push approved. Your code ships clean.",  c: "#50d8e9" },
    ],
  },
];

function ChatTypingDemo() {
  const [exIdx,    setExIdx]    = useState(0);
  const [typed,    setTyped]    = useState("");
  const [lines,    setLines]    = useState<{ t: string; c: string }[]>([]);
  const [showResp, setShowResp] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    async function run() {
      const ex = CHAT_EXCHANGES[exIdx];
      setTyped(""); setLines([]); setShowResp(false);
      await sleep(400);

      // type command char by char
      for (let i = 1; i <= ex.cmd.length; i++) {
        if (cancelled) return;
        setTyped(ex.cmd.slice(0, i));
        await sleep(42 + Math.random() * 28);
      }
      await sleep(360);
      if (cancelled) return;
      setShowResp(true);

      // reveal response lines one by one
      for (let i = 0; i < ex.lines.length; i++) {
        if (cancelled) return;
        await sleep(320);
        setLines(prev => [...prev, ex.lines[i]]);
      }
      await sleep(2400);
      if (!cancelled) setExIdx(i => (i + 1) % CHAT_EXCHANGES.length);
    }

    run();
    return () => { cancelled = true; };
  }, [exIdx]);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#070708", border: "1px solid #1B1C1E" }}>
      {/* terminal bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-custom-divider-light">
        <span className="w-2 h-2 rounded-full" style={{ background: "#ffb4ab" }} />
        <span className="w-2 h-2 rounded-full" style={{ background: "#ffb689" }} />
        <span className="w-2 h-2 rounded-full" style={{ background: "#92f1ff" }} />
        <span className="ml-2 text-[9px] text-custom-text-muted font-mono-data">sork — terminal</span>
      </div>
      <div className="p-3 font-mono-data text-[11px] leading-relaxed min-h-[96px]">
        {/* prompt line */}
        <div className="flex items-center gap-1.5 mb-1">
          <span style={{ color: "#50d8e9" }}>$</span>
          <span style={{ color: "#e5e2e3" }}>{typed}</span>
          <span className="inline-block w-[6px] h-[12px] animate-pulse" style={{ background: "#50d8e9", opacity: showResp ? 0 : 1 }} />
        </div>
        {/* response lines */}
        {showResp && lines.map((l, i) => (
          <div key={i} className="flex items-start gap-1.5 animate-fade-in" style={{ color: l.c }}>
            <span style={{ color: "#454655", flexShrink: 0 }}>→</span>
            <span>{l.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SorkPanel({ view }: { view: HeroView }) {
  const topCard: Record<HeroView, { title: string; body: string }> = {
    command:  { title: "Recommended Action", body: "Fix auth.ts:47 SQL injection before next deploy — this would have shipped a critical bug to prod." },
    scans:    { title: "Scan Summary",       body: "3 critical issues found. CWE-89 in auth.ts would break authentication on next commit." },
    fixes:    { title: "Patch Quality",      body: "Minimal diff — only 2 lines changed. Cohere memory matched this pattern from 3 weeks ago." },
    verified: { title: "Verify Gate",        body: "All 3 fixes scored ≥ 80/100. Zero residual issues. Commits are clean and deploy-ready." },
    keys:     { title: "Key Health",         body: "2 keys active. BYOK bypasses shared quota. Keys are AES-256-GCM encrypted at rest." },
    reports:  { title: "Weekly Insight",     body: "Scan velocity +34%. Quality score up +5%. 0 hallucinated APIs in AI-generated code." },
  };

  const blockCard: Record<HeroView, { label: string; body: string; cta: string; color: string }> = {
    command:  { label: "Blocking Fix",    body: "SQL injection in auth.ts:47 must be resolved before deploy.", cta: "✓ Apply Fix",   color: "#ffb689" },
    scans:    { label: "New Scan Ready",  body: "27 files queued. SORK will block your push if critical issues are found.", cta: "▶ Start Scan",  color: "#50d8e9" },
    fixes:    { label: "2 Fixes Pending", body: "CWE-89 and CWE-476 patches ready. Apply to make your next commit error-free.", cta: "Apply All",     color: "#92f1ff" },
    verified: { label: "Deploy Gate",     body: "3 fixes verified (score ≥ 80). Your commits are secure and ship-ready.",      cta: "Mark Deployed", color: "#92f1ff" },
    keys:     { label: "Key Expiring",    body: "staging-key near limit. All keys are encrypted — your credentials are safe.",  cta: "Manage Keys",  color: "#ffb689" },
    reports:  { label: "Health Report",   body: "Run sork doctor for full score breakdown and AI artifact detection.",          cta: "View Report",   color: "#bec2ff" },
  };

  const card = blockCard[view];
  const top  = topCard[view];

  return (
    <div className="w-[300px] bg-custom-panel border-l border-custom-divider flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-custom-divider-light flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span style={{ color: "#50d8e9", fontSize: 14 }}>⚡</span>
          <span className="font-mono-data text-[11px] uppercase tracking-widest font-bold text-on-surface">Sork.ai</span>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
      </div>

      {/* Top insight card */}
      <div className="px-4 pt-3 flex-shrink-0">
        <div className="text-[9px] text-custom-text-muted uppercase tracking-widest font-mono-data font-bold mb-1.5">{top.title}</div>
        <div className="text-[11px] text-on-surface leading-relaxed rounded-lg p-2.5 mb-3"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          {top.body}
        </div>
      </div>

      {/* Live typing terminal */}
      <div className="px-4 flex-shrink-0">
        <div className="text-[9px] text-custom-text-muted uppercase tracking-widest font-mono-data font-bold mb-1.5">Live Demo</div>
        <ChatTypingDemo />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Floating action card */}
      <div className="m-3 flex-shrink-0" style={{ background: "rgba(20,21,23,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
            style={{ background: `${card.color}18`, color: card.color }}>!</div>
          <span className="text-[10px] font-mono-data uppercase tracking-widest font-bold text-on-surface">{card.label}</span>
        </div>
        <div className="text-[11px] text-on-surface mb-2.5 leading-relaxed">{card.body}</div>
        <button className="w-full text-white py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:brightness-110"
          style={{ background: "#5E6BFF" }}>
          {card.cta}
        </button>
      </div>
    </div>
  );
}

/* ─── Demo steps ─────────────────────────────────────── */
type DemoStep = { target: string; view?: HeroView; pause: number; num: string; title: string; desc: string };

const DEMO_STEPS: DemoStep[] = [
  { target: "sidebar-scans",    view: "scans",    pause: 2200, num: "01", title: "sork scan",    desc: "Scans every file — finds SQL injection, null crashes, secrets, and 40+ vulnerability patterns before your commit." },
  { target: "scan-row-0",                         pause: 1800, num: "02", title: "Issue detected", desc: "CWE-89 SQL injection in auth.ts:47 — confidence 98%. This bug would have shipped to production on your next push." },
  { target: "sidebar-fixes",    view: "fixes",    pause: 2200, num: "03", title: "sork fix",     desc: "Generates a minimal secure patch — only the 2 vulnerable lines change. Your logic stays untouched." },
  { target: "fix-apply-0",                        pause: 2000, num: "04", title: "Apply patch",  desc: "Click Apply Fix — the diff is applied directly to your file. Commit is now error-free and ready to push." },
  { target: "sidebar-verified", view: "verified", pause: 2200, num: "05", title: "sork verify",  desc: "Re-scans the patched code. Verify score: 98/100. Zero new vulnerabilities introduced. Deploy-ready ✓" },
  { target: "sidebar-reports",  view: "reports",  pause: 2200, num: "06", title: "sork doctor",  desc: "Full health report: 0 secrets exposed, 0 AI hallucinations, quality score 87/100. Every commit is protected." },
  { target: "sidebar-keys",     view: "keys",     pause: 2000, num: "07", title: "API Keys",     desc: "Manage license keys and BYOK credentials. All keys stored AES-256-GCM encrypted — never exposed in logs." },
  { target: "sidebar-command",  view: "command",  pause: 2000, num: "08", title: "Done",         desc: "Scanned → Fixed → Verified. Every commit your team pushes goes through this pipeline automatically." },
];

/* ─── Full hero dashboard ────────────────────────────── */
function HeroDashboard() {
  const [view,       setView]      = useState<HeroView>("command");
  const [stepIdx,    setStepIdx]   = useState(-1);   // -1 = intro
  const [curX,       setCurX]      = useState(100);
  const [curY,       setCurY]      = useState(200);
  const [curVis,     setCurVis]    = useState(false);
  const [clicking,   setClicking]  = useState(false);
  const [highlight,  setHighlight] = useState("");   // data-demo target to glow
  const containerRef = useRef<HTMLDivElement>(null);

  function getPos(target: string) {
    if (!containerRef.current) return null;
    const el = containerRef.current.querySelector<HTMLElement>(`[data-demo="${target}"]`);
    if (!el) return null;
    const cr = containerRef.current.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    return { x: er.left - cr.left + er.width / 2, y: er.top - cr.top + er.height / 2 };
  }

  useEffect(() => {
    let cancelled = false;
    const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    async function runDemo() {
      await delay(1200);
      if (cancelled) return;
      setCurVis(true);

      // Start at sidebar-scans as initial cursor position
      const initPos = getPos("sidebar-command");
      if (initPos) { setCurX(initPos.x); setCurY(initPos.y); }

      let idx = 0;
      while (!cancelled) {
        const step = DEMO_STEPS[idx % DEMO_STEPS.length];

        // Ensure view is set before looking for content elements
        if (step.view) {
          setView(step.view);
          await delay(200);
        }

        const pos = getPos(step.target);
        if (!pos) { idx++; continue; }

        // Move cursor to target
        setHighlight("");
        setCurX(pos.x);
        setCurY(pos.y);
        await delay(520); // cursor travel
        if (cancelled) return;

        // Show step card + highlight
        setStepIdx(idx % DEMO_STEPS.length);
        setHighlight(step.target);

        // Click animation
        setClicking(true);
        await delay(180);
        setClicking(false);
        await delay(step.pause);

        idx++;
        if (idx % DEMO_STEPS.length === 0) {
          setHighlight("");
          setStepIdx(-1);
          setView("command");
          await delay(1000);
        }
      }
    }

    runDemo();
    return () => { cancelled = true; };
  }, []);

  const currentStep = stepIdx >= 0 ? DEMO_STEPS[stepIdx] : null;

  return (
    <div
      ref={containerRef}
      className="w-full flex h-[600px] bg-custom-card-bg rounded-xl overflow-hidden relative select-none"
      style={{ border: "1px solid rgba(255,255,255,0.05)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.7)" }}
    >

      {/* ── Cursor ── */}
      {curVis && (
        <div className="pointer-events-none absolute z-[60]" style={{
          left: curX, top: curY,
          transform: "translate(-4px, -3px)",
          transition: "left 500ms cubic-bezier(0.22,1,0.36,1), top 500ms cubic-bezier(0.22,1,0.36,1)",
        }}>
          {/* Glow behind cursor */}
          <div className="absolute rounded-full" style={{
            width: 28, height: 28, top: -10, left: -10,
            background: "rgba(94,107,255,0.18)",
            filter: "blur(6px)",
            opacity: clicking ? 1 : 0.5,
            transition: "opacity 0.2s",
          }} />
          {/* Arrow */}
          <svg width="24" height="30" viewBox="0 0 24 30" fill="none" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.9))" }}>
            <path d="M2 2L2 24L7.5 18L11.5 28L15 26.5L11 16.5L19 16.5Z" fill="white" stroke="#111" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          {/* Click ripple */}
          {clicking && (
            <div className="absolute rounded-full" style={{
              width: 36, height: 36, top: -14, left: -14,
              border: "2px solid rgba(94,107,255,0.8)",
              animation: "demoClick 0.45s ease-out forwards",
            }} />
          )}
        </div>
      )}

      {/* ── Sidebar ── */}
      <div className="w-[200px] bg-custom-sidebar border-r border-outline-variant flex flex-col flex-shrink-0">
        <div className="px-4 py-4 border-b border-custom-divider">
          <div className="font-h3 text-[13px] font-bold tracking-tight text-on-surface">OPERATIONS</div>
          <div className="font-mono-data text-[10px] text-on-surface-variant mt-1">v1.3.0-stable</div>
        </div>
        <div className="flex flex-col py-2">
          {SIDEBAR_ITEMS.map(item => {
            const active = view === item.view;
            const isHighlighted = highlight === `sidebar-${item.view}`;
            return (
              <button
                key={item.view}
                data-demo={`sidebar-${item.view}`}
                onClick={() => setView(item.view)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-left transition-all"
                style={{
                  borderRight: active ? "2px solid #50d8e9" : "2px solid transparent",
                  color:      active ? "#50d8e9" : "#c6c5d8",
                  background: isHighlighted ? "rgba(94,107,255,0.12)" : active ? "#1c1b1d" : "transparent",
                  boxShadow:  isHighlighted ? "inset 0 0 0 1px rgba(94,107,255,0.35)" : "none",
                  fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                <ShimmerIcon type={item.icon} active={active || isHighlighted} size={15} />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="mt-auto px-4 py-3 border-t border-custom-divider">
          <div className="font-mono-data text-[9px] text-custom-text-muted">sork.ai · always on</div>
        </div>
      </div>

      {/* ── Main pane ── */}
      <div className="flex-1 bg-[#0a0a0b] flex flex-col overflow-hidden relative">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-custom-divider-light flex-shrink-0" style={{ background: "#0c0c0d" }}>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="font-mono-data text-[10px] text-secondary uppercase tracking-widest font-bold">Pipeline Live</span>
          </div>
          <span className="font-mono-data text-[9px] text-custom-text-muted uppercase">LAST SCAN: <span className="text-on-surface">Just now</span></span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <CenterPane view={view} />
        </div>

        {/* ── Step tooltip card — appears over main pane ── */}
        {currentStep && (
          <div className="absolute bottom-4 left-4 right-4 z-40 pointer-events-none" style={{ animation: "stepCardIn 0.3s ease-out" }}>
            <div className="rounded-xl px-4 py-3" style={{
              background: "rgba(10,10,12,0.97)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(94,107,255,0.45)",
              boxShadow: "0 0 0 1px rgba(94,107,255,0.12), 0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(94,107,255,0.08)",
            }}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="font-mono-data text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: "rgba(94,107,255,0.2)", color: "#bec2ff", letterSpacing: "0.1em" }}>
                  STEP {currentStep.num}
                </span>
                <span className="font-mono-data text-[12px] font-bold text-on-surface">{currentStep.title}</span>
              </div>
              <p className="font-mono-data text-[11px] leading-relaxed" style={{ color: "#9A9DA3" }}>{currentStep.desc}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Sork.ai panel ── */}
      <SorkPanel view={view} />

      <style>{`
        @keyframes demoClick { 0% { transform:scale(0.3);opacity:1 } 100% { transform:scale(2.4);opacity:0 } }
        @keyframes stepCardIn { from { opacity:0;transform:translateY(8px) } to { opacity:1;transform:translateY(0) } }
      `}</style>
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────── */
export default function Page() {
  const { isSignedIn } = useUser();
  const y = new Date().getFullYear();

  return (
    <div className="bg-custom-bg text-on-surface min-h-screen font-body-md">
      <SiteNav />

      <main className="max-w-[1728px] mx-auto">

        {/* ── Hero ── */}
        <section className="px-8 relative pt-32 pb-20">
          <div className="max-w-[1516px] mx-auto">
            <div className="flex justify-between items-end mb-10 flex-wrap gap-6">
              <div>
                <h1 className="font-h1 text-on-surface mb-4 max-w-[900px]"
                  style={{ fontSize: "clamp(44px,5.5vw,76px)", lineHeight: "1.05", letterSpacing: "-0.055em", fontWeight: 520 }}>
                  The AI DevSecOps Engineer<br />for secure code delivery
                </h1>
                <p className="font-body-lg text-[18px] text-custom-text-muted mb-6 max-w-2xl leading-relaxed">
                  SORK scans, fixes, and verifies vulnerabilities across TypeScript, Python, Rust, Go, Java and more — powered by sork.ai.
                </p>
                <div className="flex gap-3 flex-wrap items-center">
                  {isSignedIn ? (
                    <Link href="/dashboard" className="bg-white text-black px-6 py-3 rounded-lg font-body-lg font-bold hover:bg-opacity-90 transition-colors">
                      Open Dashboard
                    </Link>
                  ) : (
                    <>
                      <SignUpButton mode="modal">
                        <button className="bg-white text-black px-6 py-3 rounded-lg font-body-lg font-bold cursor-pointer">Get started free</button>
                      </SignUpButton>
                      <Link href="/pricing"
                        className="border border-custom-divider text-on-surface px-6 py-3 rounded-lg font-body-lg hover:bg-custom-card-bg transition-colors">
                        View pricing
                      </Link>
                    </>
                  )}
                  <span className="text-[12px] text-custom-text-muted font-mono-data">No credit card · 14 free scans</span>
                </div>
              </div>
              <div className="hidden lg:block text-right pb-2">
                <Link href="/dashboard" className="text-custom-text-muted font-mono-data text-[13px] hover:text-primary flex items-center gap-1.5 transition-colors">
                  Live at sorkcloud.space/dashboard →
                </Link>
              </div>
            </div>
            <HeroDashboard />
            <p className="text-right text-[11px] text-custom-text-muted font-mono-data mt-2">
              Interactive preview · click any sidebar item to explore
            </p>
          </div>
        </section>

        {/* ── Platform metrics ── */}
        <section className="px-8 border-t border-custom-divider py-14">
          <div className="max-w-[1516px] mx-auto grid grid-cols-3 gap-4">
            {[
              { label: "Pipeline Uptime",     value: "99.9%", dot: "#50d8e9", note: "Groq + Render free tier"                    },
              { label: "Avg Scan Latency",    value: "1.8s",  dot: "#50d8e9", note: "p95 · llama-3.3-70b via Groq"               },
              { label: "Languages Supported", value: "9+",    dot: "#ffb4ab", note: "TS · JS · Python · Rust · Go · Java · more" },
            ].map(m => (
              <div key={m.label} className="bg-custom-card-bg border border-custom-divider-light rounded-xl p-5 relative overflow-hidden"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
                <span className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full" style={{ background: m.dot }} />
                <div className="text-[10px] text-on-surface-variant font-mono-data font-bold uppercase tracking-widest mb-2">{m.label}</div>
                <div className="font-h1 text-on-surface mb-1" style={{ fontSize: 32, letterSpacing: "-0.05em", fontWeight: 520 }}>{m.value}</div>
                <div className="text-[11px] text-custom-text-muted font-mono-data">{m.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Product principle ── */}
        <section id="features" className="px-8 border-t border-custom-divider py-24">
          <div className="max-w-[1516px] mx-auto">
            <h2 className="font-h2 text-center text-on-surface mb-4 max-w-3xl mx-auto"
              style={{ fontSize: "clamp(32px,4vw,52px)", lineHeight: "1.1", letterSpacing: "-0.05em", fontWeight: 520 }}>
              Security pipeline, simplified.
            </h2>
            <p className="text-center text-custom-text-muted text-[16px] mb-20 max-w-xl mx-auto">The architecture of a protected codebase — from first signal to verified fix.</p>

            <div className="grid grid-cols-3 gap-6">

              {/* ── FIG 0.1 — Triage Engine ── */}
              <div className="border border-custom-divider rounded-xl overflow-hidden bg-custom-bg flex flex-col">
                <div className="px-5 pt-5 pb-3">
                  <div className="font-mono-data text-[10px] text-custom-text-muted mb-3 uppercase tracking-widest">FIG 0.1 / TRIAGE ENGINE</div>
                </div>
                {/* Scan table mockup */}
                <div className="mx-5 mb-5 rounded-lg overflow-hidden flex-1" style={{ background: "#070708", border: "1px solid #1B1C1E" }}>
                  {/* header bar */}
                  <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "#1B1C1E", background: "#0a0a0b" }}>
                    <span className="font-mono-data text-[9px] text-custom-text-muted uppercase tracking-widest">Scan Queue — ./src</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                      <span className="font-mono-data text-[9px] text-secondary">LIVE</span>
                    </div>
                  </div>
                  {/* rows */}
                  {[
                    { file: "api/auth.ts:47",    sev: "CRITICAL", cwe: "CWE-89",  lang: "ts", c: "#ffb4ab", bg: "rgba(255,180,171,0.06)" },
                    { file: "handler.go:34",      sev: "HIGH",     cwe: "CWE-476", lang: "go", c: "#ffb689", bg: "transparent" },
                    { file: "utils/parser.py:88", sev: "MEDIUM",   cwe: "CWE-22",  lang: "py", c: "#bec2ff", bg: "transparent" },
                    { file: "lib/crypto.ts:5",    sev: "LOW",      cwe: "CWE-326", lang: "ts", c: "#9A9DA3", bg: "transparent" },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2.5 border-b font-mono-data text-[11px]"
                      style={{ borderColor: "#1B1C1E", background: r.bg, borderLeft: i === 0 ? "2px solid #5E6BFF" : "2px solid transparent" }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.c }} />
                      <span className="text-on-surface flex-1 truncate">{r.file}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase flex-shrink-0" style={{ color: r.c, background: r.c + "18" }}>{r.sev}</span>
                      <span className="text-custom-text-muted text-[9px] flex-shrink-0">{r.cwe}</span>
                    </div>
                  ))}
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="font-mono-data text-[9px] text-custom-text-muted">4 issues · 47 files scanned</span>
                    <span className="font-mono-data text-[9px]" style={{ color: "#50d8e9" }}>SCAN_ACTIVE</span>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <div className="font-h4 text-on-surface font-bold mb-1.5" style={{ fontSize: 17 }}>Intelligent Detection</div>
                  <p className="text-[13px] text-custom-text-muted leading-relaxed">40+ language-specific patterns. CWE IDs, confidence scores, fix hints — TypeScript, Python, Rust, Go, Java and more.</p>
                </div>
              </div>

              {/* ── FIG 0.2 — Fix Pipeline ── */}
              <div className="border border-custom-divider rounded-xl overflow-hidden bg-custom-bg flex flex-col">
                <div className="px-5 pt-5 pb-3">
                  <div className="font-mono-data text-[10px] text-custom-text-muted mb-3 uppercase tracking-widest">FIG 0.2 / FIX PIPELINE</div>
                </div>
                {/* Diff view mockup */}
                <div className="mx-5 mb-5 rounded-lg overflow-hidden flex-1" style={{ background: "#070708", border: "1px solid #1B1C1E" }}>
                  <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "#1B1C1E", background: "#0a0a0b" }}>
                    <span className="font-mono-data text-[9px] text-custom-text-muted">api/auth.ts · CWE-89 · confidence 98%</span>
                    <span className="font-mono-data text-[9px]" style={{ color: "#92f1ff" }}>PATCH_READY</span>
                  </div>
                  {/* diff lines */}
                  <div className="p-3 font-mono-data text-[11px] leading-relaxed">
                    <div className="text-custom-text-muted mb-2 text-[9px] uppercase tracking-widest">@@ auth.ts:47 @@</div>
                    {[
                      { sign: "−", code: 'const q = "SELECT * FROM users"', sub: '+ " WHERE id=" + id;', c: "#ffb4ab", bg: "rgba(255,180,171,0.08)" },
                      { sign: "+", code: "const q = db.prepare(", sub: '"SELECT * FROM users WHERE id=?").get(id);', c: "#92f1ff", bg: "rgba(146,241,255,0.07)" },
                    ].map((l, i) => (
                      <div key={i} className="flex gap-2 px-2 py-1 rounded mb-1" style={{ background: l.bg }}>
                        <span className="flex-shrink-0 font-bold" style={{ color: l.c }}>{l.sign}</span>
                        <span style={{ color: l.c + "cc" }}>{l.code}<span style={{ color: l.c + "88" }}>{l.sub}</span></span>
                      </div>
                    ))}
                    <div className="mt-3 pt-2 border-t flex items-center gap-3" style={{ borderColor: "#1B1C1E" }}>
                      <span className="font-mono-data text-[9px] text-custom-text-muted">2 lines changed</span>
                      <span className="font-mono-data text-[9px] text-custom-text-muted">·</span>
                      <span className="font-mono-data text-[9px]" style={{ color: "#92f1ff" }}>minimal diff ✓</span>
                      <span className="font-mono-data text-[9px] text-custom-text-muted">·</span>
                      <span className="font-mono-data text-[9px]" style={{ color: "#bec2ff" }}>memory context applied</span>
                    </div>
                  </div>
                  <div className="px-3 pb-3 flex gap-2">
                    <div className="flex-1 text-center py-1.5 rounded font-mono-data text-[10px] font-bold" style={{ background: "#5E6BFF", color: "white" }}>✓ Apply Fix</div>
                    <div className="flex-1 text-center py-1.5 rounded font-mono-data text-[10px]" style={{ border: "1px solid #232426", color: "#9A9DA3" }}>✗ Reject</div>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <div className="font-h4 text-on-surface font-bold mb-1.5" style={{ fontSize: 17 }}>Context-Aware Patches</div>
                  <p className="text-[13px] text-custom-text-muted leading-relaxed">Minimal-diff patches by sork.ai — only the vulnerable lines change. Cohere hybrid memory keeps fixes consistent with your codebase.</p>
                </div>
              </div>

              {/* ── FIG 0.3 — Verify Cycle ── */}
              <div className="border border-custom-divider rounded-xl overflow-hidden bg-custom-bg flex flex-col">
                <div className="px-5 pt-5 pb-3">
                  <div className="font-mono-data text-[10px] text-custom-text-muted mb-3 uppercase tracking-widest">FIG 0.3 / VERIFY CYCLE</div>
                </div>
                {/* Verify score mockup */}
                <div className="mx-5 mb-5 rounded-lg overflow-hidden flex-1" style={{ background: "#070708", border: "1px solid #1B1C1E" }}>
                  <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "#1B1C1E", background: "#0a0a0b" }}>
                    <span className="font-mono-data text-[9px] text-custom-text-muted">api/auth.ts · post-patch re-scan</span>
                    <span className="font-mono-data text-[9px]" style={{ color: "#bec2ff" }}>VERIFIED_OK</span>
                  </div>
                  {/* score ring + checks */}
                  <div className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      {/* score circle */}
                      <div className="relative flex-shrink-0" style={{ width: 64, height: 64 }}>
                        <svg width="64" height="64" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="26" fill="none" stroke="#1B1C1E" strokeWidth="5"/>
                          <circle cx="32" cy="32" r="26" fill="none" stroke="#92f1ff" strokeWidth="5"
                            strokeDasharray={`${2 * Math.PI * 26 * 0.98} ${2 * Math.PI * 26}`}
                            strokeLinecap="round" transform="rotate(-90 32 32)"/>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-mono-data text-[16px] font-bold" style={{ color: "#92f1ff", lineHeight: 1 }}>98</span>
                          <span className="font-mono-data text-[8px] text-custom-text-muted">/100</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-mono-data text-[13px] font-bold text-on-surface mb-1">Verify Passed</div>
                        <div className="font-mono-data text-[10px] text-custom-text-muted">threshold 80 · auto-approved</div>
                      </div>
                    </div>
                    {[
                      { label: "Original issue resolved",      ok: true  },
                      { label: "No new vulnerabilities",       ok: true  },
                      { label: "Logic semantically equivalent",ok: true  },
                      { label: "Ready to deploy",              ok: true  },
                    ].map(c => (
                      <div key={c.label} className="flex items-center gap-2.5 py-1.5 border-b font-mono-data text-[11px]" style={{ borderColor: "#1B1C1E" }}>
                        <span className="flex-shrink-0 font-bold" style={{ color: c.ok ? "#92f1ff" : "#ffb4ab" }}>{c.ok ? "✓" : "✗"}</span>
                        <span style={{ color: c.ok ? "#c6c5d8" : "#ffb4ab" }}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <div className="font-h4 text-on-surface font-bold mb-1.5" style={{ fontSize: 17 }}>Automated Auditing</div>
                  <p className="text-[13px] text-custom-text-muted leading-relaxed">Score 0–100. Confirms every fix resolves the issue without introducing new vulnerabilities. Threshold 80 = auto-approved for deploy.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Scan. Fix. Verify (signals → focus) ── */}
        <section className="px-8 border-t border-custom-divider py-20">
          <div className="max-w-[1516px] mx-auto grid grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="font-h2 text-on-surface mb-5"
                style={{ fontSize: "clamp(32px,4vw,52px)", lineHeight: "1.1", letterSpacing: "-0.05em", fontWeight: 520 }}>
                One scan.<br />Full visibility.
              </h2>
              <p className="text-[18px] text-custom-text-muted leading-relaxed">
                SORK aggregates every vulnerability signal across all your files into a single structured queue. Severity, confidence, CWE ID — no noise, just what needs fixing.
              </p>
            </div>
            {/* Mockup card */}
            <div className="relative h-[500px] w-full">
              <div className="absolute inset-0 bg-[#0a0a0b] border border-custom-divider rounded-xl overflow-hidden p-4">
                <div className="font-mono-data text-[10px] text-custom-text-muted mb-3 border-b border-custom-divider pb-2 uppercase tracking-widest">Scan Queue — ./src</div>
                <div className="space-y-0">
                  {[
                    { file: "api/auth.ts:47",     sev: "CRITICAL", cwe: "CWE-89",  lang: "ts", c: "#ffb4ab" },
                    { file: "routes/admin.ts:12",  sev: "HIGH",     cwe: "CWE-287", lang: "ts", c: "#ffb689" },
                    { file: "utils/parser.py:88",  sev: "HIGH",     cwe: "CWE-22",  lang: "py", c: "#ffb689" },
                    { file: "internal/main.go:34", sev: "MEDIUM",   cwe: "CWE-476", lang: "go", c: "#bec2ff" },
                    { file: "lib/crypto.ts:5",     sev: "LOW",      cwe: "CWE-326", lang: "ts", c: "#c6c5d8" },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 border-b border-custom-divider-light last:border-0"
                      style={{ borderLeft: i === 0 ? "2px solid #5E6BFF" : "2px solid transparent", paddingLeft: 8 }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.c }} />
                      <span className="font-mono-data text-[12px] text-on-surface flex-1">{r.file}</span>
                      <span className="text-[9px] bg-custom-divider text-custom-text-muted px-1.5 py-0.5 rounded uppercase font-mono-data">{r.lang}</span>
                      <span className="text-[9px] font-bold font-mono-data uppercase" style={{ color: r.c }}>{r.sev}</span>
                      <span className="text-[9px] text-custom-text-muted font-mono-data">{r.cwe}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating signal card */}
              <div className="absolute -left-10 top-1/3 w-72 rounded-xl p-4 z-10 shadow-2xl"
                style={{ background: "rgba(16, 17, 18, 0.92)", backdropFilter: "blur(20px)", border: "1px solid #232426" }}>
                <div className="text-label-sm font-bold text-on-surface mb-2 flex items-center gap-2">
                  <span className="text-custom-btn-primary">⚡</span> Fix Thread
                </div>
                <div className="text-[13px] text-custom-text-muted mb-3 leading-relaxed">auth.ts:47 SQL injection — patch generated with 98% confidence.</div>
                <div className="flex gap-2">
                  <button className="bg-custom-divider text-on-surface px-3 py-1.5 rounded-lg text-label-sm font-bold hover:bg-custom-card-bg transition-colors">Skip</button>
                  <button className="bg-custom-btn-primary text-white px-3 py-1.5 rounded-lg text-label-sm font-bold hover:brightness-110 transition-all">Apply Fix</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Fix with context (CLI section) ── */}
        <section className="px-8 border-t border-custom-divider py-20">
          <div className="max-w-[1516px] mx-auto grid grid-cols-2 gap-24 items-center">
            {/* Left: CLI mockup */}
            <div className="relative h-[500px] order-2 md:order-1">
              <div className="absolute inset-0 bg-[#0a0a0b] border border-custom-divider rounded-xl overflow-hidden p-4">
                <div className="font-mono-data text-[10px] text-custom-text-muted mb-3 border-b border-custom-divider pb-2 uppercase tracking-widest">Timeline · Q3 → Q4</div>
                <div className="relative mt-4">
                  <div className="absolute top-4 left-0 w-full h-px bg-custom-divider" />
                  <div className="flex justify-between text-[10px] text-custom-text-muted font-mono-data mb-8 px-2">
                    {["Aug","Sep","Oct","Nov"].map(m => <span key={m}>{m}</span>)}
                  </div>
                  <div className="space-y-3 mt-2">
                    <div className="ml-[5%] w-[45%] h-8 bg-custom-divider rounded border border-custom-divider flex items-center px-3 text-[11px] text-on-surface font-mono-data">Auth hardening</div>
                    <div className="ml-[20%] w-[55%] h-8 bg-custom-divider rounded border border-custom-divider flex items-center px-3 text-[11px] text-on-surface font-mono-data">API audit</div>
                    <div className="ml-[35%] w-[45%] h-8 bg-custom-divider rounded border border-custom-divider flex items-center px-3 text-[11px] text-on-surface font-mono-data">Dependency sweep</div>
                  </div>
                </div>
              </div>
              {/* CLI card */}
              <div className="absolute -right-10 bottom-1/4 w-72 rounded-xl p-4 z-10 shadow-2xl"
                style={{ background: "rgba(16, 17, 18, 0.92)", backdropFilter: "blur(20px)", border: "1px solid #232426" }}>
                <div className="text-label-sm font-bold text-on-surface mb-2 flex items-center gap-2">
                  <span className="text-secondary">🔍</span> CLI Queue
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[12px] border-b border-custom-divider pb-2">
                    <span className="text-on-surface font-mono-data">sork fix auth.ts</span>
                    <button className="text-custom-btn-primary text-label-sm font-bold hover:underline">Run</button>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-on-surface font-mono-data">sork verify</span>
                    <button className="text-custom-btn-primary text-label-sm font-bold hover:underline">Run</button>
                  </div>
                </div>
              </div>
            </div>
            {/* Right: copy */}
            <div className="order-1 md:order-2">
              <h2 className="font-h2 text-on-surface mb-5"
                style={{ fontSize: "clamp(32px,4vw,52px)", lineHeight: "1.1", letterSpacing: "-0.05em", fontWeight: 520 }}>
                Fix with context.<br />Deploy with confidence.
              </h2>
              <p className="text-[18px] text-custom-text-muted leading-relaxed mb-6">
                sork.ai remembers your codebase. Every patch is informed by your previous fixes and your coding patterns — minimal diffs, maximum precision.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { cmd: "npm i -g sork-cli",       desc: "Install globally once"         },
                  { cmd: "sork config set-key <k>",  desc: "Add your SORK Cloud license"   },
                  { cmd: "sork scan",                desc: "Full project scan"             },
                  { cmd: "sork fix",                 desc: "Apply AI-generated patches"    },
                  { cmd: "sork verify",              desc: "Confirm fixes are clean"       },
                  { cmd: "sork guard",               desc: "Watch files in real time"      },
                  { cmd: "sork doctor",              desc: "Project health score 0–100"    },
                ].map(c => (
                  <div key={c.cmd} className="flex items-center gap-4">
                    <code className="bg-custom-card-bg border border-custom-divider-light rounded-lg px-3 py-1.5 text-[12px] text-secondary font-mono-data flex-shrink-0">{c.cmd}</code>
                    <span className="text-[12px] text-custom-text-muted">{c.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Core features ── */}
        <section className="px-8 border-t border-custom-divider py-20">
          <div className="max-w-[1516px] mx-auto">
            <h2 className="font-h2 text-on-surface mb-10"
              style={{ fontSize: "clamp(28px,3.5vw,44px)", lineHeight: "1.1", letterSpacing: "-0.05em", fontWeight: 520 }}>
              Core Features
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: "⚡", title: "Groq Acceleration",    desc: "Sub-second inference for all pipeline stages.",            color: "#ffb689" },
                { icon: "🛡", title: "Nemotron Guardrails",  desc: "Every request screened by NVIDIA Nemotron-3 safety gate.", color: "#50d8e9" },
                { icon: "🔑", title: "BYOK Support",          desc: "Add Groq, Claude, NVIDIA, OpenAI — AES-256-GCM encrypted.", color: "#ffb4ab" },
                { icon: "🧠", title: "Hybrid Memory",         desc: "Cohere embed-english-v3.0 with semantic + recency recall.", color: "#bec2ff" },
                { icon: "👁", title: "Real-time Guard",       desc: "sork guard watches every file save. 150ms feedback.",     color: "#92f1ff" },
                { icon: "📊", title: "Health Score",          desc: "sork doctor gives your project a 0–100 quality score.",   color: "#9A9DA3" },
              ].map(f => (
                <div key={f.title} className="bg-custom-card-bg border border-custom-divider-light rounded-xl p-5"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px]"
                      style={{ background: f.color + "18", border: `1px solid ${f.color}30` }}>{f.icon}</div>
                    <div className="font-h4 text-on-surface font-bold" style={{ fontSize: 15 }}>{f.title}</div>
                  </div>
                  <p className="text-[13px] text-custom-text-muted leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quotes ── */}
        <section className="px-8 border-t border-custom-divider bg-[#050505] py-20">
          <div className="max-w-[1516px] mx-auto grid grid-cols-5 gap-4">
            <div className="col-span-3 rounded-2xl p-10 flex flex-col justify-between h-[440px]" style={{ background: "#D1EBEB" }}>
              <p className="font-h2 text-black leading-tight max-w-2xl" style={{ fontSize: "clamp(20px,2.5vw,26px)", lineHeight: "1.4", letterSpacing: "-0.04em", fontWeight: 520 }}>
                "SORK gave our team a single source of truth. We caught 12 critical issues before our last launch — would have been a disaster."
              </p>
              <div>
                <div className="font-bold text-black text-[15px]">Arjun Mehta</div>
                <div className="text-black/70 text-[13px]">CTO, Kalvium</div>
              </div>
            </div>
            <div className="col-span-2 rounded-2xl p-10 flex flex-col justify-between h-[440px]" style={{ background: "#C4FF44" }}>
              <p className="text-black leading-tight" style={{ fontSize: "clamp(18px,2vw,22px)", lineHeight: "1.45", letterSpacing: "-0.03em", fontWeight: 520 }}>
                "Replaced three separate security tools and endless PR review cycles."
              </p>
              <div>
                <div className="font-bold text-black text-[15px]">Sarah Kim</div>
                <div className="text-black/70 text-[13px]">VP Engineering, Meridian</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="px-8 border-t border-custom-divider flex flex-col justify-center items-center text-center py-24">
          <h2 className="text-on-surface mb-6"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "clamp(44px,6vw,76px)", lineHeight: "1.05", letterSpacing: "-0.055em", fontWeight: 520 }}>
            Built for security.<br />Ready today.
          </h2>
          <div className="flex justify-center gap-3 flex-wrap">
            {isSignedIn ? (
              <Link href="/dashboard" className="bg-white text-black px-8 py-3.5 rounded-lg font-body-lg font-bold hover:bg-opacity-90 transition-colors">
                Open Dashboard
              </Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <button className="bg-white text-black px-8 py-3.5 rounded-lg font-body-lg font-bold cursor-pointer hover:bg-opacity-90 transition-colors">Start free trial</button>
                </SignUpButton>
                <Link href="/pricing" className="border border-custom-divider text-on-surface px-8 py-3.5 rounded-lg font-body-lg hover:bg-custom-card-bg transition-colors">
                  View pricing
                </Link>
              </>
            )}
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="bg-custom-sidebar border-t border-outline-variant px-8 pt-16 pb-10">
        <div className="max-w-[1728px] mx-auto grid grid-cols-6 gap-10 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-xl bg-custom-btn-primary/10 border border-custom-btn-primary/25 flex items-center justify-center">
                <span className="text-primary font-bold text-[13px]">S</span>
              </div>
              <span className="font-h3 text-[18px] font-bold text-on-surface tracking-tight" style={{ letterSpacing: "-0.04em" }}>SORK Cloud</span>
            </div>
            <p className="text-[13px] text-custom-text-muted max-w-[220px] leading-relaxed">The security pipeline for every codebase. Powered by sork.ai.</p>
          </div>
          {[
            { h: "Product",  links: [{ l:"Overview", h:"/#features" }, { l:"CLI", h:"/docs#cli" }, { l:"Pricing", h:"/pricing" }] },
            { h: "Platform", links: [{ l:"Docs", h:"/docs" }, { l:"API", h:"/docs#architecture" }, { l:"Status", h:"#" }] },
            { h: "Company",  links: [{ l:"About", h:"#" }, { l:"Blog", h:"#" }, { l:"Careers", h:"#" }] },
            { h: "Legal",    links: [{ l:"Privacy", h:"#" }, { l:"Terms", h:"#" }] },
          ].map(col => (
            <div key={col.h} className="flex flex-col gap-2.5">
              <div className="font-mono-data text-[10px] text-custom-text-muted uppercase tracking-widest mb-1">{col.h}</div>
              {col.links.map(l => (
                <Link key={l.l} href={l.h} className="text-[13px] text-on-surface hover:text-primary transition-colors">{l.l}</Link>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-custom-divider pt-6 flex justify-between items-center text-[12px] text-custom-text-muted font-mono-data">
          <span>Powered by Groq</span>
          <span>© {y} Sork Inc. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
