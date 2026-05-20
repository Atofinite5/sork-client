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
    <div className="rounded-2xl border border-border bg-[#0f0f0f] p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[#dce1e7]">7-Day Activity</h3>
          <p className="text-[11px] text-[#5c6672] mt-0.5">scans · issues found · issues fixed</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#5c6672]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#a0e8ef]" />scans
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ffadad]" />found
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#aadfb4]" />fixed
          </span>
        </div>
      </div>

      {activity.length === 0 ? (
        <div className="h-28 flex items-center justify-center text-[#3d444c] text-sm">
          No scan activity yet — run your first scan
        </div>
      ) : (
        <div className="flex items-end gap-2 h-28">
          {activity.map((day, i) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
              {/* Bars */}
              <div className="flex-1 w-full flex items-end gap-0.5 relative">
                {/* Scans bar */}
                <motion.div
                  className="flex-1 rounded-t-sm min-h-[2px]"
                  style={{ backgroundColor: "#a0e8ef22", border: "1px solid #a0e8ef44" }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.scans / maxScans) * 96}px` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                />
                {/* Found bar */}
                <motion.div
                  className="flex-1 rounded-t-sm min-h-[2px]"
                  style={{ backgroundColor: "#ffadad22", border: "1px solid #ffadad44" }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.found / maxFound) * 80}px` }}
                  transition={{ duration: 0.5, delay: i * 0.05 + 0.1 }}
                />
                {/* Fixed bar */}
                <motion.div
                  className="flex-1 rounded-t-sm min-h-[2px]"
                  style={{ backgroundColor: "#aadfb422", border: "1px solid #aadfb444" }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.fixed / maxFound) * 80}px` }}
                  transition={{ duration: 0.5, delay: i * 0.05 + 0.2 }}
                />

                {/* Hover tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10">
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1 text-[10px] text-[#b0b8c1] whitespace-nowrap">
                    {day.scans}s · {day.found}f · {day.fixed}x
                  </div>
                  <div className="w-1 h-1 bg-[#2a2a2a] rotate-45 -mt-0.5" />
                </div>
              </div>

              {/* Day label */}
              <span className="text-[10px] text-[#3d444c] group-hover:text-[#5c6672] transition-colors">
                {dayLabel(day.date)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
