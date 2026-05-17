"use client";

import { motion } from "framer-motion";
import { Shield, Brain, Zap, Lock, CheckCircle } from "lucide-react";

const AGENTS = [
  { icon: Shield, label: "Nemotron", sublabel: "Safety Gate", color: "#f59e0b", status: "active" },
  { icon: Brain, label: "Triage", sublabel: "Agent 1", color: "#22d3ee", status: "active" },
  { icon: Zap, label: "Fix", sublabel: "Agent 2", color: "#22c55e", status: "active" },
  { icon: Lock, label: "Verify", sublabel: "Agent 3", color: "#a855f7", status: "active" },
  { icon: CheckCircle, label: "Output", sublabel: "Secure", color: "#22d3ee", status: "active" },
];

export default function AgentPipeline() {
  return (
    <div className="rounded-2xl border border-border bg-[#0f0f0f] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-semibold">Agent Pipeline</h2>
          <p className="text-muted text-xs mt-0.5">Nemotron → Triage → Fix → Verify</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted">Live</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {AGENTS.map((agent, i) => (
          <div key={agent.label} className="flex items-center flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="w-14 h-14 rounded-xl border flex items-center justify-center relative overflow-hidden"
                style={{ borderColor: `${agent.color}33`, backgroundColor: `${agent.color}0a` }}
              >
                <agent.icon className="w-6 h-6 relative z-10" style={{ color: agent.color }} />
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: [0, 0.15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
                  style={{ backgroundColor: agent.color }}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium">{agent.label}</p>
                <p className="text-[10px] text-muted">{agent.sublabel}</p>
              </div>
            </motion.div>

            {i < AGENTS.length - 1 && (
              <div className="w-10 flex-shrink-0 mx-1 -mt-5">
                <svg width="40" height="6" viewBox="0 0 40 6">
                  <line
                    x1="0" y1="3" x2="40" y2="3"
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                    strokeDasharray="5 3"
                    className="flow-line"
                    opacity="0.5"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
