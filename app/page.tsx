"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Shield, Zap, Brain, Key, ArrowRight, Terminal, Lock, Cpu } from "lucide-react";

const PIPELINE_STEPS = [
  { icon: Shield, label: "Nemotron Safety", color: "#f59e0b", desc: "Content safety gate" },
  { icon: Brain, label: "Triage Agent", color: "#22d3ee", desc: "Vulnerability detection" },
  { icon: Zap, label: "Fix Agent", color: "#22c55e", desc: "Automated remediation" },
  { icon: Lock, label: "Verify Agent", color: "#a855f7", desc: "Fix validation" },
];

const PROVIDERS = ["Groq", "Claude", "NVIDIA", "OpenAI", "Cohere", "Custom"];

export default function HomePage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-bg text-fg overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <span className="font-bold text-lg tracking-tight">SORK Cloud</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link href="/pricing" className="text-muted hover:text-fg text-sm transition-colors">
              Pricing
            </Link>
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-accent text-bg text-sm font-semibold rounded-lg hover:bg-accent/90 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-muted hover:text-fg text-sm transition-colors">Sign in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 bg-accent text-bg text-sm font-semibold rounded-lg hover:bg-accent/90 transition-colors">
                    Get started
                  </button>
                </SignUpButton>
              </>
            )}
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/5 text-accent text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Multi-agent security pipeline
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Security that
            <br />
            <span className="text-accent">thinks for itself</span>
          </h1>

          <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Three AI agents — triage, fix, verify — protected by Nemotron safety and powered by Groq.
            Bring any API key. Run anywhere.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg font-semibold rounded-xl hover:bg-accent/90 transition-all glow-cyan"
              >
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg font-semibold rounded-xl hover:bg-accent/90 transition-all glow-cyan">
                    Start free <ArrowRight className="w-4 h-4" />
                  </button>
                </SignUpButton>
                <Link
                  href="/pricing"
                  className="px-6 py-3 border border-border text-fg font-medium rounded-xl hover:border-accent/40 transition-colors"
                >
                  View pricing
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Agent Pipeline Visualization */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-2xl font-bold mb-12 text-muted"
        >
          The pipeline
        </motion.h2>

        <div className="relative flex items-center justify-between gap-2">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex-1 flex flex-col items-center gap-3"
              >
                <div
                  className="w-16 h-16 rounded-2xl border flex items-center justify-center relative"
                  style={{
                    borderColor: `${step.color}44`,
                    backgroundColor: `${step.color}0d`,
                    boxShadow: `0 0 20px ${step.color}22`,
                  }}
                >
                  <step.icon className="w-7 h-7" style={{ color: step.color }} />
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                    style={{ boxShadow: `0 0 30px ${step.color}44` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">{step.label}</p>
                  <p className="text-xs text-muted mt-0.5">{step.desc}</p>
                </div>
              </motion.div>

              {i < PIPELINE_STEPS.length - 1 && (
                <div className="w-8 flex-shrink-0 flex items-center justify-center -mt-8">
                  <svg width="32" height="4" viewBox="0 0 32 4">
                    <line
                      x1="0" y1="2" x2="32" y2="2"
                      stroke="#22d3ee"
                      strokeWidth="2"
                      strokeDasharray="6 3"
                      className="flow-line"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BYOK Providers */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-muted text-sm mb-6">Bring any API key. SORK runs on your providers.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {PROVIDERS.map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="px-4 py-2 border border-border rounded-full text-sm text-muted hover:border-accent/40 hover:text-accent transition-all cursor-default"
              >
                {p}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: "Nemotron Safety Gate",
              desc: "Every request is screened by NVIDIA Nemotron-3 before touching your API keys. Misuse blocked at the gate.",
            },
            {
              icon: Cpu,
              title: "Groq-Powered Speed",
              desc: "Llama 3.3-70b on Groq delivers sub-second triage. No waiting, no cold starts.",
            },
            {
              icon: Key,
              title: "True BYOK",
              desc: "Add Groq, Claude, NVIDIA, OpenAI, or any custom endpoint. Keys are AES-256-GCM encrypted at rest.",
            },
            {
              icon: Brain,
              title: "Hybrid Memory",
              desc: "Cohere embeddings power semantic memory. SORK remembers your codebase across sessions.",
            },
            {
              icon: Terminal,
              title: "CLI Integration",
              desc: "Use the SORK CLI with your license key. Same pipeline, same memory, from your terminal.",
            },
            {
              icon: Zap,
              title: "Self-Healing Agents",
              desc: "Three agents coordinate automatically. If a fix doesn't verify, the pipeline escalates.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-border bg-[#0f0f0f] hover:border-accent/20 transition-colors group"
            >
              <f.icon className="w-6 h-6 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-muted text-sm">
        <p>© {new Date().getFullYear()} SORK Cloud · Built by Bhargav Kalambhe</p>
      </footer>
    </div>
  );
}
