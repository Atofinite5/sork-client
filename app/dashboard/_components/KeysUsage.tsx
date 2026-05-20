"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Key, Lock } from "lucide-react";
import { apiGet } from "@/lib/api";
import Link from "next/link";

interface KeyUsage {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
  totalScans: number;
  issuesFound: number;
  issuesFixed: number;
}

interface KeysResponse {
  keys: KeyUsage[];
  plan: string;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function KeysUsage({ clerkId }: { clerkId: string }) {
  const [data, setData] = useState<KeysResponse | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    apiGet<KeysResponse>("/api/stats/keys-usage", clerkId)
      .then(setData)
      .catch(() => setLocked(true));
  }, [clerkId]);

  if (locked) {
    return (
      <div className="rounded-2xl border border-border bg-[#0f0f0f] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-[#5c6672]" />
          <h3 className="text-sm font-semibold text-[#dce1e7]">Per-Key Analytics</h3>
        </div>
        <p className="text-[11px] text-[#5c6672] mb-4">See usage breakdown for every API key you've issued.</p>
        <Link href="/pricing"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ backgroundColor: "#a0e8ef18", color: "#a0e8ef", border: "1px solid #a0e8ef30" }}
        >
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-border bg-[#0f0f0f] p-5">
        <div className="h-24 animate-pulse bg-[#1a1a1a] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-[#0f0f0f] overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-[#a0e8ef]" />
          <div>
            <h3 className="text-sm font-semibold text-[#dce1e7]">Per-Key Analytics</h3>
            <p className="text-[11px] text-[#5c6672] mt-0.5">{data.keys.length} active key{data.keys.length !== 1 ? "s" : ""} · {data.plan} plan</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-2.5 text-left text-[#5c6672] font-medium">key</th>
              <th className="px-4 py-2.5 text-right text-[#5c6672] font-medium">scans</th>
              <th className="px-4 py-2.5 text-right text-[#5c6672] font-medium">found</th>
              <th className="px-4 py-2.5 text-right text-[#5c6672] font-medium">fixed</th>
              <th className="px-5 py-2.5 text-right text-[#5c6672] font-medium">last used</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.keys.map((key, i) => (
              <motion.tr
                key={key.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-[#111] transition-colors"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#b0b8c1]">{key.keyPrefix}…</span>
                    <span className="text-[#5c6672]">{key.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-[#a0e8ef]">{key.totalScans}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span style={{ color: key.issuesFound > 0 ? "#ffadad" : "#3d444c" }}>
                    {key.issuesFound}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span style={{ color: key.issuesFixed > 0 ? "#aadfb4" : "#3d444c" }}>
                    {key.issuesFixed}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-[#5c6672]">
                  {timeAgo(key.lastUsedAt)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
