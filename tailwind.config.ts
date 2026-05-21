import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* ── existing dashboard tokens ── */
        bg: "#0a0a0a",
        fg: "#fafafa",
        muted: "#737373",
        border: "#262626",
        accent: "#22d3ee",
        "accent-dim": "#0e7490",
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#22c55e",
        /* ── Romer / SORK design system ── */
        "on-surface":             "#e5e2e3",
        "on-surface-variant":     "#c6c5d8",
        "outline":                "#8f8fa1",
        "outline-variant":        "#454655",
        "primary":                "#bec2ff",
        "on-primary":             "#000ba6",
        "secondary":              "#50d8e9",
        "tertiary":               "#ffb689",
        "error-token":            "#ffb4ab",
        "custom-bg":              "#070708",
        "custom-divider":         "#232426",
        "custom-divider-light":   "#1B1C1E",
        "custom-card-bg":         "#101112",
        "custom-sidebar":         "#0d0e0f",
        "custom-panel":           "#111214",
        "custom-text-muted":      "#9A9DA3",
        "custom-btn-primary":     "#5E6BFF",
        "custom-btn-text":        "#F0F1F2",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
        h1:   ["Manrope", "sans-serif"],
        h2:   ["Manrope", "sans-serif"],
        h3:   ["Manrope", "sans-serif"],
        h4:   ["Manrope", "sans-serif"],
        "body-lg":   ["Inter", "sans-serif"],
        "body-md":   ["Inter", "sans-serif"],
        "mono-data": ["Inter", "monospace"],
        "label-sm":  ["Inter", "sans-serif"],
      },
      fontSize: {
        "hero-headline": ["76px", { lineHeight: "1.05", letterSpacing: "-0.055em", fontWeight: "520" }],
        h1: ["48px", { lineHeight: "1.1",  letterSpacing: "-0.05em",  fontWeight: "520" }],
        h2: ["32px", { lineHeight: "1.2",  letterSpacing: "-0.05em",  fontWeight: "520" }],
        h3: ["24px", { lineHeight: "1.2",  letterSpacing: "-0.04em",  fontWeight: "520" }],
        h4: ["18px", { lineHeight: "1.4",  letterSpacing: "-0.02em",  fontWeight: "520" }],
        "body-lg":   ["16px", { lineHeight: "1.6", letterSpacing: "0em",    fontWeight: "400" }],
        "body-md":   ["14px", { lineHeight: "1.5", letterSpacing: "0em",    fontWeight: "400" }],
        "mono-data": ["13px", { lineHeight: "1",   letterSpacing: "-0.01em",fontWeight: "400" }],
        "label-sm":  ["12px", { lineHeight: "1",   letterSpacing: "0.02em", fontWeight: "500" }],
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "flow":       "flow 2s ease-in-out infinite",
        "glow":       "glow 2s ease-in-out infinite alternate",
        "slide-up":   "slideUp 0.4s ease-out",
        "fade-in":    "fadeIn 0.3s ease-out",
      },
      keyframes: {
        flow: {
          "0%, 100%": { strokeDashoffset: "100" },
          "50%":      { strokeDashoffset: "0" },
        },
        glow: {
          from: { boxShadow: "0 0 10px #22d3ee33" },
          to:   { boxShadow: "0 0 30px #22d3ee88, 0 0 60px #22d3ee33" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
