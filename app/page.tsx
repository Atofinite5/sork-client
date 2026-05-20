"use client";

import Link from "next/link";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";

/* ── Terminal widget ─────────────────────────────────── */
const TERMINAL_LINES = [
  { text: "Scanning project...",        color: "#8f8fa1" },
  { text: "→ Triage:  High Priority",   color: "#ffb689" },
  { text: "→ Fix:     Patch generated", color: "#50d8e9" },
  { text: "→ Verify:  Fix validated",   color: "#92f1ff" },
  { text: "→ Status:  Clean ✓",         color: "#92f1ff" },
];

function Terminal() {
  const [n, setN] = useState(0);
  useEffect(() => {
    let i = 0;
    const tick = () => { i++; setN(i); if (i < TERMINAL_LINES.length) setTimeout(tick, 700); else setTimeout(() => { setN(0); i = 0; setTimeout(tick, 400); }, 3000); };
    const t = setTimeout(tick, 800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="bg-[#0e0e0f] border border-[#232426] rounded overflow-hidden" style={{ width: 280, boxShadow: "0 8px 32px rgba(0,0,0,0.6)", backdropFilter: "blur(20px)" }}>
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#1B1C1E] bg-[#101112]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#ffb689]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#92f1ff]" />
        <span className="ml-2 font-mono text-[11px] text-[#454655]">sork — terminal</span>
      </div>
      <div className="px-4 py-3 font-mono text-xs min-h-[110px] flex flex-col gap-1.5">
        {TERMINAL_LINES.slice(0, n).map((l, i) => (
          <div key={i} style={{ color: l.color, animation: "fadeIn .2s ease" }}>{l.text}</div>
        ))}
        {n < TERMINAL_LINES.length && (
          <span className="inline-block w-1.5 h-3 bg-[#50d8e9]" style={{ animation: "blink .8s step-end infinite" }} />
        )}
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes fadeIn{from{opacity:0;transform:translateX(-4px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────── */
export default function Page() {
  const { isSignedIn } = useUser();
  const y = new Date().getFullYear();

  const s = {
    bg:       "#070708",
    card:     "#101112",
    cardAlt:  "#151617",
    border:   "#1B1C1E",
    border2:  "#232426",
    text:     "#e5e2e3",
    muted:    "#8f8fa1",
    muted2:   "#9A9DA3",
    cyan:     "#50d8e9",
    violet:   "#bec2ff",
    amber:    "#ffb689",
    brand:    "#5E6BFF",
    lowest:   "#0e0e0f",
  };

  return (
    <div style={{ background: s.bg, color: s.text, fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <header style={{ background: `${s.lowest}cc`, backdropFilter: "blur(12px)", borderBottom: `1px solid #454655`, position: "sticky", top: 0, zIndex: 50, height: 80 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1728, margin: "0 auto", padding: "0 32px", height: "100%" }}>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em", color: s.text }}>SORK</div>
          <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {[
              { label: "Platform", active: true },
              { label: "Docs" },
              { label: "Pricing", href: "/pricing" },
              { label: "Changelog" },
            ].map(l => (
              <Link key={l.label} href={l.href ?? "#"}
                style={{ fontSize: 14, color: l.active ? s.violet : "#c6c5d8", textDecoration: "none", borderBottom: l.active ? `2px solid ${s.violet}` : "none", paddingBottom: l.active ? 4 : 0, transition: "color .2s" }}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {isSignedIn ? (
              <Link href="/dashboard" style={{ background: s.brand, color: "#F0F1F2", padding: "8px 16px", borderRadius: 4, fontSize: 12, fontWeight: 500, letterSpacing: "0.02em", textDecoration: "none" }}>Dashboard</Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button style={{ background: "transparent", border: "none", color: "#c6c5d8", fontSize: 14, cursor: "pointer" }}>Log in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button style={{ background: "#fff", color: "#000", padding: "8px 16px", borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Start free</button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* ── Hero ── */}
        <section style={{ maxWidth: 1728, margin: "0 auto", width: "100%", padding: "80px 32px 64px" }}>
          <div style={{ maxWidth: 1516, margin: "0 auto" }}>
            {/* Headline row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: "clamp(40px,5vw,76px)", lineHeight: 1.05, letterSpacing: "-0.055em", fontWeight: 520, color: s.text, marginBottom: 16, maxWidth: 900 }}>
                  The security pipeline<br />for every codebase
                </h1>
                <p style={{ fontSize: 19, color: s.muted2, marginBottom: 24, maxWidth: 560, lineHeight: 1.6 }}>
                  SORK turns scattered vulnerabilities, patches, and code quality signals into one calm pipeline — from triage to verified fix.
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  {isSignedIn ? (
                    <Link href="/dashboard" style={{ background: "#fff", color: "#000", padding: "12px 24px", borderRadius: 4, fontSize: 16, fontWeight: 700, textDecoration: "none" }}>Open Dashboard</Link>
                  ) : (
                    <>
                      <SignUpButton mode="modal">
                        <button style={{ background: "#fff", color: "#000", padding: "12px 24px", borderRadius: 4, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Get started</button>
                      </SignUpButton>
                      <Link href="/pricing" style={{ background: s.card, border: `1px solid ${s.border2}`, color: s.text, padding: "12px 24px", borderRadius: 4, fontSize: 16, textDecoration: "none" }}>View pricing</Link>
                    </>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right", paddingBottom: 8 }}>
                <span style={{ color: s.muted, fontSize: 13, fontFamily: "monospace" }}>Live pipeline  sorkcloud.space/dashboard →</span>
              </div>
            </div>

            {/* ── Dashboard Mockup ── */}
            <div style={{ width: "100%", background: s.card, borderRadius: 4, border: `1px solid rgba(255,255,255,0.05)`, overflow: "hidden", display: "flex", height: 620, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.6)" }}>

              {/* Sidebar */}
              <div style={{ width: 256, background: s.lowest, borderRight: `1px solid #454655`, padding: "16px 0", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "0 16px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid #232426` }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid #454655`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 14 }}>S</div>
                  <div>
                    <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>OPERATIONS</div>
                    <div style={{ fontSize: 11, color: "#c6c5d8", fontFamily: "monospace" }}>v1.3.0-stable</div>
                  </div>
                </div>
                {[
                  { icon: "⬛", label: "Command",   active: false },
                  { icon: "🔍", label: "Signals",   active: false },
                  { icon: "✅", label: "Approvals", active: true  },
                  { icon: "📊", label: "Dashboards",active: false },
                  { icon: "🔑", label: "API Keys",  active: false },
                  { icon: "📄", label: "Reports",   active: false },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRight: item.active ? `2px solid ${s.cyan}` : "none", color: item.active ? s.cyan : "#c6c5d8", background: item.active ? "#1c1b1d" : "transparent", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontWeight: 500 }}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span>{item.label}
                  </div>
                ))}
                <div style={{ marginTop: "auto", padding: "16px 8px 0", borderTop: `1px solid #232426` }}>
                  <div style={{ background: s.brand, color: "#F0F1F2", borderRadius: 4, padding: "8px 16px", fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    ⚡ Launch Scanner
                  </div>
                </div>
              </div>

              {/* Main area */}
              <div style={{ flex: 1, background: "#0a0a0b", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Page header */}
                <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${s.border}`, background: s.card }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <h1 style={{ fontFamily: "'Manrope',sans-serif", fontSize: 32, fontWeight: 520, letterSpacing: "-0.05em", lineHeight: 1.1, marginBottom: 4 }}>Approvals</h1>
                      <p style={{ fontSize: 13, color: "#8f8fa1", fontFamily: "monospace" }}>Every security fix in one queue</p>
                    </div>
                    <div style={{ display: "flex", gap: 12, background: s.card, border: `1px solid ${s.border2}`, borderRadius: 4, padding: 8 }}>
                      {[
                        { label: "Pending", val: "24", dot: "#e0731d" },
                        { label: "Blocked", val: "3",  dot: "#ffb4ab" },
                        { label: "Fixed Today", val: "142", dot: "#92f1ff" },
                      ].map((m, i) => (
                        <div key={m.label} style={{ padding: "4px 12px", borderRight: i < 2 ? `1px solid ${s.border}` : "none" }}>
                          <div style={{ fontSize: 10, color: "#c6c5d8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontWeight: 500 }}>{m.label}</div>
                          <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 20, fontWeight: 520, letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot, display: "inline-block" }} />{m.val}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                  {/* Table */}
                  <div style={{ flex: 1, overflowY: "auto", padding: 20, borderRight: `1px solid ${s.border}` }}>
                    <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 4, overflow: "hidden" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "monospace" }}>
                        <thead>
                          <tr style={{ background: s.cardAlt, borderBottom: `1px solid ${s.border}` }}>
                            {["", "Request", "Language", "Severity", "SLA", "Status"].map(h => (
                              <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, color: "#c6c5d8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { dot: "#e0731d", req: "Fix SQL injection auth.ts:47",    lang: "TypeScript", sev: "High",     sla: "12m left",  status: "Pending Review", active: true,  sc: "#ffb4ab" },
                            { dot: "#ffb4ab", req: "Patch null crash routes.go:122",  lang: "Go",         sev: "Critical", sla: "-2h overdue",status: "Blocked",       active: false, sc: "#ffb4ab" },
                            { dot: "#e0731d", req: "Remove hardcoded secret .env",    lang: "—",          sev: "Critical", sla: "4h",         status: "Pending",       active: false, sc: "#454655" },
                            { dot: "#e0731d", req: "Add missing auth check VEND-12",  lang: "Python",     sev: "Medium",   sla: "1d",         status: "Pending",       active: false, sc: "#454655" },
                          ].map((r, i) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${s.border}`, background: r.active ? s.cardAlt : "transparent", borderLeft: r.active ? `2px solid ${s.brand}` : "none", cursor: "pointer", height: 40 }}>
                              <td style={{ padding: "8px 12px", textAlign: "center" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: r.dot, display: "inline-block" }} /></td>
                              <td style={{ padding: "8px 12px", color: s.text, fontWeight: r.active ? 500 : 400 }}>{r.req}</td>
                              <td style={{ padding: "8px 12px", color: "#c6c5d8" }}>{r.lang}</td>
                              <td style={{ padding: "8px 12px" }}><span style={{ padding: "2px 8px", borderRadius: 2, fontSize: 10, background: "#93000a", color: "#ffdad6", textTransform: "uppercase", border: "1px solid #93000a" }}>{r.sev}</span></td>
                              <td style={{ padding: "8px 12px", color: r.sla.includes("overdue") ? "#ffb4ab" : "#8f8fa1" }}>{r.sla}</td>
                              <td style={{ padding: "8px 12px", textAlign: "right", color: "#c6c5d8" }}>{r.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Detail panel */}
                  <div style={{ width: 320, background: "#131314", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: 20, borderBottom: `1px solid ${s.border}`, background: s.card }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e0731d", display: "inline-block" }} />
                          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#c6c5d8" }}>AUTH-001</span>
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 16, fontWeight: 520, letterSpacing: "-0.02em", marginBottom: 6 }}>Fix SQL injection</div>
                      <div style={{ fontSize: 12, color: "#8f8fa1", lineHeight: 1.5 }}>Parameterize query in auth.ts:47 — unsanitized user input reaches SQL executor.</div>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", padding: 20, background: "#0e0e0f", display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 4, padding: 12 }}>
                        <div style={{ fontSize: 10, color: "#8f8fa1", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 500 }}>Context</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11, fontFamily: "monospace" }}>
                          {[["File", "auth.ts:47"], ["Language", "TypeScript"], ["CWE", "CWE-89"], ["SLA", "12m left"]].map(([k, v]) => (
                            <div key={k}><div style={{ color: "#454655", fontSize: 10, textTransform: "uppercase", marginBottom: 2 }}>{k}</div><div style={{ color: s.text }}>{v}</div></div>
                          ))}
                        </div>
                      </div>
                      <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 4, padding: 12 }}>
                        <div style={{ fontSize: 10, color: "#8f8fa1", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 500 }}>Sork.ai Analysis</div>
                        <div style={{ fontSize: 12, color: "#c6c5d8", lineHeight: 1.5 }}>Replace string concatenation with parameterized query. Confidence: <span style={{ color: s.cyan }}>98%</span></div>
                      </div>
                    </div>
                    <div style={{ padding: 12, background: s.card, borderTop: `1px solid rgba(255,255,255,0.05)` }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={{ flex: 1, background: s.brand, color: "#F0F1F2", borderRadius: 4, padding: "8px 0", fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>✓ Approve</button>
                        <button style={{ flex: 1, background: "transparent", border: `1px solid ${s.border2}`, color: "#ffb4ab", borderRadius: 4, padding: "8px 0", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>✗ Reject</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intelligence panel */}
              <div style={{ width: 280, background: "#111214", borderLeft: `1px solid ${s.border2}`, display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${s.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: s.cyan }}>⚡</span>
                    <span style={{ fontSize: 12, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Sork.ai</span>
                  </div>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.cyan, display: "inline-block" }} />
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { title: "Recommended Action", body: <>Patch <span style={{ color: s.violet, fontWeight: 700 }}>auth.ts</span> SQL injection before next deploy — 3 critical issues detected.</> },
                    { title: "Signal Summary", body: <>Code quality <span style={{ color: s.cyan, fontWeight: 500 }}>trending up (+5%)</span>, but null crash risks emerging in new routes.</> },
                  ].map(item => (
                    <div key={item.title}>
                      <div style={{ fontSize: 10, color: "#8f8fa1", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500, marginBottom: 8, fontFamily: "monospace" }}>{item.title}</div>
                      <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.05)`, borderRadius: 4, padding: 14, fontSize: 13, color: s.text, lineHeight: 1.6 }}>{item.body}</div>
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize: 10, color: "#8f8fa1", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500, marginBottom: 8, fontFamily: "monospace" }}>Decision Log</div>
                    {[{ a: "auth.ts patched", t: "2m ago", dot: s.violet }, { a: "queries.ts verified", t: "8m ago", dot: "rgba(255,255,255,0.2)" }].map(l => (
                      <div key={l.a} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 0", borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: l.dot, marginTop: 5, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 12, color: s.text, fontWeight: 500 }}>{l.a}</div>
                          <div style={{ fontSize: 10, color: "#8f8fa1", marginTop: 2, fontFamily: "monospace" }}>{l.t}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Blocking card */}
                <div style={{ margin: 12, background: "rgba(20,21,23,0.85)", backdropFilter: "blur(20px)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 4, padding: 16, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(224,115,29,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#ffb689" }}>!</div>
                      <span style={{ fontSize: 11, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Blocking Issue</span>
                    </div>
                    <span style={{ fontSize: 10, color: "#8f8fa1", fontFamily: "monospace", fontWeight: 700 }}>Critical</span>
                  </div>
                  <div style={{ fontSize: 13, color: s.text, marginBottom: 12, lineHeight: 1.6 }}>SQL injection in <code style={{ color: s.cyan, background: "rgba(80,216,233,0.1)", padding: "1px 5px", borderRadius: 2, fontSize: 11 }}>auth.ts:47</code> — must fix before deploy.</div>
                  <button style={{ width: "100%", background: s.violet, color: "#000ba6", padding: "10px 0", borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", border: "none" }}>Review Fix</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section style={{ borderTop: `1px solid ${s.border}`, padding: "64px 32px" }}>
          <div style={{ maxWidth: 1516, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Manrope',sans-serif", fontSize: "clamp(32px,3vw,48px)", lineHeight: 1.1, letterSpacing: "-0.05em", fontWeight: 520, textAlign: "center", marginBottom: 56 }}>
              Security pipeline, simplified.
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {[
                { fig: "FIG 0.1 / TRIAGE ENGINE", title: "Triage", icon: "🔍", code: "SCAN_ACTIVE",   desc: "Detects and prioritizes vulnerabilities with CWE IDs and confidence scores." },
                { fig: "FIG 0.2 / FIX PIPELINE",  title: "Fix",    icon: "🛠", code: "PATCH_READY",  desc: "Generates minimal, context-aware patches. Only changes what needs to change." },
                { fig: "FIG 0.3 / VERIFY CYCLE",  title: "Verify", icon: "✓", code: "VERIFIED_OK",  desc: "Automated auditing confirms every patch is clean before it reaches production." },
              ].map((c, i) => (
                <div key={i} style={{ border: `1px solid ${s.border2}`, borderRadius: 4, padding: 24, background: s.bg, height: 300, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 11, color: "#8f8fa1", marginBottom: 12, fontFamily: "monospace" }}>{c.fig}</div>
                  <div style={{ flex: 1, border: `1px solid ${s.border}`, borderRadius: 4, background: "#0a0a0b", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", backgroundImage: "radial-gradient(#1B1C1E 1px, transparent 1px)", backgroundSize: "16px 16px" }}>
                    <div style={{ textAlign: "center", position: "relative" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{c.icon}</div>
                      <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 18, fontWeight: 520 }}>{c.title}</div>
                      <div style={{ fontSize: 10, color: "#454655", marginTop: 4, fontFamily: "monospace" }}>{c.code}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "#8f8fa1", marginTop: 12, lineHeight: 1.5 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Metrics ── */}
        <section style={{ borderTop: `1px solid ${s.border}`, padding: "64px 32px" }}>
          <div style={{ maxWidth: 1516, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {[
                { label: "Pipeline Uptime", value: "99.9%",   dot: s.cyan,  note: "+0.1% vs last month" },
                { label: "Avg Fix Latency", value: "1.8s",    dot: s.cyan,  note: "p95 globally via Groq" },
                { label: "Issues Blocked",  value: "12,847",  dot: "#ffb4ab", note: "before production" },
              ].map(m => (
                <div key={m.label} style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 4, padding: 20, position: "relative", overflow: "hidden", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
                  <div style={{ position: "absolute", top: 16, right: 16, width: 6, height: 6, borderRadius: "50%", background: m.dot }} />
                  <div style={{ fontSize: 11, color: "#c6c5d8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontWeight: 500 }}>{m.label}</div>
                  <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 32, fontWeight: 520, letterSpacing: "-0.05em", lineHeight: 1.2 }}>{m.value}</div>
                  <div style={{ fontSize: 12, color: "#9A9DA3", marginTop: 4, fontFamily: "monospace" }}>{m.note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quotes ── */}
        <section style={{ borderTop: `1px solid ${s.border}`, padding: "64px 32px", background: "#050505" }}>
          <div style={{ maxWidth: 1516, margin: "0 auto", display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
            <div style={{ background: "#D1EBEB", borderRadius: 24, padding: 40, height: 380, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 26, lineHeight: 1.3, letterSpacing: "-0.04em", fontWeight: 520, color: "#000", maxWidth: 480 }}>
                "SORK gave our team a single source of truth. We caught 12 critical issues before our last launch."
              </p>
              <div>
                <div style={{ fontWeight: 700, color: "#000", fontSize: 15 }}>Arjun Mehta</div>
                <div style={{ color: "rgba(0,0,0,0.6)", fontSize: 13 }}>CTO, Kalvium</div>
              </div>
            </div>
            <div style={{ background: "#C4FF44", borderRadius: 24, padding: 40, height: 380, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 22, lineHeight: 1.4, letterSpacing: "-0.03em", fontWeight: 520, color: "#000" }}>
                "It replaced three separate security tools and endless PR review cycles."
              </p>
              <div>
                <div style={{ fontWeight: 700, color: "#000", fontSize: 15 }}>Sarah Kim</div>
                <div style={{ color: "rgba(0,0,0,0.6)", fontSize: 13 }}>VP Engineering, Meridian</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ borderTop: `1px solid ${s.border}`, padding: "80px 32px", textAlign: "center" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Manrope',sans-serif", fontSize: "clamp(40px,5vw,76px)", lineHeight: 1.05, letterSpacing: "-0.055em", fontWeight: 520, marginBottom: 24 }}>
              Built for security.<br />Ready today.
            </h2>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              {isSignedIn ? (
                <Link href="/dashboard" style={{ background: "#fff", color: "#000", padding: "12px 32px", borderRadius: 4, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Open Dashboard</Link>
              ) : (
                <>
                  <SignUpButton mode="modal">
                    <button style={{ background: "#fff", color: "#000", padding: "12px 32px", borderRadius: 4, fontSize: 15, fontWeight: 700, cursor: "pointer", border: "none" }}>Start free trial</button>
                  </SignUpButton>
                  <Link href="/pricing" style={{ background: "transparent", border: `1px solid ${s.border2}`, color: s.text, padding: "12px 32px", borderRadius: 4, fontSize: 15, textDecoration: "none" }}>Contact sales</Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: s.lowest, borderTop: `1px solid #454655`, padding: "64px 32px 40px" }}>
        <div style={{ maxWidth: 1728, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>SORK</div>
            <p style={{ fontSize: 13, color: "#8f8fa1", maxWidth: 220, lineHeight: 1.6 }}>The security pipeline for every team.</p>
          </div>
          {[
            { h: "PRODUCT",  links: ["Overview", "Features", "Security", "CLI"] },
            { h: "PLATFORM", links: ["Integrations", "API", "Status"] },
            { h: "COMPANY",  links: ["About", "Pricing", "Blog"] },
            { h: "LEGAL",    links: ["Privacy", "Terms"] },
          ].map(col => (
            <div key={col.h} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 16, fontWeight: 700, color: s.text, marginBottom: 4 }}>{col.h}</div>
              {col.links.map(l => (
                <a key={l} href="#" style={{ fontSize: 14, color: "#c6c5d8", textDecoration: "none" }}>{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1728, margin: "0 auto", paddingTop: 20, borderTop: `1px solid ${s.border}`, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8f8fa1", fontFamily: "monospace" }}>
          <span>Powered by Groq</span>
          <span>© {y} Sork Inc. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
