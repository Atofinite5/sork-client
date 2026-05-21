"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";

interface Quota {
  plan: string;
  limit: number | null;
  used: number;
  remaining: number | null;
  exhausted: boolean;
  unlimited: boolean;
}

export default function UsageBar({ clerkId }: { clerkId: string }) {
  const [quota, setQuota] = useState<Quota | null>(null);

  useEffect(() => {
    apiGet<Quota>("/api/usage", clerkId).then(setQuota).catch(() => {});
  }, [clerkId]);

  if (!quota) return null;

  if (quota.unlimited) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 16px",
          borderRadius: 2,
          border: "1px solid #5E6BFF30",
          background: "#5E6BFF10",
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#5E6BFF", display: "inline-block" }} />
        <span style={{ fontSize: 13, color: "#bec2ff", fontWeight: 600 }}>
          {quota.plan.replace("_", " ")}
        </span>
        <span style={{ fontSize: 12, color: "#9A9DA3" }}>· Unlimited requests</span>
      </div>
    );
  }

  const pct = Math.round(((quota.used ?? 0) / (quota.limit ?? 1)) * 100);
  const color = pct >= 90 ? "#ffb4ab" : pct >= 70 ? "#ffb689" : "#50d8e9";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 208 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
        <span style={{ color: "#9A9DA3", textTransform: "capitalize" }}>{quota.plan} plan</span>
        <span style={{ color, fontFamily: "'Inter', monospace" }}>
          {quota.remaining} / {quota.limit} remaining
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "#1B1C1E",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 2,
            backgroundColor: color,
            transition: "width 0.7s ease",
          }}
        />
      </div>
    </div>
  );
}
