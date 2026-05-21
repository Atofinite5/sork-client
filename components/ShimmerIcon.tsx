"use client";

/**
 * Shimmer SVG icons — no default OS emojis.
 * Each icon uses a gradient that animates across the path (shimmer effect).
 * Active icons shimmer faster and brighter.
 */

export type IconType = "command" | "scans" | "fixes" | "verified" | "keys" | "reports";

interface Props {
  type: IconType;
  active?: boolean;
  size?: number;
}

export function ShimmerIcon({ type, active = false, size = 16 }: Props) {
  const id = `shi-${type}-${active ? "a" : "i"}`;
  const color  = active ? "#50d8e9" : "#8a8fa8";
  const bright = active ? "#ffffff" : "#c6c5d8";
  const dur    = active ? "1.6s" : "3.2s";

  /* Animated shimmer gradient — sweeps left→right */
  const grad = (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2={size} y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor={color}  stopOpacity="0.55" />
        <stop offset="45%"  stopColor={bright} stopOpacity="0.9"  />
        <stop offset="55%"  stopColor={bright} stopOpacity="1"    />
        <stop offset="100%" stopColor={color}  stopOpacity="0.55" />
        <animateTransform
          attributeName="gradientTransform"
          type="translate"
          from={`${-size * 1.5} 0`}
          to={`${size * 2.5} 0`}
          dur={dur}
          repeatCount="indefinite"
        />
      </linearGradient>
    </defs>
  );

  const f = `url(#${id})`;   // fill
  const s = `url(#${id})`;   // stroke

  const V = `0 0 ${size} ${size}`;

  /* ── Icon paths (16 × 16 grid) ── */

  if (type === "command") return (
    /* Terminal >_ */
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {grad}
      {/* Chevron */}
      <path d="M2 5L6.5 8L2 11" stroke={s} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Cursor underscore */}
      <path d="M8.5 11H14" stroke={s} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );

  if (type === "scans") return (
    /* Radar — 3 concentric arcs + dot */
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {grad}
      {/* Outer arc (top half) */}
      <path d="M1.5 9.5A6.5 6.5 0 0 1 14.5 9.5" stroke={s} strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
      {/* Mid arc */}
      <path d="M4 9.5A4 4 0 0 1 12 9.5" stroke={s} strokeWidth="1.4" strokeLinecap="round" opacity="0.75"/>
      {/* Inner arc */}
      <path d="M6 9.5A2 2 0 0 1 10 9.5" stroke={s} strokeWidth="1.4" strokeLinecap="round"/>
      {/* Center dot */}
      <circle cx="8" cy="9.5" r="1.2" fill={f}/>
      {/* Scan line */}
      <path d="M8 9.5L12.5 4" stroke={s} strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );

  if (type === "fixes") return (
    /* Diff — minus line strikethrough + plus line */
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {grad}
      {/* Minus row */}
      <path d="M2 6H11" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <path d="M12 6H14" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      {/* Plus row */}
      <path d="M2 10H8" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Plus symbol */}
      <path d="M11 8V12M9 10H13" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  if (type === "verified") return (
    /* Shield + checkmark */
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {grad}
      {/* Shield */}
      <path d="M8 1.5L2.5 4V8.5C2.5 11.5 5 13.5 8 14.5C11 13.5 13.5 11.5 13.5 8.5V4L8 1.5Z"
        stroke={s} strokeWidth="1.4" strokeLinejoin="round"/>
      {/* Check */}
      <path d="M5.5 8L7.2 9.8L10.5 6.5" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  if (type === "keys") return (
    /* Key — circular head + shank with teeth */
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {grad}
      {/* Key head (circle) */}
      <circle cx="5.5" cy="8" r="3.5" stroke={s} strokeWidth="1.4"/>
      {/* Key shank */}
      <path d="M8.8 8H14.5" stroke={s} strokeWidth="1.4" strokeLinecap="round"/>
      {/* Teeth */}
      <path d="M12.5 8V10.5" stroke={s} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M10.5 8V9.5" stroke={s} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );

  if (type === "reports") return (
    /* Bar chart — 3 bars ascending */
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {grad}
      {/* Axes */}
      <path d="M2 13H14" stroke={s} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      {/* Bar 1 (short) */}
      <rect x="3" y="9" width="2.5" height="4" rx="0.5" fill={f} opacity="0.6"/>
      {/* Bar 2 (medium) */}
      <rect x="6.75" y="6" width="2.5" height="7" rx="0.5" fill={f} opacity="0.8"/>
      {/* Bar 3 (tall) */}
      <rect x="10.5" y="3" width="2.5" height="10" rx="0.5" fill={f}/>
    </svg>
  );

  return null;
}
