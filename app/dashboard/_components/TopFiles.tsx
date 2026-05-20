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
  typescript: "#a0e8ef",
  javascript: "#fff3a3",
  python:     "#d4bdff",
  rust:       "#ffcb8e",
  go:         "#b5d5ff",
  java:       "#ffadad",
  default:    "#b0b8c1",
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
    <div className="rounded-2xl border border-border bg-[#0f0f0f] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#dce1e7]">Files by Issue Count</h3>
        <p className="text-[11px] text-[#5c6672] mt-0.5">all-time · click to drill down</p>
      </div>

      {files.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-[#3d444c] text-sm">
          No file data yet
        </div>
      ) : (
        <div className="space-y-2.5">
          {files.map((file, i) => {
            const pct = (file.issuesFound / maxIssues) * 100;
            const col = file.issuesFound > 0
              ? file.issuesFound >= 3 ? "#ffadad" : "#ffcb8e"
              : "#aadfb4";
            const shortName = file.fileName.split("/").pop() ?? file.fileName;

            return (
              <motion.div
                key={file.fileName}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                      style={{ color: langColor(file.language), backgroundColor: langColor(file.language) + "18", border: `1px solid ${langColor(file.language)}30` }}
                    >
                      {file.language}
                    </span>
                    <span className="text-xs text-[#b0b8c1] truncate" title={file.fileName}>
                      {shortName}
                    </span>
                  </div>
                  <span className="text-xs flex-shrink-0 ml-2" style={{ color: col }}>
                    {file.issuesFound} issue{file.issuesFound !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04 + 0.2 }}
                    style={{ backgroundColor: col }}
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
