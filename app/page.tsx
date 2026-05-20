"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight, Shield, Brain, Zap, Lock, Key } from "lucide-react";
import { useEffect, useState } from "react";

// ── Animated terminal lines ───────────────────────────────
const TERMINAL_LINES = [
  { text: "Scanning project...",       color: "#8a9ba8", delay: 0 },
  { text: "-> Triage: High Priority",  color: "#ffcb8e", delay: 0.8 },
  { text: "-> Fix: Patch generated",   color: "#a0e8ef", delay: 1.6 },
  { text: "-> Verify: Fix validated",  color: "#aadfb4", delay: 2.4 },
  { text: "-> Status: Clean ✓",        color: "#aadfb4", delay: 3.2 },
];

function Terminal() {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    const timers = TERMINAL_LINES.map((l, i) =>
      setTimeout(() => setVisible(i + 1), l.delay * 1000 + 500)
    );
    const reset = setInterval(() => setVisible(0), 6000);
    return () => { timers.forEach(clearTimeout); clearInterval(reset); };
  }, []);

  return (
    <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-2xl overflow-hidden w-72 shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#1a1a1a]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ffadad]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#ffcb8e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#aadfb4]" />
        <span className="ml-2 text-[11px] text-[#3d444c] font-mono">Terminal</span>
      </div>
      <div className="px-4 py-4 font-mono text-xs space-y-1.5 min-h-[110px]">
        {TERMINAL_LINES.slice(0, visible).map((line, i) => (
          <motion.div
            key={`${i}-${visible}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: line.color }}
          >
            {line.text}
          </motion.div>
        ))}
        {visible < TERMINAL_LINES.length && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-1.5 h-3 bg-[#a0e8ef]"
          />
        )}
      </div>
    </div>
  );
}

// ── Circuit board SVG pattern ─────────────────────────────
function CircuitPattern({ side }: { side: "left" | "right" }) {
  return (
    <svg
      className="absolute top-0 h-full w-64 opacity-[0.07] pointer-events-none"
      style={{ [side]: 0 }}
      viewBox="0 0 256 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="40" y1="0" x2="40" y2="600" stroke="#22d3ee" strokeWidth="1" />
      <line x1="80" y1="0" x2="80" y2="600" stroke="#22d3ee" strokeWidth="0.5" />
      <line x1="120" y1="0" x2="120" y2="600" stroke="#22d3ee" strokeWidth="1" />
      <line x1="0" y1="100" x2="256" y2="100" stroke="#22d3ee" strokeWidth="0.5" />
      <line x1="0" y1="200" x2="256" y2="200" stroke="#22d3ee" strokeWidth="1" />
      <line x1="0" y1="320" x2="256" y2="320" stroke="#22d3ee" strokeWidth="0.5" />
      <line x1="0" y1="440" x2="256" y2="440" stroke="#22d3ee" strokeWidth="1" />
      <circle cx="40" cy="100" r="4" fill="#22d3ee" />
      <circle cx="40" cy="200" r="3" fill="#22d3ee" />
      <circle cx="80" cy="320" r="4" fill="#22d3ee" />
      <circle cx="120" cy="100" r="3" fill="#22d3ee" />
      <circle cx="120" cy="440" r="4" fill="#22d3ee" />
      <circle cx="40" cy="440" r="3" fill="#22d3ee" />
      <line x1="40" y1="100" x2="80" y2="100" stroke="#22d3ee" strokeWidth="1" />
      <line x1="80" y1="100" x2="80" y2="200" stroke="#22d3ee" strokeWidth="1" />
      <line x1="80" y1="200" x2="120" y2="200" stroke="#22d3ee" strokeWidth="1" />
      <line x1="40" y1="320" x2="120" y2="320" stroke="#22d3ee" strokeWidth="1" />
      <line x1="40" y1="320" x2="40" y2="440" stroke="#22d3ee" strokeWidth="1" />
      <circle cx="40" cy="100" r="2" fill="#22d3ee" />
      <circle cx="120" cy="200" r="2" fill="#22d3ee" />
      <line x1="160" y1="150" x2="200" y2="150" stroke="#22d3ee" strokeWidth="0.5" />
      <line x1="200" y1="150" x2="200" y2="260" stroke="#22d3ee" strokeWidth="0.5" />
      <circle cx="200" cy="260" r="3" fill="#22d3ee" />
      <line x1="160" y1="380" x2="240" y2="380" stroke="#22d3ee" strokeWidth="0.5" />
      <circle cx="160" cy="380" r="2" fill="#22d3ee" />
    </svg>
  );
}

const HOW_IT_WORKS = [
  {
    icon: Brain,
    label: "Triage",
    title: "Intelligent Detection",
    desc: "Detects and prioritizes threats instantly.",
    color: "#a0e8ef",
  },
  {
    icon: Zap,
    label: "Fix",
    title: "Context-Aware Patches",
    desc: "Generates secure, tested fixes.",
    color: "#aadfb4",
  },
  {
    icon: Shield,
    label: "Verify",
    title: "Automated Auditing",
    desc: "Validates patches before deployment.",
    color: "#d4bdff",
  },
];

const CORE_FEATURES = [
  {
    icon: "G",
    label: "Groq Acceleration",
    desc: "Sub-second inference.",
    color: "#ffcb8e",
  },
  {
    icon: "N",
    label: "Nemotron Guardrails",
    desc: "Safety and compliance.",
    color: "#a0e8ef",
  },
  {
    icon: Key,
    label: "BYO Key/Infra",
    desc: "Data sovereignty.",
    color: "#ffadad",
  },
];

export default function HomePage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-fg overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#111]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="font-semibold text-sm tracking-tight">SORK Cloud</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-xs text-muted hover:text-fg transition-colors hidden sm:block">Pricing</Link>
            {isSignedIn ? (
              <Link href="/dashboard"
                className="px-3.5 py-1.5 bg-accent text-bg text-xs font-semibold rounded-lg hover:bg-accent/90 transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-xs text-muted hover:text-fg transition-colors">Sign in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-3.5 py-1.5 bg-accent text-bg text-xs font-semibold rounded-lg hover:bg-accent/90 transition-colors">
                    Get started
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Circuit patterns */}
        <CircuitPattern side="left" />
        <CircuitPattern side="right" />

        {/* Radial glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-medium mb-10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Multi-agent security pipeline
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            <span className="text-[#dce1e7]">Security that</span>
            <br />
            <span className="text-accent">thinks for itself</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#5c6672] text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Three AI agents — triage, fix, verify — protected by Nemotron safety
            and powered by Groq. Bring any API key. Run anywhere.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            {isSignedIn ? (
              <Link href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-accent/40 text-accent text-sm font-medium rounded-xl hover:bg-accent/10 transition-colors">
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <button className="inline-flex items-center gap-2 px-6 py-2.5 border border-accent/40 text-accent text-sm font-medium rounded-xl hover:bg-accent/10 transition-colors">
                    Open Dashboard <ArrowRight className="w-4 h-4" />
                  </button>
                </SignUpButton>
              </>
            )}
          </motion.div>

          {/* Terminal widget */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end mt-16 pr-4 md:pr-0"
          >
            <Terminal />
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm font-semibold text-[#5c6672] mb-8 uppercase tracking-widest"
        >
          How It Works
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#222] transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: item.color + "18", border: `1px solid ${item.color}30` }}>
                  <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: item.color }}>{item.label}</span>
              </div>
              <p className="text-sm font-semibold text-[#dce1e7] mb-1">{item.title}</p>
              <p className="text-xs text-[#5c6672] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Core Features ── */}
      <section className="py-4 pb-24 px-6 max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm font-semibold text-[#5c6672] mb-8 uppercase tracking-widest"
        >
          Core Features
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CORE_FEATURES.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#222] transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: item.color + "18", border: `1px solid ${item.color}30`, color: item.color }}>
                  {typeof item.icon === "string" ? item.icon : <item.icon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-sm font-semibold text-[#dce1e7]">{item.label}</span>
              </div>
              <p className="text-xs text-[#5c6672]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#111] py-6 px-8 flex items-center justify-between text-xs text-[#3d444c]">
        <span>Powered by Groq</span>
        <span>{new Date().getFullYear()} Sork Inc.</span>
      </footer>
    </div>
  );
}
