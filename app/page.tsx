"use client";

import Link from "next/link";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

/* ── Animated terminal ──────────────────────────────── */
const LINES = [
  { t: "Scanning project...",        c: "#9A9DA3" },
  { t: "→ Triage:  High Priority",   c: "#ffcb8e" },
  { t: "→ Fix:     Patch generated", c: "#a0e8ef" },
  { t: "→ Verify:  Fix validated",   c: "#aadfb4" },
  { t: "→ Status:  Clean ✓",         c: "#aadfb4" },
];
function Terminal() {
  const [n, setN] = useState(0);
  useEffect(() => {
    let i = 0;
    const tick = () => { i++; setN(i); if (i < LINES.length) setTimeout(tick, 700); else setTimeout(() => { setN(0); i = 0; setTimeout(tick, 400); }, 3000); };
    const t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ background:"#0a0a0b", border:"1px solid #1e1e1e", borderRadius:16, overflow:"hidden", width:288, boxShadow:"0 24px 48px rgba(0,0,0,0.6)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 16px", borderBottom:"1px solid #1a1a1a" }}>
        <span style={{ width:10, height:10, borderRadius:"50%", background:"#ffadad" }} />
        <span style={{ width:10, height:10, borderRadius:"50%", background:"#ffcb8e" }} />
        <span style={{ width:10, height:10, borderRadius:"50%", background:"#aadfb4" }} />
        <span style={{ marginLeft:8, fontSize:11, color:"#3d444c", fontFamily:"monospace" }}>Terminal</span>
      </div>
      <div style={{ padding:"16px", fontFamily:"monospace", fontSize:12, minHeight:110, display:"flex", flexDirection:"column", gap:6 }}>
        {LINES.slice(0, n).map((l, i) => (
          <motion.div key={i} initial={{ opacity:0, x:-4 }} animate={{ opacity:1, x:0 }} style={{ color: l.c }}>{l.t}</motion.div>
        ))}
        {n < LINES.length && <motion.span animate={{ opacity:[1,0,1] }} transition={{ duration:.8, repeat:Infinity }} style={{ display:"inline-block", width:6, height:14, background:"#a0e8ef" }} />}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────── */
export default function Page() {
  const { isSignedIn } = useUser();

  return (
    <div style={{ background:"#070708", color:"#e5e2e3", fontFamily:"var(--font-inter), system-ui, sans-serif" }}>

      {/* ── 1. Header ── */}
      <header style={{ background:"#070708", position:"fixed", top:0, width:"100%", height:80, borderBottom:"1px solid #232426", zIndex:50 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", maxWidth:1728, margin:"0 auto", padding:"0 32px", height:"100%" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", border:"1px solid #9A9DA3", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-manrope)", fontWeight:700, fontSize:16 }}>S</div>
            <span style={{ fontFamily:"var(--font-manrope)", fontSize:24, fontWeight:700, letterSpacing:"-0.04em" }}>SORK</span>
          </div>
          <nav style={{ display:"flex", gap:24, alignItems:"center" }}>
            {["Platform","Docs","Pricing","Changelog"].map(l => (
              <Link key={l} href={l === "Pricing" ? "/pricing" : "#"} style={{ fontSize:14, color:"#9A9DA3", textDecoration:"none", transition:"color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color="#a0e8ef")}
                onMouseLeave={e => (e.currentTarget.style.color="#9A9DA3")}>{l}</Link>
            ))}
          </nav>
          <div style={{ display:"flex", gap:12 }}>
            {isSignedIn ? (
              <Link href="/dashboard" style={{ background:"#fff", color:"#000", padding:"8px 16px", borderRadius:4, fontSize:14, fontWeight:700, textDecoration:"none" }}>Dashboard</Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button style={{ border:"1px solid #232426", background:"transparent", color:"#e5e2e3", padding:"8px 16px", borderRadius:4, fontSize:14, cursor:"pointer" }}>Log in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button style={{ background:"#fff", color:"#000", padding:"8px 16px", borderRadius:4, fontSize:14, fontWeight:700, cursor:"pointer" }}>Start free</button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1728, margin:"0 auto", paddingTop:80 }}>

        {/* ── 2. Hero ── */}
        <section style={{ padding:"128px 32px 80px", position:"relative" }}>
          <div style={{ maxWidth:1516, margin:"0 auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:40 }}>
              <div>
                <h1 style={{ fontFamily:"var(--font-manrope)", fontSize:"clamp(48px,5.5vw,76px)", lineHeight:1.1, letterSpacing:"-0.055em", fontWeight:520, color:"#e5e2e3", marginBottom:16, maxWidth:900 }}>
                  The security pipeline<br/>for every team
                </h1>
                <p style={{ fontSize:19, color:"#9A9DA3", marginBottom:24, maxWidth:560, lineHeight:1.6 }}>
                  SORK turns scattered vulnerabilities, patches, and code quality signals into one calm pipeline — from triage to verified fix.
                </p>
                <div style={{ display:"flex", gap:12 }}>
                  {isSignedIn ? (
                    <Link href="/dashboard" style={{ background:"#fff", color:"#000", padding:"12px 24px", borderRadius:4, fontSize:16, fontWeight:700, textDecoration:"none" }}>Open Dashboard</Link>
                  ) : (
                    <>
                      <SignUpButton mode="modal">
                        <button style={{ background:"#fff", color:"#000", padding:"12px 24px", borderRadius:4, fontSize:16, fontWeight:700, cursor:"pointer" }}>Get started</button>
                      </SignUpButton>
                      <Link href="/pricing" style={{ background:"#1a1b1d", border:"1px solid #232426", color:"#e5e2e3", padding:"12px 24px", borderRadius:4, fontSize:16, textDecoration:"none" }}>View pricing</Link>
                    </>
                  )}
                </div>
              </div>
              <div style={{ textAlign:"right", paddingBottom:8 }}>
                <a href="#" style={{ color:"#9A9DA3", fontSize:13, fontFamily:"monospace", textDecoration:"none", display:"flex", alignItems:"center", gap:4 }}>
                  Live pipeline  sorkcloud.space/dashboard →
                </a>
              </div>
            </div>

            {/* ── Dashboard Mockup ── */}
            <div style={{ width:"100%", background:"#101112", borderRadius:8, border:"1px solid rgba(255,255,255,0.05)", overflow:"hidden", display:"flex", height:620, boxShadow:"inset 0 1px 0 0 rgba(255,255,255,0.06), 0 24px 48px rgba(0,0,0,0.5)" }}>

              {/* Sidebar */}
              <div style={{ width:240, background:"#0d0e0f", borderRight:"1px solid #232426", padding:24, display:"flex", flexDirection:"column", gap:4 }}>
                <div style={{ fontSize:10, color:"#9A9DA3", textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:24, padding:"0 16px", opacity:.4, fontFamily:"monospace", fontWeight:700 }}>Navigation</div>
                {[
                  { icon:"⬛", label:"Overview", active:true },
                  { icon:"🔍", label:"Scans" },
                  { icon:"🛠", label:"Fixes" },
                  { icon:"✅", label:"Verified" },
                  { icon:"⚠️", label:"Alerts" },
                  { icon:"🔑", label:"API Keys" },
                  { icon:"📊", label:"Reports" },
                ].map(item => (
                  <div key={item.label} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 16px", borderRadius:8, background: item.active ? "rgba(255,255,255,0.04)" : "transparent", border: item.active ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent", color: item.active ? "#e5e2e3" : "#9A9DA3", fontSize:14, cursor:"pointer" }}>
                    <span style={{ fontSize:14 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Main area */}
              <div style={{ flex:1, padding:24, display:"flex", flexDirection:"column", gap:16, background:"#0a0a0b", overflowY:"auto" }}>
                {/* Status bar */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:8, borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:"#50d8e9", display:"inline-block", animation:"pulse 2s infinite" }} />
                    <span style={{ fontFamily:"monospace", fontSize:11, color:"#50d8e9", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:700 }}>Pipeline Live</span>
                  </div>
                  <div style={{ fontFamily:"monospace", fontSize:10, color:"#9A9DA3", textTransform:"uppercase", letterSpacing:"0.1em" }}>LAST SCAN: <span style={{ color:"#e5e2e3" }}>Just now</span></div>
                </div>

                {/* Stats row */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                  {[
                    { label:"ISSUES FOUND", value:"47", trend:"-8% vs last scan", tc:"#50d8e9" },
                    { label:"FIXES APPLIED", value:"31", trend:"66% fix rate", tc:"#aadfb4" },
                    { label:"CODE QUALITY", value:"87/100", trend:"↑ improving", tc:"#E5FD17" },
                  ].map(s => (
                    <div key={s.label} style={{ background:"#101112", border:"1px solid rgba(255,255,255,0.05)", borderRadius:12, padding:16, boxShadow:"inset 0 1px 0 rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize:10, color:"#9A9DA3", fontFamily:"monospace", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", opacity:.6, marginBottom:6 }}>{s.label}</div>
                      <div style={{ fontFamily:"var(--font-manrope)", fontSize:24, fontWeight:700, letterSpacing:"-0.04em", color:"#e5e2e3" }}>{s.value}</div>
                      <div style={{ fontSize:11, color:s.tc, marginTop:6, fontWeight:500 }}>{s.trend}</div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div style={{ background:"#101112", border:"1px solid rgba(255,255,255,0.05)", borderRadius:12, padding:16, height:180, boxShadow:"inset 0 1px 0 rgba(255,255,255,0.06)", position:"relative", overflow:"hidden" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ fontFamily:"monospace", fontSize:10, fontWeight:700, color:"#e5e2e3", textTransform:"uppercase", letterSpacing:"0.1em", opacity:.6 }}>Scan Activity — 7 days</div>
                      <span style={{ fontSize:9, color:"#50d8e9", fontFamily:"monospace", background:"rgba(80,216,233,0.1)", padding:"2px 6px", borderRadius:4 }}>LIVE TELEMETRY</span>
                    </div>
                    <div style={{ fontFamily:"monospace", fontSize:9, color:"#9A9DA3", opacity:.4, textTransform:"uppercase" }}>REAL-TIME</div>
                  </div>
                  <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(#232426 1px, transparent 1px)", backgroundSize:"16px 16px", opacity:.2 }} />
                  <svg style={{ position:"absolute", bottom:0, width:"100%", height:"70%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="g1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#50d8e9" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#50d8e9" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,50 Q10,45 20,55 T40,40 T60,60 T80,35 T100,45 L100,100 L0,100 Z" fill="url(#g1)" />
                    <path d="M0,50 Q10,45 20,55 T40,40 T60,60 T80,35 T100,45" fill="none" stroke="#50d8e9" strokeWidth="1" strokeLinecap="round" />
                    <path d="M0,70 Q15,65 30,75 T60,55 T90,80 T100,70" fill="none" stroke="#E5FD17" strokeDasharray="2,2" strokeWidth="0.75" opacity="0.5" />
                    <circle cx="80" cy="35" r="2" fill="#50d8e9" />
                  </svg>
                </div>

                {/* Bottom row */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div style={{ background:"#101112", border:"1px solid #232426", borderRadius:12, padding:16, boxShadow:"inset 0 1px 0 rgba(255,255,255,0.06)" }}>
                    <div style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:"#e5e2e3", borderBottom:"1px solid rgba(255,255,255,0.05)", paddingBottom:8, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.05em" }}>Fix Queue</div>
                    {[
                      { f:"src/api/auth.ts",   tag:"CRITICAL", tc:"#ffadad" },
                      { f:"queries.ts",         tag:"HIGH",     tc:"#ffcb8e" },
                      { f:"handlers.go",        tag:"ACTIVE",   tc:"#50d8e9" },
                      { f:"deploy.py",          tag:"MEDIUM",   tc:"#9A9DA3" },
                    ].map(r => (
                      <div key={r.f} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:14, borderBottom:"1px solid #232426", padding:"6px 0" }}>
                        <span style={{ color:"#e5e2e3" }}>{r.f}</span>
                        <span style={{ color:r.tc, background:r.tc+"18", padding:"2px 6px", borderRadius:4, fontSize:10, fontFamily:"monospace", fontWeight:700 }}>{r.tag}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:"#101112", border:"1px solid #232426", borderRadius:12, padding:16, boxShadow:"inset 0 1px 0 rgba(255,255,255,0.06)" }}>
                    <div style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:"#e5e2e3", borderBottom:"1px solid rgba(255,255,255,0.05)", paddingBottom:8, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.05em" }}>Pipeline Status</div>
                    {[
                      { label:"Triage complete",  pct:100, c:"#a0e8ef", val:"47/47" },
                      { label:"Fixes applied",    pct:66,  c:"#aadfb4", val:"31/47" },
                      { label:"Verified clean",   pct:87,  c:"#E5FD17", val:"27/31" },
                    ].map(p => (
                      <div key={p.label} style={{ marginBottom:12 }}>
                        <div style={{ height:6, background:"rgba(255,255,255,0.05)", borderRadius:999, overflow:"hidden", marginBottom:4 }}>
                          <div style={{ height:"100%", width:`${p.pct}%`, background:p.c, borderRadius:999 }} />
                        </div>
                        <div style={{ fontFamily:"monospace", fontSize:10, color:"#9A9DA3", display:"flex", justifyContent:"space-between" }}>
                          <span>{p.label}</span>
                          <span style={{ color:p.c, fontWeight:700 }}>{p.val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right panel — Sork.ai */}
              <div style={{ width:300, background:"#111214", borderLeft:"1px solid #232426", padding:24, display:"flex", flexDirection:"column", gap:20 }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#e5e2e3", borderBottom:"1px solid rgba(255,255,255,0.05)", paddingBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:18, color:"#50d8e9" }}>⚡</span>
                    <span style={{ fontFamily:"monospace", fontSize:13, textTransform:"uppercase", letterSpacing:"0.05em" }}>Sork.ai</span>
                  </div>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#50d8e9", display:"inline-block" }} />
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:"#9A9DA3", textTransform:"uppercase", letterSpacing:"0.1em", opacity:.5, fontFamily:"monospace", marginBottom:8 }}>Recommended Action</div>
                    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:12, padding:16, fontSize:14, color:"#e5e2e3", lineHeight:1.6 }}>
                      Patch <span style={{ color:"#a0e8ef", fontWeight:700 }}>auth.ts</span> SQL injection before next deploy — 3 critical issues detected.
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:"#9A9DA3", textTransform:"uppercase", letterSpacing:"0.1em", opacity:.5, fontFamily:"monospace", marginBottom:8 }}>Signal Summary</div>
                    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:12, padding:16, fontSize:14, color:"#e5e2e3", lineHeight:1.6 }}>
                      Code quality <span style={{ color:"#50d8e9", fontWeight:500 }}>trending up (+5%)</span>, but null crash risks emerging in new routes.
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:"#9A9DA3", textTransform:"uppercase", letterSpacing:"0.1em", opacity:.5, fontFamily:"monospace", marginBottom:8 }}>Scan Log</div>
                    {[
                      { a:"auth.ts patched",    t:"2m ago", dot:"#a0e8ef" },
                      { a:"queries.ts verified", t:"8m ago", dot:"#ffffff33" },
                    ].map(l => (
                      <div key={l.a} style={{ display:"flex", alignItems:"flex-start", gap:16, padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:l.dot, marginTop:6, flexShrink:0 }} />
                        <div>
                          <div style={{ fontSize:12, color:"#e5e2e3", fontWeight:500 }}>{l.a}</div>
                          <div style={{ fontFamily:"monospace", fontSize:10, color:"#9A9DA3", marginTop:2, opacity:.7 }}>{l.t}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Blocking card */}
                <div style={{ marginTop:"auto", background:"rgba(16,17,18,0.85)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:20, boxShadow:"0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,203,142,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ color:"#ffcb8e", fontSize:14 }}>!</span>
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"0.05em" }}>Blocking Issue</span>
                    </div>
                    <span style={{ fontSize:10, color:"#9A9DA3", fontFamily:"monospace", textTransform:"uppercase", fontWeight:700 }}>Critical</span>
                  </div>
                  <div style={{ fontSize:14, color:"#e5e2e3", marginBottom:16, lineHeight:1.6 }}>
                    SQL injection in <code style={{ color:"#a0e8ef", background:"rgba(160,232,239,0.1)", padding:"1px 6px", borderRadius:4, fontSize:12 }}>auth.ts:47</code> — fix before any production deploy.
                  </div>
                  <button style={{ width:"100%", background:"#bec2ff", color:"#000ba6", padding:"10px 0", borderRadius:8, fontSize:12, fontWeight:700, fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"0.05em", cursor:"pointer", border:"none", boxShadow:"0 4px 12px rgba(190,194,255,0.2)" }}>
                    Review Fix
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Principle ── */}
        <section style={{ padding:"80px 32px", borderTop:"1px solid #232426" }}>
          <div style={{ maxWidth:1516, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"var(--font-manrope)", fontSize:"clamp(32px,3vw,48px)", lineHeight:1.2, letterSpacing:"-0.05em", fontWeight:520, color:"#e5e2e3", textAlign:"center", marginBottom:64, maxWidth:800, margin:"0 auto 64px" }}>
              Security pipeline, simplified. The architecture of a protected codebase.
            </h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:32 }}>
              {[
                { fig:"FIG 0.1 / TRIAGE ENGINE", color:"#a0e8ef", title:"Triage", desc:"Detects and prioritizes every vulnerability instantly across all languages." },
                { fig:"FIG 0.2 / FIX PIPELINE", color:"#aadfb4", title:"Fix", desc:"Generates minimal, context-aware patches — verified before applying." },
                { fig:"FIG 0.3 / VERIFY CYCLE", color:"#E5FD17", title:"Verify", desc:"Automated auditing confirms every patch before it hits production." },
              ].map((c, i) => (
                <div key={i} style={{ border:"1px solid #232426", borderRadius:12, padding:24, background:"#070708", height:320, display:"flex", flexDirection:"column" }}>
                  <div style={{ fontFamily:"monospace", color:"#9A9DA3", marginBottom:16, fontSize:11 }}>{c.fig}</div>
                  <div style={{ flex:1, border:"1px solid #232426", borderRadius:8, background:"#0a0a0b", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                    <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(#232426 1px, transparent 1px)", backgroundSize:"16px 16px", opacity:.4 }} />
                    <div style={{ position:"relative", textAlign:"center" }}>
                      <div style={{ fontSize:36, marginBottom:8 }}>{i === 0 ? "🔍" : i === 1 ? "🛠" : "✓"}</div>
                      <div style={{ fontFamily:"var(--font-manrope)", fontSize:20, fontWeight:600, color:c.color }}>{c.title}</div>
                      <div style={{ fontFamily:"monospace", fontSize:10, color:"#9A9DA3", marginTop:4, opacity:.6 }}>{i === 0 ? "SCAN_ACTIVE" : i === 1 ? "PATCH_READY" : "VERIFIED_OK"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Signal Intelligence (left) ── */}
        <section style={{ padding:"80px 32px", borderTop:"1px solid #232426" }}>
          <div style={{ maxWidth:1516, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
            <div>
              <h2 style={{ fontFamily:"var(--font-manrope)", fontSize:"clamp(32px,3vw,48px)", lineHeight:1.2, letterSpacing:"-0.05em", fontWeight:520, color:"#e5e2e3", marginBottom:16 }}>Turn vulnerabilities into signals</h2>
              <p style={{ fontSize:18, color:"#9A9DA3", lineHeight:1.6 }}>Aggregate noise from every file, commit, and dependency into one structured signal stream. SORK surfaces what matters before it breaks production.</p>
            </div>
            <div style={{ position:"relative", height:480 }}>
              <div style={{ position:"absolute", inset:0, background:"#0a0a0b", border:"1px solid #232426", borderRadius:12, overflow:"hidden", padding:16 }}>
                <div style={{ fontFamily:"monospace", fontSize:11, color:"#9A9DA3", marginBottom:12, borderBottom:"1px solid #232426", paddingBottom:8 }}>Security Signals</div>
                {[
                  { f:"auth.ts",     t:"SQL Injection", s:"Critical", c:"#ffadad" },
                  { f:"api/users",   t:"Missing auth check", s:"High", c:"#ffcb8e" },
                  { f:"config.env",  t:"Hardcoded secret", s:"Critical", c:"#ffadad" },
                  { f:"handlers.go", t:"Error ignored", s:"Medium",   c:"#fff3a3" },
                ].map(r => (
                  <div key={r.f} style={{ display:"flex", justifyContent:"space-between", fontSize:14, color:"#e5e2e3", padding:"8px 0", borderBottom:"1px solid #232426" }}>
                    <span style={{ width:"40%" }}>{r.f}</span>
                    <span style={{ width:"40%", color:"#9A9DA3" }}>{r.t}</span>
                    <span style={{ color:r.c }}>{r.s}</span>
                  </div>
                ))}
              </div>
              <div style={{ position:"absolute", left:-40, top:"25%", width:280, background:"rgba(16,17,18,0.85)", backdropFilter:"blur(20px)", border:"1px solid #232426", borderRadius:12, padding:20, boxShadow:"0 24px 48px rgba(0,0,0,0.5)", zIndex:10 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#e5e2e3", marginBottom:8, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color:"#a0e8ef" }}>⚡</span> Sork.ai Finding
                </div>
                <div style={{ fontSize:13, color:"#9A9DA3", marginBottom:12, lineHeight:1.5 }}>config.env has a hardcoded API key. Rotate immediately and move to env vars.</div>
                <div style={{ display:"flex", gap:8 }}>
                  <button style={{ background:"#232426", color:"#e5e2e3", padding:"6px 12px", borderRadius:4, fontSize:12, border:"none", cursor:"pointer" }}>Dismiss</button>
                  <button style={{ background:"#a0e8ef", color:"#000", padding:"6px 12px", borderRadius:4, fontSize:12, fontWeight:700, border:"none", cursor:"pointer" }}>Fix Now</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Fix Command Center (right) ── */}
        <section style={{ padding:"80px 32px", borderTop:"1px solid #232426" }}>
          <div style={{ maxWidth:1516, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
            <div style={{ position:"relative", height:480, order:1 }}>
              <div style={{ position:"absolute", inset:0, background:"#0a0a0b", border:"1px solid #232426", borderRadius:12, overflow:"hidden", padding:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"monospace", color:"#9A9DA3", marginBottom:24, borderBottom:"1px solid #232426", paddingBottom:8 }}>
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <span key={d}>{d}</span>)}
                </div>
                <div style={{ position:"relative", height:240 }}>
                  {[
                    { top:20, left:"10%", w:"40%", label:"Patch auth.ts" },
                    { top:70, left:"30%", w:"50%", label:"Fix null crashes" },
                    { top:120, left:"5%",  w:"35%", label:"Rotate secrets" },
                  ].map(b => (
                    <div key={b.label} style={{ position:"absolute", top:b.top, left:b.left, width:b.w, height:32, background:"#232426", borderRadius:4, border:"1px solid #454655", display:"flex", alignItems:"center", padding:"0 10px", fontSize:12, color:"#e5e2e3" }}>{b.label}</div>
                  ))}
                </div>
              </div>
              <div style={{ position:"absolute", right:-40, bottom:"25%", width:260, background:"rgba(16,17,18,0.85)", backdropFilter:"blur(20px)", border:"1px solid #232426", borderRadius:12, padding:20, boxShadow:"0 24px 48px rgba(0,0,0,0.5)", zIndex:10 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#e5e2e3", marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color:"#50d8e9" }}>🛠</span> Fix Queue
                </div>
                {[
                  { l:"SQL injection fix",  btn:"Apply" },
                  { l:"Null guard patch",   btn:"Apply" },
                ].map(r => (
                  <div key={r.l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:13, color:"#e5e2e3", borderBottom:"1px solid #232426", padding:"8px 0" }}>
                    <span>{r.l}</span>
                    <button style={{ color:"#a0e8ef", fontSize:12, background:"transparent", border:"none", cursor:"pointer", fontWeight:600 }}>{r.btn}</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ order:2 }}>
              <h2 style={{ fontFamily:"var(--font-manrope)", fontSize:"clamp(32px,3vw,48px)", lineHeight:1.2, letterSpacing:"-0.05em", fontWeight:520, color:"#e5e2e3", marginBottom:16 }}>Guide every fix forward</h2>
              <p style={{ fontSize:18, color:"#9A9DA3", lineHeight:1.6 }}>Map security patches against your release timeline. Keep deployments unblocked with clear fix ownership and verified patches.</p>
            </div>
          </div>
        </section>

        {/* ── 6. Timeline ── */}
        <section style={{ padding:"80px 32px", borderTop:"1px solid #232426" }}>
          <div style={{ maxWidth:1516, margin:"0 auto", position:"relative" }}>
            <div style={{ position:"absolute", top:"30%", left:0, width:"100%", height:1, background:"#232426", zIndex:0 }} />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:32, position:"relative", zIndex:1 }}>
              {[
                { active:true,  title:"Triage",        desc:"Detect and prioritize every vulnerability instantly." },
                { active:false, title:"Fix",            desc:"Generate minimal, verified patches automatically." },
                { active:false, title:"Verify",         desc:"Confirm every fix before it reaches production." },
                { active:false, title:"Guard (watch)",  desc:"Real-time file scanning — catch issues on every save." },
              ].map((n, i) => (
                <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
                  <div style={{ width: n.active ? 16 : 12, height: n.active ? 16 : 12, borderRadius:"50%", background: n.active ? "#5E6BFF" : "#232426", border: n.active ? "none" : "1px solid #9A9DA3", marginBottom:24, boxShadow: n.active ? "0 0 15px #5E6BFF" : "none", flexShrink:0 }} />
                  <h3 style={{ fontFamily:"var(--font-manrope)", fontSize:18, fontWeight:520, color:"#e5e2e3", marginBottom:8 }}>{n.title}</h3>
                  <p style={{ fontSize:14, color:"#9A9DA3", lineHeight:1.5 }}>{n.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. Quotes ── */}
        <section style={{ padding:"80px 32px", borderTop:"1px solid #232426", background:"#050505" }}>
          <div style={{ maxWidth:1516, margin:"0 auto", display:"grid", gridTemplateColumns:"3fr 2fr", gap:16 }}>
            <div style={{ background:"#D1EBEB", borderRadius:24, padding:40, height:480, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
              <p style={{ fontFamily:"var(--font-manrope)", fontSize:28, lineHeight:1.3, letterSpacing:"-0.04em", fontWeight:520, color:"#000", maxWidth:520 }}>
                "SORK finally gave our engineering team a single source of truth. We caught 12 critical issues before our last launch — would have been a disaster."
              </p>
              <div>
                <div style={{ fontWeight:700, color:"#000", fontSize:16 }}>Arjun Mehta</div>
                <div style={{ color:"rgba(0,0,0,0.6)", fontSize:14 }}>CTO, Kalvium</div>
              </div>
            </div>
            <div style={{ background:"#C4FF44", borderRadius:24, padding:40, height:480, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
              <p style={{ fontFamily:"var(--font-manrope)", fontSize:22, lineHeight:1.4, letterSpacing:"-0.03em", fontWeight:520, color:"#000" }}>
                "It replaced three separate security tools and endless PR review cycles."
              </p>
              <div>
                <div style={{ fontWeight:700, color:"#000", fontSize:16 }}>Sarah Kim</div>
                <div style={{ color:"rgba(0,0,0,0.6)", fontSize:14 }}>VP Engineering, Meridian</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. CTA ── */}
        <section style={{ padding:"80px 32px", borderTop:"1px solid #232426", textAlign:"center" }}>
          <div style={{ maxWidth:800, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"var(--font-manrope)", fontSize:"clamp(48px,5.5vw,76px)", lineHeight:1.1, letterSpacing:"-0.055em", fontWeight:520, color:"#e5e2e3", marginBottom:24 }}>
              Built for security.<br/>Ready today.
            </h2>
            <div style={{ display:"flex", justifyContent:"center", gap:12 }}>
              {isSignedIn ? (
                <Link href="/dashboard" style={{ background:"#fff", color:"#000", padding:"12px 32px", borderRadius:4, fontSize:16, fontWeight:700, textDecoration:"none" }}>Open Dashboard</Link>
              ) : (
                <>
                  <SignUpButton mode="modal">
                    <button style={{ background:"#fff", color:"#000", padding:"12px 32px", borderRadius:4, fontSize:16, fontWeight:700, cursor:"pointer" }}>Start free trial</button>
                  </SignUpButton>
                  <Link href="/pricing" style={{ background:"transparent", border:"1px solid #232426", color:"#e5e2e3", padding:"12px 32px", borderRadius:4, fontSize:16, textDecoration:"none" }}>View pricing</Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{ background:"#0d0e0f", borderTop:"1px solid #232426", padding:"80px 32px 40px" }}>
        <div style={{ maxWidth:1728, margin:"0 auto", display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:40 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <div style={{ width:24, height:24, borderRadius:"50%", border:"1px solid #9A9DA3", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700 }}>S</div>
              <span style={{ fontFamily:"var(--font-manrope)", fontSize:18, fontWeight:700 }}>SORK</span>
            </div>
            <p style={{ fontSize:14, color:"#9A9DA3", maxWidth:240, lineHeight:1.6 }}>The security pipeline for every team.</p>
          </div>
          {[
            { h:"PRODUCT",  links:["Overview","Features","Security","CLI"] },
            { h:"PLATFORM", links:["Integrations","API","Status"] },
            { h:"COMPANY",  links:["About","Pricing","Blog"] },
            { h:"RESOURCES",links:["Docs","GitHub","Discord"] },
          ].map(col => (
            <div key={col.h} style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ fontFamily:"monospace", color:"#9A9DA3", fontSize:11, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.1em" }}>{col.h}</div>
              {col.links.map(l => (
                <a key={l} href="#" style={{ fontSize:14, color:"#e5e2e3", textDecoration:"none", transition:"color .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color="#a0e8ef")}
                  onMouseLeave={e => (e.currentTarget.style.color="#e5e2e3")}>{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ maxWidth:1728, margin:"40px auto 0", paddingTop:24, borderTop:"1px solid #232426", display:"flex", justifyContent:"space-between", fontSize:13, color:"#9A9DA3" }}>
          <span>Powered by Groq</span>
          <span>© {new Date().getFullYear()} Sork Inc.</span>
        </div>
      </footer>
    </div>
  );
}
