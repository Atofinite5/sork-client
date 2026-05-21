"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiGet } from "@/lib/api";

interface FileStats {
  fileName: string;
  language: string;
  issuesFound: number;
  scans: number;
}

interface StatsResponse {
  topFiles: FileStats[];
}

const LANG_COLORS: Record<string, string> = {
  typescript: "#50d8e9",
  javascript: "#E5FD17",
  python:     "#bec2ff",
  rust:       "#ffb689",
  go:         "#92f1ff",
  java:       "#ffb4ab",
  default:    "#c6c5d8",
};

function langColor(lang: string): string {
  return LANG_COLORS[lang.toLowerCase()] ?? LANG_COLORS.default;
}

export default function TopFiles({ clerkId }: { clerkId: string }) {
  const [files, setFiles] = useState<FileStats[]>([]);

  useEffect(() => {
    apiGet<StatsResponse>("/api/stats", clerkId).then(d => setFiles(d.topFiles)).catch(() => {});
    const interval = setInterval(() => {
      apiGet<StatsResponse>("/api/stats", clerkId).then(d => setFiles(d.topFiles)).catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, [clerkId]);

  const maxIssues = Math.max(...files.map(f => f.issuesFound), 1);

  return (
    <div
      style={{
        background: "#101112",
        border: "1px solid #1B1C1E",
        borderRadius: 4,
        padding: "20px",
      }}
    >
      <div style={{ marginBottom: 16 }}>
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
          Files by Issue Count
        </h3>
        <p style={{ fontSize: 11, color: "#9A9DA3", marginTop: 2 }}>all-time · click to drill down</p>
      </div>

      {files.length === 0 ? (
        <div style={{ height: 96, display: "flex", alignItems: "center", justifyContent: "center", color: "#454655", fontSize: 13 }}>
          No file data yet
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {files.map((file, i) => {
            const pct = (file.issuesFound / maxIssues) * 100;
            const col = file.issuesFound > 0
              ? file.issuesFound >= 3 ? "#ffb4ab" : "#ffb689"
              : "#92f1ff";
            const shortName = file.fileName.split("/").pop() ?? file.fileName;

            return (
              <motion.div
                key={file.fileName}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "1px 6px",
                        borderRadius: 2,
                        fontWeight: 500,
                        flexShrink: 0,
                        color: langColor(file.language),
                        backgroundColor: langColor(file.language) + "18",
                        border: `1px solid ${langColor(file.language)}30`,
                        fontFamily: "'Inter', monospace",
                      }}
                    >
                      {file.language}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#c6c5d8",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontFamily: "'Inter', monospace",
                      }}
                      title={file.fileName}
                    >
                      {shortName}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      flexShrink: 0,
                      marginLeft: 8,
                      color: col,
                      fontFamily: "'Inter', monospace",
                    }}
                  >
                    {file.issuesFound} issue{file.issuesFound !== 1 ? "s" : ""}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 2,
                    background: "#1B1C1E",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    style={{ height: "100%", borderRadius: 2, backgroundColor: col }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04 + 0.2 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
