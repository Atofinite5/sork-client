"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet } from "@/lib/api";

/* ─── types ──────────────────────────────────────────── */
interface Stats {
  totalScans: number; issuesFound: number; issuesFixed: number;
  fixRate: number; qualityScore: number;
  critical: number; high: number; medium: number; low: number;
  activity: { date: string; scans: number; found: number; fixed: number }[];
  topFiles: { fileName: string; language: string; issuesFound: number; scans: number }[];
}

interface ScanRecord {
  id: string; fileName: string | null; language: string | null;
  issuesFound: number | null; issuesFixed: number | null;
  criticalCount: number | null; highCount: number | null;
  status: string; model: string | null; createdAt: string; keyPrefix: string | null;
}

/* ─── design tokens ──────────────────────────────────── */
const T = {
  bg: "#070708", card: "#101112", b1: "#1B1C1E", b2: "#232426",
  text: "#e5e2e3", sub: "#c6c5d8", muted: "#9A9DA3",
  brand: "#5E6BFF", cyan: "#50d8e9", violet: "#bec2ff",
  amber: "#ffb689", error: "#ffb4ab", green: "#92f1ff", yellow: "#E5FD17",
};
const card = { background: T.card, border: `1px solid ${T.b1}`, borderRadius: 4, padding: 20 } as const;
const mono = { fontFamily: "'Inter', monospace" } as const;
const head = { fontFamily: "'Manrope', sans-serif", fontWeight: 700, letterSpacing: "-0.04em" } as const;

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const LANG_C: Record<string, string> = {
  typescript: T.cyan, javascript: T.yellow, python: T.violet,
  rust: T.amber, go: "#b5d5ff", java: T.error, default: T.muted,
};
const langColor = (l: string) => LANG_C[l?.toLowerCase()] ?? LANG_C.default;

/* ─── SVG Charts ─────────────────────────────────────── */

