import Link from "next/link";
import { Shield } from "lucide-react";
import PricingTiers from "./_components/PricingTiers";

export const metadata = { title: "Pricing — SORK Cloud" };

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* Nav */}
      <nav className="border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <span className="font-bold">SORK Cloud</span>
          </Link>
          <Link href="/dashboard" className="text-muted hover:text-fg text-sm transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="py-24 px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple pricing</h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Start free. Upgrade when you need more scans, keys, or team features.
          </p>
        </div>

        <PricingTiers />

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-24 space-y-6">
          <h2 className="text-xl font-bold text-center mb-8">FAQ</h2>
          {[
            {
              q: "What is a scan request?",
              a: "One POST to /api/scan counts as one request. It runs the full Triage → Fix → Verify pipeline on your code.",
            },
            {
              q: "What is BYOK?",
              a: "Bring Your Own Key — you can add your own Groq, Claude, NVIDIA, OpenAI, or custom API endpoint. SORK uses your key to run the agents, so you're not limited to our quota.",
            },
            {
              q: "Are my API keys safe?",
              a: "Yes. All BYOK keys are encrypted at rest using AES-256-GCM before being stored in the database.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes. Cancel any time from your dashboard. Your plan stays active until the end of the billing period.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="border border-border rounded-xl p-5">
              <p className="font-medium mb-2">{q}</p>
              <p className="text-muted text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-8 px-6 text-center text-muted text-sm">
        <p>© {new Date().getFullYear()} SORK Cloud · Built by Bhargav Kalambhe</p>
      </footer>
    </div>
  );
}
