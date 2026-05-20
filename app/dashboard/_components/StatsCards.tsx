"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Bug, Wrench, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { apiGet } from "@/lib/api";

interface Stats {
  totalScans: number;
  issuesFound: number;
  issuesFixed: number;
  fixRate: number;
  qualityScore: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

function scoreColor(score: number) {
  if (score >= 80) return "text-[#aadfb4]";
  if (score >= 55) return "text-[#ffcb8e]";
  return "text-[#ffadad]";
}

function scoreBarColor(score: number) {
  if (score >= 80) return "#aadfb4";
  if (score >= 55) return "#ffcb8e";
  return "#ffadad";
}

function Trend({ value }: { value: number }) {
  if (value === 0) return <Minus className="w-3 h-3 text-[#5c6672]" />;
  if (value > 0) return <TrendingUp className="w-3 h-3 text-[#ffcb8e]" />;
  return <TrendingDown className="w-3 h-3 text-[#aadfb4]" />;
}

export default function StatsCards({ clerkId }: { clerkId: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Stats>("/api/stats", clerkId).then(setStats).catch(() => {}).finally(() => setLoading(false));
    const interval = setInterval(() => {
      apiGet<Stats>("/api/stats", clerkId).then(setStats).catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, [clerkId]);

  const cards = [
    {
      label: "Total Scans",
      value: stats?.totalScans ?? 0,
      icon: Shield,
      color: "#a0e8ef",
      sub: "pipeline runs",
    },
    {
      label: "Issues Found",
      value: stats?.issuesFound ?? 0,
      icon: Bug,
      color: "#ffadad",
      sub: `${stats?.critical ?? 0} critical · ${stats?.high ?? 0} high`,
    },
    {
      label: "Issues Fixed",
      value: stats?.issuesFixed ?? 0,
      icon: Wrench,
      color: "#aadfb4",
      sub: `${stats?.fixRate ?? 0}% fix rate`,
    },
    {
      label: "Code Quality",
      value: stats?.qualityScore ?? 100,
      icon: Star,
      color: scoreBarColor(stats?.qualityScore ?? 100),
      sub: "out of 100",
      suffix: "/100",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-border bg-[#0f0f0f] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="rounded-2xl border border-border bg-[#0f0f0f] p-5 relative overflow-hidden group hover:border-[#262626] transition-colors"
        >
          {/* Background glow */}
          <div
            className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 group-hover:opacity-15 transition-opacity"
            style={{ backgroundColor: card.color, filter: "blur(16px)" }}
          />

          <div className="flex items-start justify-between mb-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: card.color + "18", border: `1px solid ${card.color}30` }}
            >
              <card.icon className="w-4 h-4" style={{ color: card.color }} />
            </div>
            <Trend value={0} />
          </div>

          <div className="flex items-end gap-1 mb-1">
            <span
              className="text-3xl font-bold tabular-nums"
              style={{ color: card.label === "Code Quality" ? scoreBarColor(stats?.qualityScore ?? 100) : card.color }}
            >
              {card.value}
            </span>
            {card.suffix && (
              <span className="text-sm text-[#5c6672] mb-1">{card.suffix}</span>
            )}
          </div>

          <p className="text-xs text-[#5c6672] leading-tight">{card.label}</p>
          <p className="text-[11px] text-[#3d444c] mt-0.5">{card.sub}</p>

          {/* Quality score bar */}
          {card.label === "Code Quality" && (
            <div className="mt-2 h-1 rounded-full bg-[#1a1a1a] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats?.qualityScore ?? 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full rounded-full"
                style={{ backgroundColor: card.color }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
