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

function scoreBarColor(score: number) {
  if (score >= 80) return "#92f1ff";
  if (score >= 55) return "#ffb689";
  return "#ffb4ab";
}

function Trend({ value }: { value: number }) {
  if (value === 0) return <Minus className="w-3 h-3" style={{ color: "#454655" }} />;
  if (value > 0) return <TrendingUp className="w-3 h-3" style={{ color: "#ffb689" }} />;
  return <TrendingDown className="w-3 h-3" style={{ color: "#92f1ff" }} />;
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
      color: "#50d8e9",
      sub: "pipeline runs",
    },
    {
      label: "Issues Found",
      value: stats?.issuesFound ?? 0,
      icon: Bug,
      color: "#ffb4ab",
      sub: `${stats?.critical ?? 0} critical · ${stats?.high ?? 0} high`,
    },
    {
      label: "Issues Fixed",
      value: stats?.issuesFixed ?? 0,
      icon: Wrench,
      color: "#92f1ff",
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
          <div
            key={i}
            className="animate-pulse"
            style={{
              height: 112,
              background: "#101112",
              border: "1px solid #1B1C1E",
              borderRadius: 4,
            }}
          />
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
          style={{
            background: "#101112",
            border: "1px solid #1B1C1E",
            borderRadius: 4,
            padding: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background glow */}
          <div
            style={{
              position: "absolute",
              top: -16,
              right: -16,
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: card.color,
              opacity: 0.08,
              filter: "blur(16px)",
            }}
          />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: card.color + "18",
                border: `1px solid ${card.color}30`,
              }}
            >
              <card.icon style={{ width: 16, height: 16, color: card.color }} />
            </div>
            <Trend value={0} />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 30,
                fontWeight: 700,
                fontFamily: "'Inter', monospace",
                color: card.label === "Code Quality" ? scoreBarColor(stats?.qualityScore ?? 100) : card.color,
                lineHeight: 1,
              }}
            >
              {card.value}
            </span>
            {card.suffix && (
              <span style={{ fontSize: 13, color: "#9A9DA3", marginBottom: 2 }}>{card.suffix}</span>
            )}
          </div>

          <p style={{ fontSize: 12, color: "#9A9DA3", lineHeight: 1.4 }}>{card.label}</p>
          <p style={{ fontSize: 11, color: "#454655", marginTop: 2 }}>{card.sub}</p>

          {card.label === "Code Quality" && (
            <div
              style={{
                marginTop: 8,
                height: 4,
                borderRadius: 2,
                background: "#1B1C1E",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats?.qualityScore ?? 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                style={{ height: "100%", borderRadius: 2, backgroundColor: card.color }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
