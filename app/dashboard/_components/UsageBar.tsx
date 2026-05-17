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
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-accent/20 bg-accent/5">
        <span className="w-2 h-2 rounded-full bg-accent" />
        <span className="text-sm text-accent font-medium capitalize">{quota.plan.replace("_", " ")}</span>
        <span className="text-xs text-muted">· Unlimited requests</span>
      </div>
    );
  }

  const pct = Math.round(((quota.used ?? 0) / (quota.limit ?? 1)) * 100);
  const color = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#22d3ee";

  return (
    <div className="flex flex-col gap-1.5 min-w-52">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted capitalize">{quota.plan} plan</span>
        <span style={{ color }}>
          {quota.remaining} / {quota.limit} remaining
        </span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
