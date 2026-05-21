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
      <div
        style={{
          background: "#101112",
          border: "1px solid #1B1C1E",
          borderRadius: 4,
          padding: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Lock style={{ width: 16, height: 16, color: "#9A9DA3" }} />
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
            Per-Key Analytics
          </h3>
        </div>
        <p style={{ fontSize: 11, color: "#9A9DA3", marginBottom: 16 }}>
          See usage breakdown for every API key you've issued.
        </p>
        <Link
          href="/pricing"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 16px",
            borderRadius: 2,
            fontSize: 12,
            fontWeight: 600,
            color: "#50d8e9",
            backgroundColor: "#50d8e918",
            border: "1px solid #50d8e930",
            textDecoration: "none",
          }}
        >
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          background: "#101112",
          border: "1px solid #1B1C1E",
          borderRadius: 4,
          padding: "20px",
        }}
      >
        <div
          className="animate-pulse"
          style={{ height: 96, background: "#1B1C1E", borderRadius: 4 }}
        />
      </div>
    );
  }

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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Key style={{ width: 16, height: 16, color: "#50d8e9" }} />
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
              Per-Key Analytics
            </h3>
            <p style={{ fontSize: 11, color: "#9A9DA3", marginTop: 2 }}>
              {data.keys.length} active key{data.keys.length !== 1 ? "s" : ""} · {data.plan} plan
            </p>
          </div>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1B1C1E" }}>
              <th style={{ padding: "10px 20px", textAlign: "left", color: "#9A9DA3", fontWeight: 500 }}>key</th>
              <th style={{ padding: "10px 16px", textAlign: "right", color: "#9A9DA3", fontWeight: 500 }}>scans</th>
              <th style={{ padding: "10px 16px", textAlign: "right", color: "#9A9DA3", fontWeight: 500 }}>found</th>
              <th style={{ padding: "10px 16px", textAlign: "right", color: "#9A9DA3", fontWeight: 500 }}>fixed</th>
              <th style={{ padding: "10px 20px", textAlign: "right", color: "#9A9DA3", fontWeight: 500 }}>last used</th>
            </tr>
          </thead>
          <tbody>
            {data.keys.map((key, i) => (
              <motion.tr
                key={key.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                style={{ borderBottom: "1px solid #1B1C1E" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#0e0e0f")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "12px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'Inter', monospace", color: "#c6c5d8", fontSize: 12 }}>{key.keyPrefix}…</span>
                    <span style={{ color: "#9A9DA3", fontSize: 12 }}>{key.name}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <span style={{ color: "#50d8e9", fontFamily: "'Inter', monospace" }}>{key.totalScans}</span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <span style={{ color: key.issuesFound > 0 ? "#ffb4ab" : "#454655", fontFamily: "'Inter', monospace" }}>
                    {key.issuesFound}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <span style={{ color: key.issuesFixed > 0 ? "#92f1ff" : "#454655", fontFamily: "'Inter', monospace" }}>
                    {key.issuesFixed}
                  </span>
                </td>
                <td style={{ padding: "12px 20px", textAlign: "right", color: "#9A9DA3", fontFamily: "'Inter', monospace" }}>
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
