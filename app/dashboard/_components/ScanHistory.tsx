"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCode, ChevronDown, ChevronRight, Clock } from "lucide-react";
import { apiGet } from "@/lib/api";

interface ScanRecord {
  id: string;
  fileName: string | null;
  language: string | null;
  issuesFound: number | null;
  issuesFixed: number | null;
  criticalCount: number | null;
  highCount: number | null;
  status: string;
  model: string | null;
  createdAt: string;
  keyPrefix: string | null;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function SeverityDots({ critical, high }: { critical: number; high: number }) {
  return (
    <div className="flex items-center gap-1">
      {critical > 0 && (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ color: "#ffadad", backgroundColor: "#ffadad15", border: "1px solid #ffadad30" }}>
          {critical}c
        </span>
      )}
      {high > 0 && (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ color: "#ffcb8e", backgroundColor: "#ffcb8e15", border: "1px solid #ffcb8e30" }}>
          {high}h
        </span>
      )}
      {critical === 0 && high === 0 && (
        <span className="text-[10px]" style={{ color: "#aadfb4" }}>clean</span>
      )}
    </div>
  );
}

export default function ScanHistory({ clerkId }: { clerkId: string }) {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ history: ScanRecord[] }>("/api/stats/history", clerkId)
      .then(d => setHistory(d.history))
      .catch(() => {})
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      apiGet<{ history: ScanRecord[] }>("/api/stats/history", clerkId)
        .then(d => setHistory(d.history))
        .catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, [clerkId]);

  return (
    <div className="rounded-2xl border border-border bg-[#0f0f0f] overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#dce1e7]">Scan History</h3>
          <p className="text-[11px] text-[#5c6672] mt-0.5">real-time · auto-refreshes every 30s</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#aadfb4] animate-pulse" />
          <span className="text-[11px] text-[#5c6672]">live</span>
        </div>
      </div>

      <div className="divide-y divide-border">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-3 animate-pulse">
              <div className="w-6 h-6 rounded bg-[#1a1a1a]" />
              <div className="flex-1 h-3 bg-[#1a1a1a] rounded" />
            </div>
          ))
        ) : history.length === 0 ? (
          <div className="px-5 py-8 text-center text-[#3d444c] text-sm">
            No scans yet — run <code className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-[#a0e8ef] font-mono text-xs">sork send ./file.ts</code> to start
          </div>
        ) : (
          history.map((scan, i) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <button
                className="w-full px-5 py-3 flex items-center gap-3 hover:bg-[#111] transition-colors text-left"
                onClick={() => setExpanded(expanded === scan.id ? null : scan.id)}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: scan.status === "error" ? "#ffadad15" : "#a0e8ef15",
                    border: `1px solid ${scan.status === "error" ? "#ffadad30" : "#a0e8ef30"}`,
                  }}
                >
                  <FileCode
                    className="w-3 h-3"
                    style={{ color: scan.status === "error" ? "#ffadad" : "#a0e8ef" }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#dce1e7] truncate">
                      {scan.fileName ?? "unnamed file"}
                    </span>
                    {scan.language && (
                      <span className="text-[10px] text-[#3d444c] flex-shrink-0">[{scan.language}]</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <SeverityDots
                      critical={scan.criticalCount ?? 0}
                      high={scan.highCount ?? 0}
                    />
                    <span className="text-[10px] text-[#3d444c] flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {timeAgo(scan.createdAt)}
                    </span>
                    {scan.keyPrefix && (
                      <span className="text-[10px] text-[#3d444c] font-mono">{scan.keyPrefix}…</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: (scan.issuesFound ?? 0) > 0 ? "#ffadad" : "#aadfb4" }}>
                      {scan.issuesFound ?? 0}
                    </p>
                    <p className="text-[10px] text-[#3d444c]">found</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#aadfb4]">{scan.issuesFixed ?? 0}</p>
                    <p className="text-[10px] text-[#3d444c]">fixed</p>
                  </div>
                  {expanded === scan.id
                    ? <ChevronDown className="w-3.5 h-3.5 text-[#5c6672]" />
                    : <ChevronRight className="w-3.5 h-3.5 text-[#5c6672]" />
                  }
                </div>
              </button>

              <AnimatePresence>
                {expanded === scan.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-3 pt-1 ml-9 space-y-1.5 border-t border-border/50">
                      <div className="flex items-center gap-6 text-[11px]">
                        <span><span className="text-[#5c6672]">model  </span><span className="text-[#b0b8c1] font-mono">{scan.model ?? "groq"}</span></span>
                        <span><span className="text-[#5c6672]">key  </span><span className="text-[#b0b8c1] font-mono">{scan.keyPrefix ? `${scan.keyPrefix}…` : "—"}</span></span>
                        <span><span className="text-[#5c6672]">status  </span>
                          <span style={{ color: scan.status === "ok" ? "#aadfb4" : "#ffadad" }}>{scan.status}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-[11px]">
                        <span><span className="text-[#5c6672]">critical  </span><span style={{ color: (scan.criticalCount ?? 0) > 0 ? "#ffadad" : "#3d444c" }}>{scan.criticalCount ?? 0}</span></span>
                        <span><span className="text-[#5c6672]">high  </span><span style={{ color: (scan.highCount ?? 0) > 0 ? "#ffcb8e" : "#3d444c" }}>{scan.highCount ?? 0}</span></span>
                        <span><span className="text-[#5c6672]">fixed  </span><span className="text-[#aadfb4]">{scan.issuesFixed ?? 0}</span></span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
