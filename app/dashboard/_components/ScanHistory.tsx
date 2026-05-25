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
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {critical > 0 && (
        <span
          style={{
            padding: "1px 6px",
            borderRadius: 2,
            fontSize: 10,
            fontWeight: 500,
            color: "#ffb4ab",
            backgroundColor: "#ffb4ab15",
            border: "1px solid #ffb4ab30",
            fontFamily: "'Inter', monospace",
          }}
        >
          {critical}c
        </span>
      )}
      {high > 0 && (
        <span
          style={{
            padding: "1px 6px",
            borderRadius: 2,
            fontSize: 10,
            fontWeight: 500,
            color: "#ffb689",
            backgroundColor: "#ffb68915",
            border: "1px solid #ffb68930",
            fontFamily: "'Inter', monospace",
          }}
        >
          {high}h
        </span>
      )}
      {critical === 0 && high === 0 && (
        <span style={{ fontSize: 10, color: "#92f1ff" }}>clean</span>
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
    <div
      style={{
        background: "#101112",
        border: "1px solid #1B1C1E",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #1B1C1E",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#e5e2e3",
              fontFamily: "'Manrope', sans-serif",
              letterSpacing: "-0.04em",
              margin: 0,
            }}
          >
            Scan History
          </h3>
          <p style={{ fontSize: 11, color: "#9A9DA3", marginTop: 2 }}>real-time · auto-refreshes every 30s</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#92f1ff", display: "inline-block" }} className="animate-pulse" />
          <span style={{ fontSize: 11, color: "#9A9DA3" }}>live</span>
        </div>
      </div>

      <div style={{ borderTop: "none" }}>
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderBottom: "1px solid #1B1C1E",
              }}
            >
              <div style={{ width: 24, height: 24, borderRadius: 4, background: "#1B1C1E" }} />
              <div style={{ flex: 1, height: 12, background: "#1B1C1E", borderRadius: 2 }} />
            </div>
          ))
        ) : history.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "#454655", fontSize: 13 }}>
            No scans yet — run{" "}
            <code
              style={{
                background: "#1B1C1E",
                padding: "2px 6px",
                borderRadius: 2,
                color: "#50d8e9",
                fontFamily: "'Inter', monospace",
                fontSize: 12,
              }}
            >
              sork send ./file.ts
            </code>{" "}
            to start
          </div>
        ) : (
          history.map((scan, i) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{ borderBottom: "1px solid #1B1C1E" }}
            >
              <button
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#0e0e0f")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                onClick={() => setExpanded(expanded === scan.id ? null : scan.id)}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    backgroundColor: scan.status === "error" ? "#ffb4ab15" : "#50d8e915",
                    border: `1px solid ${scan.status === "error" ? "#ffb4ab30" : "#50d8e930"}`,
                  }}
                >
                  <FileCode
                    style={{ width: 12, height: 12, color: scan.status === "error" ? "#ffb4ab" : "#50d8e9" }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "#e5e2e3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {scan.fileName ?? "unnamed file"}
                    </span>
                    {scan.language && (
                      <span style={{ fontSize: 10, color: "#454655", flexShrink: 0, fontFamily: "'Inter', monospace" }}>
                        [{scan.language}]
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 2 }}>
                    <SeverityDots
                      critical={scan.criticalCount ?? 0}
                      high={scan.highCount ?? 0}
                    />
                    <span style={{ fontSize: 10, color: "#454655", display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock style={{ width: 10, height: 10 }} />
                      {timeAgo(scan.createdAt)}
                    </span>
                    {scan.keyPrefix && (
                      <span style={{ fontSize: 10, color: "#454655", fontFamily: "'Inter', monospace" }}>{scan.keyPrefix}…</span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: (scan.issuesFound ?? 0) > 0 ? "#ffb4ab" : "#92f1ff",
                        margin: 0,
                        fontFamily: "'Inter', monospace",
                      }}
                    >
                      {scan.issuesFound ?? 0}
                    </p>
                    <p style={{ fontSize: 10, color: "#454655", margin: 0 }}>found</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#92f1ff", margin: 0, fontFamily: "'Inter', monospace" }}>
                      {scan.issuesFixed ?? 0}
                    </p>
                    <p style={{ fontSize: 10, color: "#454655", margin: 0 }}>fixed</p>
                  </div>
                  {expanded === scan.id
                    ? <ChevronDown style={{ width: 14, height: 14, color: "#9A9DA3" }} />
                    : <ChevronRight style={{ width: 14, height: 14, color: "#9A9DA3" }} />
                  }
                </div>
              </button>

              <AnimatePresence>
                {expanded === scan.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{
                        padding: "8px 20px 12px 56px",
                        borderTop: "1px solid #1B1C1E",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 11, fontFamily: "'Inter', monospace" }}>
                        <span>
                          <span style={{ color: "#9A9DA3" }}>model  </span>
                          <span style={{ color: "#c6c5d8" }}>{scan.model === "auto" || !scan.model ? "sork-engine" : "sork-engine"}</span>
                        </span>
                        <span>
                          <span style={{ color: "#9A9DA3" }}>key  </span>
                          <span style={{ color: "#c6c5d8" }}>{scan.keyPrefix ? `${scan.keyPrefix}…` : "—"}</span>
                        </span>
                        <span>
                          <span style={{ color: "#9A9DA3" }}>status  </span>
                          <span style={{ color: scan.status === "ok" ? "#92f1ff" : "#ffb4ab" }}>{scan.status}</span>
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 11, fontFamily: "'Inter', monospace" }}>
                        <span>
                          <span style={{ color: "#9A9DA3" }}>critical  </span>
                          <span style={{ color: (scan.criticalCount ?? 0) > 0 ? "#ffb4ab" : "#454655" }}>{scan.criticalCount ?? 0}</span>
                        </span>
                        <span>
                          <span style={{ color: "#9A9DA3" }}>high  </span>
                          <span style={{ color: (scan.highCount ?? 0) > 0 ? "#ffb689" : "#454655" }}>{scan.highCount ?? 0}</span>
                        </span>
                        <span>
                          <span style={{ color: "#9A9DA3" }}>fixed  </span>
                          <span style={{ color: "#92f1ff" }}>{scan.issuesFixed ?? 0}</span>
                        </span>
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
