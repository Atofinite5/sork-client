import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        fg: "#fafafa",
        muted: "#737373",
        border: "#262626",
        accent: "#22d3ee",
        "accent-dim": "#0e7490",
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#22c55e",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "flow": "flow 2s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.4s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        flow: {
          "0%, 100%": { strokeDashoffset: "100" },
          "50%": { strokeDashoffset: "0" },
        },
        glow: {
          from: { boxShadow: "0 0 10px #22d3ee33" },
          to: { boxShadow: "0 0 30px #22d3ee88, 0 0 60px #22d3ee33" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
