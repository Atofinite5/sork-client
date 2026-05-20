"use client";

import Link from "next/link";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";

/* ─── Design tokens (exact Romer system) ──────────────── */
const T = {
  bg:      "#070708",
  bgLow:   "#0e0e0f",
  card:    "#101112",
  cardAlt: "#151617",
  panel:   "#111214",
  b1:      "#1B1C1E",   // internal border
  b2:      "#232426",   // layout border
  b3:      "#454655",   // strong border
  text:    "#e5e2e3",
  textSub: "#c6c5d8",
  muted:   "#9A9DA3",
  outline: "#8f8fa1",
  brand:   "#5E6BFF",
  cyan:    "#50d8e9",
  violet:  "#bec2ff",
  amber:   "#ffb689",
  error:   "#ffb4ab",
  green:   "#92f1ff",
};

const FONT_H  = "'Manrope', sans-serif";
const FONT_UI = "'Inter', system-ui, sans-serif";
const FONT_M  = "'Inter', monospace";

/* ─── Animated terminal ───────────────────────────────── */
const SCAN_LINES = [
  { t: "$ sork scan --path ./src",     c: T.muted  },
  { t: "  Scanning 27 files...",       c: T.muted  },
  { t: "  [CRITICAL] auth.ts:47 SQL injection",  c: T.error  },
  { t: "  [HIGH]     routes.go:122 null crash",  c: T.amber  },
  { t: "  Generating patches...",      c: T.cyan   },
  { t: "  Verify: 2/2 fixes clean ✓", c: T.green  },
];

