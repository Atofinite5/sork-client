"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import Link from "next/link";

const SUCCESS_URL = "https://sorkcloud.space/payment-success";

interface Plan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  keys: number;
  requests: string;
  highlight: boolean;
  skydoLink?: string;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Try SORK with no commitment.",
    features: [
      "14 lifetime scan requests",
      "1 license key",
      "Groq-powered agents",
      "Nemotron safety gate",
      "BYOK support",
    ],
    keys: 1,
    requests: "14 lifetime",
    highlight: false,
  },
  {
    name: "Pro",
    monthlyPrice: 19,
    annualPrice: 16,
    description: "For developers who ship regularly.",
    features: [
      "Unlimited scan requests",
      "5 license keys",
      "All three agents",
      "Hybrid memory (Cohere)",
      "BYOK support",
      "Priority queue",
    ],
    keys: 5,
    requests: "Unlimited",
    highlight: true,
    skydoLink: "https://dashboard.skydo.com/pay/pyl_DvhKKI",
  },
  {
    name: "Pro Plus",
    monthlyPrice: 28,
    annualPrice: 23,
    description: "For teams and power users.",
    features: [
      "Everything in Pro",
      "20 license keys",
      "Team usage dashboard",
      "Dedicated scan queue",
      "SLA support",
    ],
    keys: 20,
    requests: "Unlimited",
    highlight: false,
    skydoLink: "https://dashboard.skydo.com/pay/pyl_4Cfxc9",
  },
];

export default function PricingTiers() {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <span className={`text-sm ${!annual ? "text-fg" : "text-muted"}`}>Monthly</span>
        <button
          onClick={() => setAnnual((v) => !v)}
          className={`w-12 h-6 rounded-full border transition-colors relative ${
            annual ? "bg-accent/20 border-accent/40" : "bg-border border-border"
          }`}
        >
          <motion.div
            animate={{ x: annual ? 24 : 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-1 w-4 h-4 rounded-full bg-accent"
          />
        </button>
        <span className={`text-sm ${annual ? "text-fg" : "text-muted"}`}>
          Annual{" "}
          <span className="text-success text-xs font-medium">save 17%</span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan, i) => {
          const skydoUrl = plan.skydoLink
            ? `${plan.skydoLink}?redirect_url=${encodeURIComponent(`${SUCCESS_URL}?plan=${plan.name}`)}`
            : undefined;

          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border p-6 flex flex-col relative ${
                plan.highlight
                  ? "border-accent/40 bg-accent/5 glow-cyan"
                  : "border-border bg-[#0f0f0f]"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-accent text-bg text-xs font-bold rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                <p className="text-muted text-sm mb-4">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold">
                    ${annual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-muted text-sm mb-1">/mo</span>
                  )}
                </div>
                {annual && plan.monthlyPrice > 0 && (
                  <p className="text-xs text-muted mt-1">
                    billed ${plan.annualPrice * 12}/year
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-muted">{f}</span>
                  </li>
                ))}
              </ul>

              {plan.monthlyPrice === 0 ? (
                <Link
                  href="/sign-up"
                  className="w-full py-2.5 border border-border rounded-xl text-sm font-medium text-center hover:border-accent/40 hover:text-accent transition-colors"
                >
                  Get started free
                </Link>
              ) : (
                <a
                  href={skydoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-colors ${
                    plan.highlight
                      ? "bg-accent text-bg hover:bg-accent/90"
                      : "border border-accent/30 text-accent hover:bg-accent/10"
                  }`}
                >
                  Get {plan.name}
                </a>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted mt-8">
        Payments processed securely via Skydo · Plan activated within 24h · Cancel anytime
      </p>
    </div>
  );
}