/** Line/area chart for 7-day activity */
function ActivityLineChart({ data }: { data: Stats["activity"] }) {
  if (!data.length) return (
    <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", ...mono, fontSize: 12, color: T.muted }}>
      No activity yet — run your first scan
    </div>
  );

  const W = 500, H = 120, PAD = { t: 10, b: 24, l: 8, r: 8 };
  const iW = W - PAD.l - PAD.r, iH = H - PAD.t - PAD.b;
  const maxV = Math.max(...data.flatMap(d => [d.scans, d.found, d.fixed]), 1);

  const pts = (key: keyof typeof data[0]) =>
    data.map((d, i) => {
      const x = PAD.l + (i / (data.length - 1 || 1)) * iW;
      const y = PAD.t + iH - ((d[key] as number) / maxV) * iH;
      return `${x},${y}`;
    }).join(" ");

  const area = (key: keyof typeof data[0], color: string) => {
    const p = data.map((d, i) => {
      const x = PAD.l + (i / (data.length - 1 || 1)) * iW;
      const y = PAD.t + iH - ((d[key] as number) / maxV) * iH;
      return `${x},${y}`;
    });
    const first = p[0], last = p[p.length - 1];
    const bx1 = PAD.l, bx2 = PAD.l + iW, by = PAD.t + iH;
    return `M${bx1},${by} L${first} L${p.slice(1).join(" L")} L${bx2},${by} Z`;
  };

  const lines: [keyof Stats["activity"][0], string, string][] = [
    ["scans", T.cyan,   "Scans"],
    ["found", T.error,  "Found"],
    ["fixed", T.green,  "Fixed"],
  ];

  const days = data.map(d => new Date(d.date).toLocaleDateString("en", { weekday: "short" }).slice(0, 2));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, overflow: "visible" }}>
      <defs>
        {lines.map(([k, c]) => (
          <linearGradient key={String(k)} id={`ag-${String(k)}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c} stopOpacity="0.18" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {/* grid */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={PAD.l} y1={PAD.t + iH * (1 - f)} x2={PAD.l + iW} y2={PAD.t + iH * (1 - f)}
          stroke={T.b1} strokeWidth="0.5" />
      ))}
      {/* areas */}
      {lines.map(([k, c]) => (
        <path key={`a-${String(k)}`} d={area(k, c)} fill={`url(#ag-${String(k)})`} />
      ))}
      {/* lines */}
      {lines.map(([k, c]) => (
        <polyline key={`l-${String(k)}`} points={pts(k)} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {/* dots */}
      {lines.map(([k, c]) =>
        data.map((d, i) => {
          const x = PAD.l + (i / (data.length - 1 || 1)) * iW;
          const y = PAD.t + iH - ((d[k] as number) / maxV) * iH;
          return <circle key={`${String(k)}-${i}`} cx={x} cy={y} r="2.5" fill={c} />;
        })
      )}
      {/* day labels */}
      {days.map((d, i) => {
        const x = PAD.l + (i / (data.length - 1 || 1)) * iW;
        return <text key={i} x={x} y={H - 4} textAnchor="middle" fill={T.muted} fontSize="9" fontFamily="monospace">{d}</text>;
      })}
    </svg>
  );
}

/** Stacked severity bar chart */
function SeverityBars({ critical, high, medium, low }: { critical: number; high: number; medium: number; low: number }) {
  const total = critical + high + medium + low || 1;
  const bars = [
    { label: "Critical", value: critical, color: T.error },
    { label: "High",     value: high,     color: T.amber },
    { label: "Medium",   value: medium,   color: T.violet },
    { label: "Low",      value: low,      color: T.sub },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {bars.map(b => (
        <div key={b.label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, ...mono, fontSize: 10 }}>
            <span style={{ color: b.color }}>{b.label}</span>
            <span style={{ color: T.muted }}>{b.value} ({Math.round((b.value / total) * 100)}%)</span>
          </div>
          <div style={{ height: 6, background: T.b1, borderRadius: 1, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(b.value / total) * 100}%`, background: b.color, borderRadius: 1, transition: "width 0.8s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Donut chart for severity distribution */
function SeverityDonut({ critical, high, medium, low }: { critical: number; high: number; medium: number; low: number }) {
  const total = critical + high + medium + low;
  if (total === 0) return (
    <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", ...mono, fontSize: 11, color: T.muted }}>
      No issues found yet
    </div>
  );

  const segs = [
    { value: critical, color: T.error, label: "Critical" },
    { value: high,     color: T.amber, label: "High"     },
    { value: medium,   color: T.violet,label: "Medium"   },
    { value: low,      color: T.sub,   label: "Low"      },
  ];

  const R = 52, r = 32, cx = 70, cy = 70;
  let angle = -Math.PI / 2;
  const paths = segs.map(s => {
    const a = (s.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle);
    const y1 = cy + R * Math.sin(angle);
    angle += a;
    const x2 = cx + R * Math.cos(angle);
    const y2 = cy + R * Math.sin(angle);
    const xi = cx + r * Math.cos(angle);
    const yi = cy + r * Math.sin(angle);
    const xis = cx + r * Math.cos(angle - a);
    const yis = cy + r * Math.sin(angle - a);
    const large = a > Math.PI ? 1 : 0;
    return {
      ...s,
      d: a < 0.01 ? "" : `M${xis},${yis} A${r},${r} 0 ${large},1 ${xi},${yi} L${x2},${y2} A${R},${R} 0 ${large},0 ${x1},${y1} Z`,
    };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg viewBox="0 0 140 140" style={{ width: 140, height: 140, flexShrink: 0 }}>
        {paths.map((p, i) => p.d && <path key={i} d={p.d} fill={p.color} opacity="0.9" />)}
        <text x={cx} y={cy - 6} textAnchor="middle" fill={T.text} fontSize="18" fontWeight="700" fontFamily="Manrope">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill={T.muted} fontSize="9" fontFamily="monospace">TOTAL</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {segs.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 7, ...mono, fontSize: 11 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ color: T.sub }}>{s.label}</span>
            <span style={{ color: s.color, fontWeight: 600, marginLeft: "auto" }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Fix rate gauge */
function FixRateGauge({ rate, fixed, total }: { rate: number; fixed: number; total: number }) {
  const [hovered, setHovered] = useState(false);
  const W = 220, H = 140;
  const cx = W / 2, cy = 105;
  const R = 80, r = 60;
  const clamp = Math.max(0, Math.min(100, rate));
  const endA = Math.PI + (clamp / 100) * Math.PI;

  const arc = (a1: number, a2: number, ro: number, ri: number) => {
    const x1 = cx + ro * Math.cos(a1), y1 = cy + ro * Math.sin(a1);
    const x2 = cx + ro * Math.cos(a2), y2 = cy + ro * Math.sin(a2);
    const xi = cx + ri * Math.cos(a2), yi = cy + ri * Math.sin(a2);
    const xis = cx + ri * Math.cos(a1), yis = cy + ri * Math.sin(a1);
    return `M${xis},${yis} A${ri},${ri} 0 0,1 ${xi},${yi} L${x2},${y2} A${ro},${ro} 0 0,0 ${x1},${y1} Z`;
  };

  const color = rate >= 70 ? T.green : rate >= 40 ? T.amber : T.error;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", cursor: "default", borderRadius: 4, transition: "box-shadow 0.3s" ,
        boxShadow: hovered ? `0 0 0 1px ${color}40, 0 0 24px ${color}18` : "none" }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, display: "block" }}>
        <defs>
          {/* shimmer gradient — sweeps on hover */}
          <linearGradient id="gauge-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={color} stopOpacity="0.6" />
            <stop offset="50%"  stopColor="white" stopOpacity={hovered ? "0.95" : "0"} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
            {hovered && (
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                from="-1 0" to="1 0"
                dur="1.2s" repeatCount="indefinite"
              />
            )}
          </linearGradient>
          {/* tick marks clip */}
          <clipPath id="gauge-clip">
            <path d={arc(Math.PI, 2 * Math.PI, R + 6, r - 6)} />
          </clipPath>
        </defs>

        {/* Background track with tick marks */}
        <path d={arc(Math.PI, 2 * Math.PI, R, r)} fill={T.b1} />
        {/* Tick marks */}
        {Array.from({ length: 11 }, (_, i) => {
          const a = Math.PI + (i / 10) * Math.PI;
          const isMajor = i % 5 === 0;
          const r1 = R + (isMajor ? 6 : 3);
          const r2 = R + (isMajor ? 10 : 6);
          return (
            <line key={i}
              x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)}
              x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)}
              stroke={isMajor ? T.b3 : T.b2} strokeWidth={isMajor ? "1.5" : "0.8"}
            />
          );
        })}

        {/* Filled arc */}
        {clamp > 0 && (
          <path d={arc(Math.PI, endA, R, r)}
            fill={hovered ? `url(#gauge-shimmer)` : color}
            opacity={hovered ? "1" : "0.85"}
            style={{ transition: "opacity 0.3s" }}
          />
        )}

        {/* Needle */}
        {(() => {
          const a = Math.PI + (clamp / 100) * Math.PI;
          const nx = cx + (r - 4) * Math.cos(a);
          const ny = cy + (r - 4) * Math.sin(a);
          return (
            <>
              <line x1={cx} y1={cy} x2={nx} y2={ny}
                stroke={color} strokeWidth="2" strokeLinecap="round"
                style={{ filter: hovered ? `drop-shadow(0 0 4px ${color})` : "none", transition: "filter 0.3s" }} />
              <circle cx={cx} cy={cy} r="4" fill={T.card} stroke={color} strokeWidth="1.5" />
            </>
          );
        })()}

        {/* 0% / 100% labels */}
        <text x={cx - R - 2} y={cy + 16} fill={T.muted} fontSize="9" fontFamily="monospace" textAnchor="middle">0%</text>
        <text x={cx + R + 2} y={cy + 16} fill={T.muted} fontSize="9" fontFamily="monospace" textAnchor="middle">100%</text>

        {/* Center value */}
        <text x={cx} y={cy - 20} fill={color} fontSize="32" fontWeight="700" fontFamily="Manrope" textAnchor="middle"
          style={{ filter: hovered ? `drop-shadow(0 0 8px ${color}88)` : "none", transition: "filter 0.3s" }}>
          {rate}%
        </text>
        <text x={cx} y={cy - 4} fill={T.muted} fontSize="9" fontFamily="monospace" textAnchor="middle" letterSpacing="0.1em">FIX RATE</text>
        <text x={cx} y={cy + 14} fill={T.sub} fontSize="10" fontFamily="monospace" textAnchor="middle">
          {fixed} fixed of {total} found
        </text>

        {/* Hover hint */}
        {!hovered && (
          <text x={cx} y={cy + 28} fill={T.b3} fontSize="8" fontFamily="monospace" textAnchor="middle">hover to illuminate</text>
        )}
      </svg>
    </div>
  );
}

/** Quality score ring */
function QualityRing({ score }: { score: number }) {
  const R = 40, circumference = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * circumference;
  const color = pct >= 80 ? T.green : pct >= 55 ? T.amber : T.error;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width="96" height="96" viewBox="0 0 96 96" style={{ flexShrink: 0 }}>
        <circle cx="48" cy="48" r={R} fill="none" stroke={T.b1} strokeWidth="7" />
        <circle cx="48" cy="48" r={R} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
          transform="rotate(-90 48 48)" style={{ transition: "stroke-dasharray 1s ease" }} />
        <text x="48" y="44" textAnchor="middle" fill={color} fontSize="20" fontWeight="700" fontFamily="Manrope">{score}</text>
        <text x="48" y="58" textAnchor="middle" fill={T.muted} fontSize="9" fontFamily="monospace">/100</text>
      </svg>
      <div>
        <div style={{ ...head, fontSize: 14, color: T.text, marginBottom: 4 }}>Code Quality</div>
        <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 8 }}>
          {pct >= 80 ? "Good health" : pct >= 55 ? "Needs attention" : "Critical — fix issues"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {[
            { label: "Security",    val: Math.min(100, score + 5) },
            { label: "Fix coverage",val: score },
            { label: "Scan depth",  val: Math.min(100, score + 10) },
          ].map(m => (
            <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ ...mono, fontSize: 9, color: T.muted, width: 76 }}>{m.label}</span>
              <div style={{ flex: 1, height: 3, background: T.b1, borderRadius: 1 }}>
                <div style={{ height: "100%", width: `${m.val}%`, background: color, borderRadius: 1, transition: "width 1s ease" }} />
              </div>
              <span style={{ ...mono, fontSize: 9, color }}>{m.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Language breakdown chart */
function LangBreakdown({ files }: { files: Stats["topFiles"] }) {
  const langs: Record<string, number> = {};
  files.forEach(f => { langs[f.language] = (langs[f.language] || 0) + f.issuesFound; });
  const sorted = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = Math.max(...sorted.map(([, v]) => v), 1);

  if (!sorted.length) return (
    <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", ...mono, fontSize: 11, color: T.muted }}>
      No language data yet
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {sorted.map(([lang, count]) => (
        <div key={lang} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ ...mono, fontSize: 10, color: langColor(lang), width: 80, textTransform: "capitalize" }}>{lang}</span>
          <div style={{ flex: 1, height: 8, background: T.b1, borderRadius: 1, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(count / max) * 100}%`, background: langColor(lang), borderRadius: 1, opacity: 0.8, transition: "width 0.8s ease" }} />
          </div>
          <span style={{ ...mono, fontSize: 10, color: langColor(lang), width: 28, textAlign: "right" }}>{count}</span>
        </div>
      ))}
    </div>
  );
}

/** Scan history table */
function HistoryTable({ history }: { history: ScanRecord[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!history.length) return (
    <div style={{ padding: 32, textAlign: "center", ...mono, fontSize: 12, color: T.muted }}>
      No scans yet — run <code style={{ color: T.cyan, background: "rgba(80,216,233,0.08)", padding: "1px 5px", borderRadius: 2 }}>sork scan</code> to get started
    </div>
  );

  const sevC = (r: ScanRecord) => {
    if ((r.criticalCount ?? 0) > 0) return T.error;
    if ((r.highCount ?? 0) > 0) return T.amber;
    if ((r.issuesFound ?? 0) > 0) return T.violet;
    return T.green;
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", ...mono, fontSize: 12 }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${T.b2}`, background: "#0a0a0b" }}>
          {["File", "Language", "Issues", "Fixed", "Status", "Model", "Time"].map(h => (
            <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {history.map(r => (
          <>
            <tr key={r.id}
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              style={{ borderBottom: `1px solid ${T.b1}`, cursor: "pointer", borderLeft: `2px solid ${sevC(r)}` }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.015)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <td style={{ padding: "8px 12px", color: T.text, fontWeight: 500, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.fileName ?? "—"}
              </td>
              <td style={{ padding: "8px 12px" }}>
                {r.language && <span style={{ color: langColor(r.language), background: langColor(r.language) + "18", padding: "2px 6px", borderRadius: 2, fontSize: 9, textTransform: "capitalize" }}>{r.language}</span>}
              </td>
              <td style={{ padding: "8px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: sevC(r), fontWeight: 600 }}>{r.issuesFound ?? 0}</span>
                  {(r.criticalCount ?? 0) > 0 && <span style={{ color: T.error, fontSize: 9, background: T.error + "15", padding: "1px 4px", borderRadius: 2 }}>{r.criticalCount}c</span>}
                  {(r.highCount ?? 0) > 0 && <span style={{ color: T.amber, fontSize: 9, background: T.amber + "15", padding: "1px 4px", borderRadius: 2 }}>{r.highCount}h</span>}
                </div>
              </td>
              <td style={{ padding: "8px 12px", color: T.green }}>{r.issuesFixed ?? 0}</td>
              <td style={{ padding: "8px 12px" }}>
                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 2, textTransform: "uppercase", letterSpacing: "0.06em", background: r.status === "verified" ? T.green + "18" : T.b1, color: r.status === "verified" ? T.green : T.muted }}>{r.status}</span>
              </td>
              <td style={{ padding: "8px 12px", color: T.muted, fontSize: 10 }}>{r.model?.replace("llama-3.3-70b-versatile", "llama-3.3") ?? "—"}</td>
              <td style={{ padding: "8px 12px", color: T.muted }}>{timeAgo(r.createdAt)}</td>
            </tr>
            {expanded === r.id && (
              <tr key={`${r.id}-exp`} style={{ borderBottom: `1px solid ${T.b1}` }}>
                <td colSpan={7} style={{ padding: "10px 12px 10px 20px", background: "#0a0a0b" }}>
                  <div style={{ display: "flex", gap: 24, ...mono, fontSize: 11, color: T.muted }}>
                    <span>ID: <span style={{ color: T.sub }}>{r.id.slice(0, 8)}…</span></span>
                    {r.keyPrefix && <span>Key: <span style={{ color: T.violet }}>{r.keyPrefix}</span></span>}
                    <span>Scanned: <span style={{ color: T.sub }}>{new Date(r.createdAt).toLocaleString()}</span></span>
                    <span>Fix rate: <span style={{ color: T.green }}>{r.issuesFound ? Math.round(((r.issuesFixed ?? 0) / r.issuesFound) * 100) : 100}%</span></span>
                  </div>
                </td>
              </tr>
            )}
          </>
        ))}
      </tbody>
    </table>
  );
}

/* ─── Main ScansView ─────────────────────────────────── */
export default function ScansView({ clerkId }: { clerkId: string }) {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = useCallback(async () => {
    try {
      const [s, h] = await Promise.all([
        apiGet<Stats>("/api/stats", clerkId),
        apiGet<{ history: ScanRecord[] }>("/api/stats/history", clerkId).then(d => d.history),
      ]);
      setStats(s);
      setHistory(h);
      setLastRefresh(new Date());
    } catch {}
    setLoading(false);
  }, [clerkId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const s = stats;
  const act = s?.activity ?? [];

  const statRow = [
    { label: "Total Scans",   value: s?.totalScans  ?? 0, color: T.cyan,   note: "pipeline runs"          },
    { label: "Issues Found",  value: s?.issuesFound ?? 0, color: T.error,  note: `${s?.critical ?? 0}c · ${s?.high ?? 0}h · ${s?.medium ?? 0}m` },
    { label: "Issues Fixed",  value: s?.issuesFixed ?? 0, color: T.green,  note: `${s?.fixRate ?? 0}% fix rate` },
    { label: "Quality Score", value: `${s?.qualityScore ?? 100}/100`, color: s?.qualityScore && s.qualityScore < 80 ? T.amber : T.green, note: "weighted health score" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* refresh indicator */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.cyan }} />
        <span style={{ ...mono, fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Auto-refresh · last {timeAgo(lastRefresh.toISOString())}
        </span>
        <button onClick={load} style={{ ...mono, fontSize: 9, color: T.cyan, background: "transparent", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>↺ Refresh</button>
      </div>

      {/* ── ROW 1: stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {statRow.map(s => (
          <div key={s.label} style={{ ...card, padding: "16px 18px" }}>
            <div style={{ ...mono, fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ ...head, fontSize: 28, color: s.color, marginBottom: 3 }}>{loading ? "—" : s.value}</div>
            <div style={{ ...mono, fontSize: 10, color: T.muted }}>{s.note}</div>
          </div>
        ))}
      </div>

      {/* ── ROW 2: activity chart + severity donut ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ ...head, fontSize: 13, color: T.text }}>7-Day Scan Activity</div>
            <div style={{ display: "flex", gap: 12, ...mono, fontSize: 10, color: T.muted }}>
              {[["Scans", T.cyan], ["Found", T.error], ["Fixed", T.green]].map(([l, c]) => (
                <span key={l as string} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: c as string }} />
                  {l}
                </span>
              ))}
            </div>
          </div>
          <ActivityLineChart data={act} />
        </div>
        <div style={card}>
          <div style={{ ...head, fontSize: 13, color: T.text, marginBottom: 16 }}>Severity Distribution</div>
          <SeverityDonut critical={s?.critical ?? 0} high={s?.high ?? 0} medium={s?.medium ?? 0} low={s?.low ?? 0} />
        </div>
      </div>

      {/* ── ROW 3: fix rate gauge + quality ring + language breakdown ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <div style={card}>
          <div style={{ ...head, fontSize: 13, color: T.text, marginBottom: 12 }}>Fix Rate</div>
          <FixRateGauge rate={s?.fixRate ?? 0} fixed={s?.issuesFixed ?? 0} total={s?.issuesFound ?? 0} />
        </div>
        <div style={card}>
          <div style={{ ...head, fontSize: 13, color: T.text, marginBottom: 12 }}>Code Health</div>
          <QualityRing score={s?.qualityScore ?? 100} />
        </div>
        <div style={card}>
          <div style={{ ...head, fontSize: 13, color: T.text, marginBottom: 12 }}>Language Breakdown</div>
          <LangBreakdown files={s?.topFiles ?? []} />
        </div>
      </div>

      {/* ── ROW 4: severity bars + top files ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={card}>
          <div style={{ ...head, fontSize: 13, color: T.text, marginBottom: 16 }}>Severity Breakdown</div>
          <SeverityBars critical={s?.critical ?? 0} high={s?.high ?? 0} medium={s?.medium ?? 0} low={s?.low ?? 0} />
        </div>
        <div style={card}>
          <div style={{ ...head, fontSize: 13, color: T.text, marginBottom: 12 }}>Top Vulnerable Files</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(s?.topFiles ?? []).length === 0
              ? <div style={{ ...mono, fontSize: 11, color: T.muted }}>No file data yet</div>
              : (s?.topFiles ?? []).slice(0, 6).map(f => {
                  const max = Math.max(...(s?.topFiles ?? []).map(x => x.issuesFound), 1);
                  return (
                    <div key={f.fileName} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ ...mono, fontSize: 10, color: langColor(f.language), width: 16, textAlign: "center", flexShrink: 0 }}>{f.language?.slice(0, 2)?.toUpperCase()}</span>
                      <span style={{ ...mono, fontSize: 10, color: T.sub, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.fileName}>{f.fileName}</span>
                      <div style={{ width: 80, height: 5, background: T.b1, borderRadius: 1, flexShrink: 0 }}>
                        <div style={{ height: "100%", width: `${(f.issuesFound / max) * 100}%`, background: langColor(f.language), borderRadius: 1, opacity: 0.8 }} />
                      </div>
                      <span style={{ ...mono, fontSize: 10, color: T.error, width: 20, textAlign: "right", flexShrink: 0 }}>{f.issuesFound}</span>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </div>

      {/* ── ROW 5: full scan history table ── */}
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: `1px solid ${T.b1}` }}>
          <div style={{ ...head, fontSize: 13, color: T.text }}>Scan History</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.cyan }} className="animate-pulse" />
            <span style={{ ...mono, fontSize: 9, color: T.cyan, textTransform: "uppercase", letterSpacing: "0.08em" }}>LIVE</span>
            <span style={{ ...mono, fontSize: 9, color: T.muted, marginLeft: 8 }}>{history.length} records</span>
          </div>
        </div>
        <HistoryTable history={history} />
      </div>

    </div>
  );
}