function Terminal() {
  const [n, setN] = useState(0);
  useEffect(() => {
    let i = 0;
    const run = () => {
      i++; setN(i);
      if (i < SCAN_LINES.length) setTimeout(run, 650);
      else setTimeout(() => { setN(0); i = 0; setTimeout(run, 500); }, 2800);
    };
    const t = setTimeout(run, 600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ background: T.bgLow, border: `1px solid ${T.b2}`, borderRadius: 4, overflow: "hidden", width: 340, boxShadow: "0 8px 32px rgba(0,0,0,0.7)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderBottom: `1px solid ${T.b1}`, background: T.card }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: T.error }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: T.amber }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: T.green }} />
        <span style={{ marginLeft: 8, fontSize: 11, color: T.b3, fontFamily: FONT_M }}>sork — terminal</span>
      </div>
      <div style={{ padding: "14px 16px", fontFamily: FONT_M, fontSize: 12, minHeight: 126, display: "flex", flexDirection: "column", gap: 5 }}>
        {SCAN_LINES.slice(0, n).map((l, i) => (
          <div key={i} style={{ color: l.c }}>{l.t}</div>
        ))}
        {n < SCAN_LINES.length && (
          <span style={{ display: "inline-block", width: 7, height: 13, background: T.cyan, animation: "blink .8s step-end infinite" }} />
        )}
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
}

/* ─── Hero Dashboard Mockup ───────────────────────────── */
function DashboardMockup() {
  const nav = [
    { icon: "⚡", label: "Command",    active: false },
    { icon: "🔍", label: "Scans",      active: true  },
    { icon: "🛠", label: "Fixes",      active: false },
    { icon: "✓",  label: "Verified",   active: false },
    { icon: "🔑", label: "API Keys",   active: false },
    { icon: "📄", label: "Reports",    active: false },
  ];

  const stats = [
    { label: "ISSUES FOUND",  value: "47",     dot: T.error, note: "3 critical · 8 high" },
    { label: "FIXES APPLIED", value: "31",     dot: T.green, note: "66% fix rate"        },
    { label: "CODE QUALITY",  value: "87/100", dot: "#E5FD17", note: "↑ improving"       },
  ];

  const scans = [
    { file: "src/api/auth.ts",    lang: "ts", sev: "CRITICAL", sevC: T.error,   status: "Pending Fix",  statusC: T.amber },
    { file: "src/db/queries.ts",  lang: "ts", sev: "HIGH",     sevC: T.amber,   status: "Fix Ready",    statusC: T.cyan  },
    { file: "scripts/deploy.py",  lang: "py", sev: "MEDIUM",   sevC: T.violet,  status: "Pending",      statusC: T.muted },
    { file: "internal/handler.go",lang: "go", sev: "LOW",      sevC: T.textSub, status: "Clean",        statusC: T.green },
  ];

  const pipeline = [
    { label: "Nemotron Safety", color: T.amber  },
    { label: "Triage Agent",    color: T.cyan   },
    { label: "Fix Agent",       color: T.green  },
    { label: "Verify Agent",    color: T.violet },
  ];

  return (
    <div style={{ width: "100%", display: "flex", height: 580, background: T.card, border: `1px solid rgba(255,255,255,0.05)`, borderRadius: 4, overflow: "hidden", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.7)" }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: T.bgLow, borderRight: `1px solid ${T.b3}`, display: "flex", flexDirection: "column", padding: "0 0 16px" }}>
        <div style={{ padding: "16px", borderBottom: `1px solid ${T.b2}`, marginBottom: 8 }}>
          <div style={{ fontFamily: FONT_H, fontWeight: 700, fontSize: 14, letterSpacing: "-0.02em" }}>OPERATIONS</div>
          <div style={{ fontFamily: FONT_M, fontSize: 11, color: T.textSub, marginTop: 2 }}>v1.3.0-stable</div>
        </div>
        {nav.map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 16px", borderRight: item.active ? `2px solid ${T.cyan}` : "none", color: item.active ? T.cyan : T.textSub, background: item.active ? "#1c1b1d" : "transparent", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontWeight: 500 }}>
            <span style={{ fontSize: 13 }}>{item.icon}</span>{item.label}
          </div>
        ))}
        <div style={{ marginTop: "auto", padding: "12px 8px 0", borderTop: `1px solid ${T.b2}` }}>
          <div style={{ background: T.brand, color: "#F0F1F2", borderRadius: 4, padding: "7px 16px", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", cursor: "pointer" }}>⚡ Launch Scanner</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, background: "#0a0a0b", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Page header */}
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${T.b1}`, background: T.card, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontFamily: FONT_H, fontSize: 28, fontWeight: 520, letterSpacing: "-0.05em", lineHeight: 1.1, marginBottom: 3 }}>Scans</h1>
            <p style={{ fontSize: 12, color: T.outline, fontFamily: FONT_M }}>Every security signal in one queue</p>
          </div>
          {/* Stats pills */}
          <div style={{ display: "flex", gap: 0, background: T.card, border: `1px solid ${T.b2}`, borderRadius: 4, padding: 6 }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ padding: "4px 12px", borderRight: i < 2 ? `1px solid ${T.b1}` : "none" }}>
                <div style={{ fontSize: 9, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3, fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontFamily: FONT_H, fontSize: 18, fontWeight: 520, letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block" }} />{s.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent pipeline strip */}
        <div style={{ display: "flex", alignItems: "center", padding: "8px 20px", borderBottom: `1px solid ${T.b1}`, background: "#0d0d0d", gap: 0 }}>
          <span style={{ fontSize: 10, color: T.muted, fontFamily: FONT_M, textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 16 }}>Pipeline</span>
          {pipeline.map((p, i) => (
            <div key={p.label} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.color, display: "inline-block" }} />
                <span style={{ fontSize: 10, color: p.color, fontFamily: FONT_M, fontWeight: 600 }}>{p.label}</span>
              </div>
              {i < pipeline.length - 1 && <span style={{ margin: "0 10px", color: T.b3, fontSize: 10 }}>→</span>}
            </div>
          ))}
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: T.cyan, fontFamily: FONT_M }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.cyan, display: "inline-block", animation: "blink 2s step-end infinite" }} />LIVE
          </span>
        </div>

        {/* Scan table */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 4, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: FONT_M }}>
              <thead>
                <tr style={{ background: T.cardAlt, borderBottom: `1px solid ${T.b1}` }}>
                  {["", "File", "Language", "Severity", "Agent Status", "Action"].map(h => (
                    <th key={h} style={{ padding: "7px 12px", textAlign: "left", fontSize: 9, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scans.map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.b1}`, background: i === 0 ? T.cardAlt : "transparent", borderLeft: i === 0 ? `2px solid ${T.brand}` : "none", height: 36, cursor: "pointer" }}>
                    <td style={{ padding: "0 12px", textAlign: "center" }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: r.sevC, display: "inline-block" }} /></td>
                    <td style={{ padding: "0 12px", color: T.text, fontWeight: i === 0 ? 500 : 400 }}>{r.file}</td>
                    <td style={{ padding: "0 12px" }}><span style={{ background: T.b2, color: T.textSub, padding: "2px 6px", borderRadius: 2, fontSize: 9, textTransform: "uppercase" }}>{r.lang}</span></td>
                    <td style={{ padding: "0 12px" }}><span style={{ color: r.sevC, fontSize: 9, textTransform: "uppercase", fontWeight: 600 }}>{r.sev}</span></td>
                    <td style={{ padding: "0 12px", color: r.statusC, fontSize: 10 }}>{r.status}</td>
                    <td style={{ padding: "0 12px" }}><span style={{ color: T.brand, fontSize: 10, cursor: "pointer" }}>Review →</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sork.ai panel */}
      <div style={{ width: 260, background: T.panel, borderLeft: `1px solid ${T.b2}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.b1}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ color: T.cyan, fontSize: 14 }}>⚡</span>
            <span style={{ fontSize: 11, fontFamily: FONT_M, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Sork.ai</span>
          </div>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.cyan, display: "inline-block", animation: "blink 2s step-end infinite" }} />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { title: "Recommended",   body: "Patch auth.ts:47 SQL injection before deploy — CWE-89, confidence 98%.", accent: T.violet },
            { title: "Signal Summary", body: "Code quality up +5% this week, but null crash risks emerging in new go routes.", accent: T.cyan  },
          ].map(item => (
            <div key={item.title}>
              <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500, marginBottom: 7, fontFamily: FONT_M }}>{item.title}</div>
              <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.05)`, borderRadius: 4, padding: 12, fontSize: 12, color: T.text, lineHeight: 1.6 }}>{item.body}</div>
            </div>
          ))}
          <div>
            <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500, marginBottom: 7, fontFamily: FONT_M }}>Decision Log</div>
            {[
              { a: "auth.ts patched",      t: "2m ago",  dot: T.violet },
              { a: "queries.ts verified",  t: "8m ago",  dot: "rgba(255,255,255,0.2)" },
              { a: "deploy.py clean",      t: "24m ago", dot: T.green  },
            ].map(l => (
              <div key={l.a} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: l.dot, marginTop: 4, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, color: T.text, fontWeight: 500 }}>{l.a}</div>
                  <div style={{ fontSize: 10, color: T.muted, fontFamily: FONT_M, marginTop: 1 }}>{l.t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Blocking fix card */}
        <div style={{ margin: 10, background: "rgba(20,21,23,0.9)", backdropFilter: "blur(20px)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 4, padding: 14, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(224,115,29,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: T.amber }}>!</div>
              <span style={{ fontSize: 10, fontFamily: FONT_M, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Blocking Fix</span>
            </div>
            <span style={{ fontSize: 9, color: T.muted, fontFamily: FONT_M, fontWeight: 700 }}>Critical</span>
          </div>
          <div style={{ fontSize: 12, color: T.text, marginBottom: 10, lineHeight: 1.55 }}>SQL injection in <code style={{ color: T.cyan, background: "rgba(80,216,233,0.1)", padding: "1px 4px", borderRadius: 2, fontSize: 11 }}>auth.ts:47</code> must be fixed before deploy.</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ flex: 1, background: T.brand, color: "#F0F1F2", borderRadius: 4, padding: "7px 0", fontSize: 11, fontWeight: 600, fontFamily: FONT_M, cursor: "pointer", border: "none" }}>✓ Apply Fix</button>
            <button style={{ flex: 1, background: "transparent", border: `1px solid ${T.b2}`, color: T.error, borderRadius: 4, padding: "7px 0", fontSize: 11, fontWeight: 600, fontFamily: FONT_M, cursor: "pointer" }}>✗ Reject</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────── */
export default function Page() {
  const { isSignedIn } = useUser();
  const y = new Date().getFullYear();

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: FONT_UI, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <header style={{ background: `${T.bgLow}dd`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.b3}`, position: "sticky", top: 0, zIndex: 50, height: 80 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1728, margin: "0 auto", padding: "0 32px", height: "100%" }}>
          <div style={{ fontFamily: FONT_H, fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em" }}>SORK</div>
          <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {[
              { label: "Platform",  href: "#features" },
              { label: "Docs",      href: "#" },
              { label: "Pricing",   href: "/pricing" },
              { label: "Changelog", href: "#" },
            ].map(l => (
              <Link key={l.label} href={l.href}
                style={{ fontSize: 14, color: T.textSub, textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = T.violet)}
                onMouseLeave={e => (e.currentTarget.style.color = T.textSub)}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {isSignedIn ? (
              <Link href="/dashboard" style={{ background: T.brand, color: "#F0F1F2", padding: "8px 16px", borderRadius: 4, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Dashboard</Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button style={{ background: "transparent", border: `1px solid ${T.b2}`, color: T.textSub, padding: "7px 16px", borderRadius: 4, fontSize: 14, cursor: "pointer" }}>Log in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button style={{ background: "#fff", color: "#000", padding: "8px 16px", borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none" }}>Start free</button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>

        {/* ── Hero ── */}
        <section style={{ maxWidth: 1728, margin: "0 auto", padding: "72px 32px 56px" }}>
          <div style={{ maxWidth: 1516, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
              <div style={{ maxWidth: 660 }}>
                <h1 style={{ fontFamily: FONT_H, fontSize: "clamp(40px,4.5vw,72px)", lineHeight: 1.05, letterSpacing: "-0.055em", fontWeight: 520, marginBottom: 16 }}>
                  The security pipeline<br />for every codebase
                </h1>
                <p style={{ fontSize: 18, color: T.muted, lineHeight: 1.65, marginBottom: 28, maxWidth: 520 }}>
                  SORK scans, fixes, and verifies vulnerabilities across TypeScript, Python, Rust, Go, Java and more — powered by Groq, guarded by Nemotron, remembered by Cohere.
                </p>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  {isSignedIn ? (
                    <Link href="/dashboard" style={{ background: "#fff", color: "#000", padding: "11px 24px", borderRadius: 4, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Open Dashboard</Link>
                  ) : (
                    <>
                      <SignUpButton mode="modal">
                        <button style={{ background: "#fff", color: "#000", padding: "11px 24px", borderRadius: 4, fontSize: 15, fontWeight: 700, cursor: "pointer", border: "none" }}>Get started free</button>
                      </SignUpButton>
                      <Link href="/pricing" style={{ background: T.card, border: `1px solid ${T.b2}`, color: T.text, padding: "11px 24px", borderRadius: 4, fontSize: 15, textDecoration: "none" }}>View pricing</Link>
                    </>
                  )}
                  <span style={{ fontSize: 12, color: T.muted, fontFamily: FONT_M }}>No credit card required</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                <Terminal />
                <span style={{ fontSize: 11, color: T.muted, fontFamily: FONT_M }}>sork scan — runs in your terminal</span>
              </div>
            </div>
            <DashboardMockup />
            <p style={{ textAlign: "right", fontSize: 11, color: T.muted, fontFamily: FONT_M, marginTop: 8 }}>
              Live at <Link href="/dashboard" style={{ color: T.violet, textDecoration: "none" }}>sorkcloud.space/dashboard</Link>
            </p>
          </div>
        </section>

        {/* ── Platform metrics ── */}
        <section style={{ borderTop: `1px solid ${T.b1}`, padding: "48px 32px" }}>
          <div style={{ maxWidth: 1516, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              { label: "Pipeline Uptime",    value: "99.9%",   dot: T.cyan,   note: "Groq + Render free tier" },
              { label: "Avg Scan Latency",   value: "1.8s",    dot: T.cyan,   note: "p95, llama-3.3-70b via Groq" },
              { label: "Languages Supported",value: "9+",      dot: T.error,  note: "TS · JS · Python · Rust · Go · Java · more" },
            ].map(m => (
              <div key={m.label} style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 4, padding: 20, position: "relative", overflow: "hidden", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
                <div style={{ position: "absolute", top: 14, right: 14, width: 6, height: 6, borderRadius: "50%", background: m.dot }} />
                <div style={{ fontSize: 10, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 500, fontFamily: FONT_M }}>{m.label}</div>
                <div style={{ fontFamily: FONT_H, fontSize: 32, fontWeight: 520, letterSpacing: "-0.05em", lineHeight: 1.1 }}>{m.value}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 5, fontFamily: FONT_M }}>{m.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="features" style={{ borderTop: `1px solid ${T.b1}`, padding: "64px 32px" }}>
          <div style={{ maxWidth: 1516, margin: "0 auto" }}>
            <h2 style={{ fontFamily: FONT_H, fontSize: "clamp(28px,3vw,44px)", lineHeight: 1.2, letterSpacing: "-0.05em", fontWeight: 520, textAlign: "center", marginBottom: 12 }}>
              Security pipeline, simplified.
            </h2>
            <p style={{ textAlign: "center", color: T.muted, fontSize: 16, marginBottom: 48, maxWidth: 500, margin: "0 auto 48px" }}>The architecture of a protected codebase — from first signal to verified fix.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {[
                {
                  fig: "FIG 0.1 / TRIAGE ENGINE",
                  title: "Intelligent Detection",
                  sub: "Triage",
                  icon: "🔍",
                  code: "SCAN_ACTIVE",
                  color: T.cyan,
                  desc: "40+ language-specific patterns. CWE IDs, confidence scores, fix hints. TypeScript, Python, Rust, Go, Java and more.",
                },
                {
                  fig: "FIG 0.2 / FIX PIPELINE",
                  title: "Context-Aware Patches",
                  sub: "Fix",
                  icon: "🛠",
                  code: "PATCH_READY",
                  color: T.green,
                  desc: "Minimal-diff patches generated by Groq llama-3.3-70b. Only changes what needs to change. No refactoring.",
                },
                {
                  fig: "FIG 0.3 / VERIFY CYCLE",
                  title: "Automated Auditing",
                  sub: "Verify",
                  icon: "✓",
                  code: "VERIFIED_OK",
                  color: T.violet,
                  desc: "Score 0–100. Confirms every fix resolves the issue without introducing new vulnerabilities before deploy.",
                },
              ].map((c, i) => (
                <div key={i} style={{ border: `1px solid ${T.b2}`, borderRadius: 4, padding: 24, background: T.bg, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 10, color: T.muted, marginBottom: 12, fontFamily: FONT_M }}>{c.fig}</div>
                  <div style={{ height: 140, border: `1px solid ${T.b1}`, borderRadius: 4, background: "#0a0a0b", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", backgroundImage: "radial-gradient(#1B1C1E 1px, transparent 1px)", backgroundSize: "16px 16px", marginBottom: 16 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{c.icon}</div>
                      <div style={{ fontFamily: FONT_H, fontSize: 16, fontWeight: 520, color: c.color }}>{c.sub}</div>
                      <div style={{ fontSize: 9, color: T.b3, marginTop: 3, fontFamily: FONT_M }}>{c.code}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: FONT_H, fontSize: 16, fontWeight: 520, marginBottom: 6 }}>{c.title}</div>
                  <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, flex: 1 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Core features ── */}
        <section style={{ borderTop: `1px solid ${T.b1}`, padding: "64px 32px" }}>
          <div style={{ maxWidth: 1516, margin: "0 auto" }}>
            <h2 style={{ fontFamily: FONT_H, fontSize: "clamp(28px,3vw,44px)", lineHeight: 1.2, letterSpacing: "-0.05em", fontWeight: 520, marginBottom: 40 }}>Core Features</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {[
                { icon: "⚡", title: "Groq Acceleration",    desc: "Sub-second inference via llama-3.3-70b-versatile. No cold starts.", color: T.amber  },
                { icon: "🛡", title: "Nemotron Guardrails", desc: "Every request screened by NVIDIA Nemotron-3 before touching any API key.", color: T.cyan   },
                { icon: "🔑", title: "BYO Key / BYOK",       desc: "Add your own Groq, Claude, NVIDIA, OpenAI, or custom endpoint. AES-256-GCM encrypted.", color: T.error  },
                { icon: "🧠", title: "Hybrid Memory",        desc: "Cohere embed-english-v3.0 with semantic + recency memory. SORK remembers your codebase.", color: T.violet },
                { icon: "👁", title: "Real-time Guard",      desc: "sork guard watches every file save. Instant feedback in 150ms. Keep it running while you code.", color: T.green  },
                { icon: "📊", title: "Health Score",         desc: "sork doctor gives your project a 0–100 score with language breakdown and high-risk files.", color: T.textSub },
              ].map(f => (
                <div key={f.title} style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 4, padding: 20, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 4, background: f.color + "18", border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{f.icon}</div>
                    <div style={{ fontFamily: FONT_H, fontSize: 15, fontWeight: 520 }}>{f.title}</div>
                  </div>
                  <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CLI section ── */}
        <section style={{ borderTop: `1px solid ${T.b1}`, padding: "64px 32px" }}>
          <div style={{ maxWidth: 1516, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              <h2 style={{ fontFamily: FONT_H, fontSize: "clamp(28px,3vw,44px)", lineHeight: 1.2, letterSpacing: "-0.05em", fontWeight: 520, marginBottom: 14 }}>Runs everywhere you code</h2>
              <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.65, marginBottom: 28 }}>One npm install. Works in your terminal, your CI pipeline, and your VS Code tasks. Ship secure code without changing your workflow.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { cmd: "npm i -g sork-cli",              desc: "Install globally once" },
                  { cmd: "sork config set-key <key>",       desc: "Add your SORK Cloud key" },
                  { cmd: "sork scan",                       desc: "Scan entire project" },
                  { cmd: "sork guard",                      desc: "Watch files in real time" },
                  { cmd: "sork doctor",                     desc: "Project health report 0–100" },
                  { cmd: "sork send ./src/auth.ts",         desc: "Send file to dashboard" },
                ].map(c => (
                  <div key={c.cmd} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <code style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 4, padding: "5px 10px", fontSize: 12, color: T.cyan, fontFamily: FONT_M, flexShrink: 0 }}>{c.cmd}</code>
                    <span style={{ fontSize: 12, color: T.muted }}>{c.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* CLI mockup */}
            <div style={{ background: T.bgLow, border: `1px solid ${T.b2}`, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: `1px solid ${T.b1}`, background: T.card }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: T.error }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: T.amber }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: T.green }} />
                <span style={{ marginLeft: 8, fontSize: 11, color: T.b3, fontFamily: FONT_M }}>sork doctor — my-project</span>
              </div>
              <div style={{ padding: "16px", fontFamily: FONT_M, fontSize: 12, lineHeight: 1.7 }}>
                {[
                  { t: "  ╭──────────────────────────────────────────╮", c: T.b3 },
                  { t: "  │  SORK  ·  Project Health Report          │", c: T.cyan },
                  { t: "  ╰──────────────────────────────────────────╯", c: T.b3 },
                  { t: "",                                               c: T.text },
                  { t: "  Language Breakdown",                           c: T.textSub },
                  { t: "  typescript   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░  42 files", c: T.cyan },
                  { t: "  python       ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░  21 files", c: T.cyan },
                  { t: "",                                               c: T.text },
                  { t: "  Health Score",                                 c: T.textSub },
                  { t: "  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░  80 / 100",   c: T.green },
                  { t: "",                                               c: T.text },
                  { t: "  secrets        0    none found",              c: T.green },
                  { t: "  torn code      0    none found",              c: T.green },
                  { t: "  ai artifacts   4    verify generated logic",   c: "#E5FD17" },
                  { t: "",                                               c: T.text },
                  { t: "  clean    Project is in good health ✓",         c: T.green },
                ].map((l, i) => <div key={i} style={{ color: l.c }}>{l.t || " "}</div>)}
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing teaser ── */}
        <section style={{ borderTop: `1px solid ${T.b1}`, padding: "64px 32px", background: T.bgLow }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontFamily: FONT_H, fontSize: "clamp(28px,3vw,44px)", lineHeight: 1.2, letterSpacing: "-0.05em", fontWeight: 520, marginBottom: 10 }}>Simple pricing</h2>
            <p style={{ color: T.muted, fontSize: 15, marginBottom: 40 }}>Start free. Upgrade when you need more.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {[
                { name: "Free",     price: "$0",   note: "14 lifetime scans",  features: ["1 license key", "All 3 agents", "Groq-powered", "BYOK support"], highlight: false },
                { name: "Pro",      price: "$19",  note: "per month",           features: ["Unlimited scans", "5 license keys", "Hybrid memory", "Priority queue"], highlight: true },
                { name: "Pro Plus", price: "$28",  note: "per month",           features: ["Everything in Pro", "20 license keys", "Team dashboard", "SLA support"], highlight: false },
              ].map(p => (
                <div key={p.name} style={{ background: p.highlight ? `${T.brand}18` : T.card, border: `1px solid ${p.highlight ? T.brand : T.b1}`, borderRadius: 4, padding: 24, position: "relative", boxShadow: p.highlight ? `0 0 20px ${T.brand}22` : "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                  {p.highlight && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: T.brand, color: "#F0F1F2", fontSize: 10, fontWeight: 600, padding: "3px 12px", borderRadius: "0 0 4px 4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Most popular</div>}
                  <div style={{ fontFamily: FONT_H, fontSize: 18, fontWeight: 520, marginBottom: 6 }}>{p.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                    <span style={{ fontFamily: FONT_H, fontSize: 32, fontWeight: 700, letterSpacing: "-0.05em" }}>{p.price}</span>
                    <span style={{ color: T.muted, fontSize: 13 }}>{p.note}</span>
                  </div>
                  <div style={{ borderTop: `1px solid ${T.b1}`, marginTop: 16, paddingTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                    {p.features.map(f => <div key={f} style={{ fontSize: 12, color: T.muted, display: "flex", alignItems: "center", gap: 7 }}><span style={{ color: T.green }}>✓</span>{f}</div>)}
                  </div>
                  <Link href="/pricing" style={{ display: "block", marginTop: 20, background: p.highlight ? T.brand : T.card, border: `1px solid ${p.highlight ? T.brand : T.b2}`, color: p.highlight ? "#F0F1F2" : T.text, padding: "9px 0", borderRadius: 4, fontSize: 13, fontWeight: 600, textAlign: "center", textDecoration: "none" }}>
                    {p.price === "$0" ? "Get started free" : `Get ${p.name}`}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quotes ── */}
        <section style={{ borderTop: `1px solid ${T.b1}`, padding: "64px 32px", background: "#050505" }}>
          <div style={{ maxWidth: 1516, margin: "0 auto", display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
            <div style={{ background: "#D1EBEB", borderRadius: 24, padding: 40, minHeight: 320, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <p style={{ fontFamily: FONT_H, fontSize: 24, lineHeight: 1.35, letterSpacing: "-0.04em", fontWeight: 520, color: "#000", maxWidth: 460 }}>
                "SORK gave our team a single source of truth. We caught 12 critical issues before our last launch — would have been a disaster."
              </p>
              <div>
                <div style={{ fontWeight: 700, color: "#000", fontSize: 14 }}>Arjun Mehta</div>
                <div style={{ color: "rgba(0,0,0,0.6)", fontSize: 13 }}>CTO, Kalvium</div>
              </div>
            </div>
            <div style={{ background: "#C4FF44", borderRadius: 24, padding: 40, minHeight: 320, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <p style={{ fontFamily: FONT_H, fontSize: 20, lineHeight: 1.45, letterSpacing: "-0.03em", fontWeight: 520, color: "#000" }}>
                "Replaced three separate security tools and endless PR review cycles."
              </p>
              <div>
                <div style={{ fontWeight: 700, color: "#000", fontSize: 14 }}>Sarah Kim</div>
                <div style={{ color: "rgba(0,0,0,0.6)", fontSize: 13 }}>VP Engineering, Meridian</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ borderTop: `1px solid ${T.b1}`, padding: "80px 32px", textAlign: "center" }}>
          <h2 style={{ fontFamily: FONT_H, fontSize: "clamp(40px,5vw,72px)", lineHeight: 1.05, letterSpacing: "-0.055em", fontWeight: 520, marginBottom: 24 }}>
            Built for security.<br />Ready today.
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            {isSignedIn ? (
              <Link href="/dashboard" style={{ background: "#fff", color: "#000", padding: "12px 32px", borderRadius: 4, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Open Dashboard</Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <button style={{ background: "#fff", color: "#000", padding: "12px 32px", borderRadius: 4, fontSize: 15, fontWeight: 700, cursor: "pointer", border: "none" }}>Start free trial</button>
                </SignUpButton>
                <Link href="/pricing" style={{ background: "transparent", border: `1px solid ${T.b2}`, color: T.text, padding: "12px 32px", borderRadius: 4, fontSize: 15, textDecoration: "none" }}>View pricing</Link>
              </>
            )}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: T.bgLow, borderTop: `1px solid ${T.b3}`, padding: "56px 32px 32px" }}>
        <div style={{ maxWidth: 1728, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ fontFamily: FONT_H, fontSize: 20, fontWeight: 700, marginBottom: 10 }}>SORK</div>
              <p style={{ fontSize: 13, color: T.muted, maxWidth: 220, lineHeight: 1.65 }}>The security pipeline for every codebase. Built with Groq, Nemotron, and Cohere.</p>
            </div>
            {[
              { h: "Product",  links: [{ l:"Overview", h:"#" }, { l:"Features", h:"#features" }, { l:"Pricing", h:"/pricing" }, { l:"CLI", h:"#" }] },
              { h: "Platform", links: [{ l:"Integrations", h:"#" }, { l:"API", h:"#" }, { l:"Status", h:"#" }] },
              { h: "Company",  links: [{ l:"About", h:"#" }, { l:"Blog", h:"#" }, { l:"Careers", h:"#" }] },
              { h: "Legal",    links: [{ l:"Privacy", h:"#" }, { l:"Terms", h:"#" }] },
            ].map(col => (
              <div key={col.h} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontFamily: FONT_H, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{col.h}</div>
                {col.links.map(l => (
                  <Link key={l.l} href={l.h} style={{ fontSize: 13, color: T.textSub, textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.color = T.violet)}
                    onMouseLeave={e => (e.currentTarget.style.color = T.textSub)}>
                    {l.l}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${T.b1}`, paddingTop: 20, display: "flex", justifyContent: "space-between", fontSize: 12, color: T.muted, fontFamily: FONT_M }}>
            <span>Powered by Groq</span>
            <span>© {y} Sork Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
