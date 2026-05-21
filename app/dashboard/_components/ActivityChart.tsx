"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiGet } from "@/lib/api";

interface DayActivity {
  date: string;
  scans: number;
  found: number;
  fixed: number;
}

interface StatsResponse {
  activity: DayActivity[];
}

export default function ActivityChart({ clerkId }: { clerkId: string }) {
  const [activity, setActivity] = useState<DayActivity[]>([]);

  useEffect(() => {
    apiGet<StatsResponse>("/api/stats", clerkId)
      .then(d => setActivity(d.activity))
      .catch(() => {});
  }, [clerkId]);

  const maxScans = Math.max(...activity.map(d => d.scans), 1);
  const maxFound = Math.max(...activity.map(d => d.found), 1);

  const dayLabel = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en", { weekday: "short" }).slice(0, 2);
  };

  return (
    <div
      style={{
        background: "#101112",
        border: "1px solid #1B1C1E",
        borderRadius: 4,
        padding: "20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
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
            7-Day Activity
          </h3>
          <p style={{ fontSize: 11, color: "#9A9DA3", marginTop: 2 }}>scans · issues found · issues fixed</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "#9A9DA3" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#50d8e9", display: "inline-block" }} />
            scans
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#ffb4ab", display: "inline-block" }} />
            found
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#92f1ff", display: "inline-block" }} />
            fixed
          </span>
        </div>
      </div>

      {activity.length === 0 ? (
        <div style={{ height: 112, display: "flex", alignItems: "center", justifyContent: "center", color: "#454655", fontSize: 13 }}>
          No scan activity yet — run your first scan
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 112 }}>
          {activity.map((day, i) => (
            <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }} className="group">
              <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", gap: 2 }}>
                {/* Scans bar */}
                <motion.div
                  style={{ flex: 1, borderRadius: "2px 2px 0 0", minHeight: 2, backgroundColor: "#50d8e922", border: "1px solid #50d8e944" }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.scans / maxScans) * 96}px` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                />
                {/* Found bar */}
                <motion.div
                  style={{ flex: 1, borderRadius: "2px 2px 0 0", minHeight: 2, backgroundColor: "#ffb4ab22", border: "1px solid #ffb4ab44" }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.found / maxFound) * 80}px` }}
                  transition={{ duration: 0.5, delay: i * 0.05 + 0.1 }}
                />
                {/* Fixed bar */}
                <motion.div
                  style={{ flex: 1, borderRadius: "2px 2px 0 0", minHeight: 2, backgroundColor: "#92f1ff22", border: "1px solid #92f1ff44" }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.fixed / maxFound) * 80}px` }}
                  transition={{ duration: 0.5, delay: i * 0.05 + 0.2 }}
                />

                {/* Hover tooltip */}
                <div
                  style={{
                    position: "absolute",
                    top: -40,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "none",
                    flexDirection: "column",
                    alignItems: "center",
                    zIndex: 10,
                  }}
                  className="group-hover:!flex"
                >
                  <div
                    style={{
                      background: "#101112",
                      border: "1px solid #232426",
                      borderRadius: 4,
                      padding: "3px 8px",
                      fontSize: 10,
                      color: "#c6c5d8",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {day.scans}s · {day.found}f · {day.fixed}x
                  </div>
                </div>
              </div>

              <span style={{ fontSize: 10, color: "#454655" }}>{dayLabel(day.date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
