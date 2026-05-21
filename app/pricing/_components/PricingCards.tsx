"use client";

import Link from "next/link";

const SUCCESS_URL = "https://sorkcloud.space/payment-success";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    note: "14 lifetime scans",
    features: ["1 license key", "All 3 agents", "Groq-powered", "BYOK support"],
    highlight: false,
    cta: "Get started free",
    href: "/sign-up",
    skydoLink: null,
  },
  {
    name: "Pro",
    price: "$19",
    note: "per month",
    features: ["Unlimited scans", "5 license keys", "Hybrid memory", "Priority queue"],
    highlight: true,
    cta: "Get Pro",
    href: null,
    skydoLink: "https://dashboard.skydo.com/pay/pyl_DvhKKI",
  },
  {
    name: "Pro Plus",
    price: "$28",
    note: "per month",
    features: ["Everything in Pro", "20 license keys", "Team dashboard", "SLA support"],
    highlight: false,
    cta: "Get Pro Plus",
    href: null,
    skydoLink: "https://dashboard.skydo.com/pay/pyl_4Cfxc9",
  },
];

export default function PricingCards() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, maxWidth: 900, margin: "0 auto" }}>
      {PLANS.map((plan) => {
        const url = plan.skydoLink
          ? `${plan.skydoLink}?redirect_url=${encodeURIComponent(`${SUCCESS_URL}?plan=${plan.name}`)}`
          : plan.href ?? "#";

        return (
          <div
            key={plan.name}
            style={{
              background: plan.highlight ? "#0f1129" : "#0e0e10",
              border: `1px solid ${plan.highlight ? "#5E6BFF" : "#1e1e22"}`,
              borderRadius: 12,
              padding: "28px 28px 24px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              boxShadow: plan.highlight ? "0 0 32px rgba(94,107,255,0.15)" : "none",
            }}
          >
            {/* Most popular badge */}
            {plan.highlight && (
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#5E6BFF", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 14px", borderRadius: 20, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                MOST POPULAR
              </div>
            )}

            {/* Plan name */}
            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 700, color: "#e5e2e3", marginBottom: 16 }}>
              {plan.name}
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", color: "#e5e2e3" }}>{plan.price}</span>
              <span style={{ fontSize: 13, color: "#9A9DA3" }}>{plan.note}</span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#1e1e22", margin: "20px 0" }} />

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, marginBottom: 24 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#c6c5d8" }}>
                  <span style={{ color: "#22c55e", fontSize: 14, flexShrink: 0 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>

            {/* CTA */}
            {plan.skydoLink ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  background: plan.highlight ? "#5E6BFF" : "transparent",
                  border: `1px solid ${plan.highlight ? "#5E6BFF" : "#2a2a2e"}`,
                  color: plan.highlight ? "#fff" : "#e5e2e3",
                  padding: "12px 0",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 700,
                  textAlign: "center",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "opacity .15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                {plan.cta}
              </a>
            ) : (
              <Link
                href={url}
                style={{
                  display: "block",
                  background: "transparent",
                  border: "1px solid #2a2a2e",
                  color: "#e5e2e3",
                  padding: "12px 0",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 700,
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                {plan.cta}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
