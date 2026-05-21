import SiteNav from "@/components/SiteNav";
import PricingCards from "./_components/PricingCards";

export const metadata = { title: "Pricing — SORK Cloud" };

export default async function PricingPage() {
  return (
    <div style={{ background: "#070708", color: "#e5e2e3", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Nav ── */}
      <SiteNav />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 32px" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: "clamp(36px,5vw,56px)", fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.1, marginBottom: 16 }}>
            Simple pricing
          </h1>
          <p style={{ color: "#9A9DA3", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
            Start free. Upgrade when you need more scans, keys, or team features.
          </p>
        </div>

        {/* ── Pricing cards ── */}
        <PricingCards />

        {/* ── Product preview — what you get ── */}
        <div style={{ marginTop: 96 }}>
          <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em", textAlign: "center", marginBottom: 8 }}>
            Everything in one pipeline
          </h2>
          <p style={{ color: "#9A9DA3", fontSize: 14, textAlign: "center", marginBottom: 48 }}>
            Every plan includes the full SORK command dashboard
          </p>

          {/* Dashboard preview */}
          <div style={{ background: "#101112", border: "1px solid #232426", borderRadius: 8, overflow: "hidden", display: "flex", height: 420, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.6)" }}>

            {/* Sidebar */}
            <div style={{ width: 220, background: "#0e0e0f", borderRight: "1px solid #454655", display: "flex", flexDirection: "column", padding: "0 0 16px" }}>
              <div style={{ padding: "16px", borderBottom: "1px solid #232426", marginBottom: 8 }}>
                <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "-0.02em", color: "#e5e2e3" }}>OPERATIONS</div>
                <div style={{ fontSize: 10, color: "#c6c5d8", marginTop: 2, fontFamily: "monospace" }}>v1.3.0-stable</div>
              </div>
              {[
                { icon: "⚡", label: "COMMAND",   active: false, desc: "Run scans & configure agents" },
                { icon: "🔍", label: "SCANS",     active: true,  desc: "View all vulnerability scans" },
                { icon: "🛠",  label: "FIXES",    active: false, desc: "Review generated patches" },
                { icon: "✓",  label: "VERIFIED",  active: false, desc: "Confirmed clean fixes" },
                { icon: "🔑", label: "API KEYS",  active: false, desc: "Manage license keys & BYOK" },
                { icon: "📄", label: "REPORTS",   active: false, desc: "Health scores & audit logs" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRight: item.active ? "2px solid #50d8e9" : "none", color: item.active ? "#50d8e9" : "#c6c5d8", background: item.active ? "#1c1b1d" : "transparent", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>
                  <span style={{ fontSize: 13 }}>{item.icon}</span>{item.label}
                </div>
              ))}
              <div style={{ marginTop: "auto", padding: "12px 8px 0", borderTop: "1px solid #232426" }}>
                <div style={{ background: "#5E6BFF", color: "#F0F1F2", borderRadius: 4, padding: "7px 16px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center" }}>⚡ Launch Scanner</div>
              </div>
            </div>

            {/* Feature breakdown by nav item */}
            <div style={{ flex: 1, background: "#0a0a0b", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "none" }}>
              {[
                {
                  icon: "🔍", title: "Scans",
                  items: ["TypeScript · JavaScript · Python", "Rust · Go · Java · C/C++ · Ruby", "CWE IDs + confidence scores", "40+ vulnerability patterns", "Nemotron safety gate on every scan"],
                  color: "#50d8e9",
                },
                {
                  icon: "🛠", title: "Fixes",
                  items: ["Groq llama-3.3-70b patches", "Minimal diff — only what's needed", "Per-issue change tracking", "Original vs patched comparison", "sork fix auto-applies patches"],
                  color: "#92f1ff",
                },
                {
                  icon: "✓", title: "Verified",
                  items: ["Score 0–100 per fix", "Residual issue detection", "New vulnerability check", "Approve / rework / escalate", "Full audit trail in dashboard"],
                  color: "#bec2ff",
                },
              ].map((col, i) => (
                <div key={col.title} style={{ padding: "24px 20px", borderRight: i < 2 ? "1px solid #1B1C1E" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 18 }}>{col.icon}</span>
                    <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 14, fontWeight: 700, color: col.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>{col.title}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {col.items.map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#c6c5d8" }}>
                        <span style={{ color: col.color, fontSize: 10 }}>✓</span>{item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row: API Keys + Reports */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            {[
              {
                icon: "🔑", title: "API Keys",
                items: ["Issue & revoke license keys", "Free: 1 key · Pro: 5 keys · Pro Plus: 20 keys", "BYOK: add Groq, Claude, NVIDIA, OpenAI, Cohere", "AES-256-GCM encrypted storage", "Live key health status (ok / limited / error)"],
                color: "#ffb689",
              },
              {
                icon: "📄", title: "Reports",
                items: ["sork doctor — project health score 0–100", "Language breakdown with bar chart", "High-risk file list with severity", "7-day activity timeline", "Issues found / fixed / quality score over time"],
                color: "#9A9DA3",
              },
            ].map(col => (
              <div key={col.title} style={{ background: "#101112", border: "1px solid #232426", borderRadius: 8, padding: "24px 20px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 18 }}>{col.icon}</span>
                  <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 14, fontWeight: 700, color: col.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>{col.title}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.items.map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#c6c5d8" }}>
                      <span style={{ color: col.color, fontSize: 10 }}>✓</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{ maxWidth: 640, margin: "80px auto 0" }}>
          <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em", textAlign: "center", marginBottom: 32 }}>FAQ</h2>
          {[
            { q: "What is a scan request?", a: "One POST to /api/scan counts as one request. It runs the full pipeline: Nemotron safety → Triage → Fix → Verify on your code." },
            { q: "What is BYOK?", a: "Bring Your Own Key — add your own Groq, Claude, NVIDIA, or custom API endpoint. SORK uses your key to run agents, bypassing quota limits." },
            { q: "Are my API keys safe?", a: "All BYOK keys are encrypted at rest using AES-256-GCM before being stored in the database." },
            { q: "Can I cancel anytime?", a: "Yes. Cancel anytime from your dashboard. Your plan stays active until the end of the billing period." },
          ].map(({ q, a }) => (
            <div key={q} style={{ borderBottom: "1px solid #1B1C1E", padding: "20px 0" }}>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: "#e5e2e3" }}>{q}</p>
              <p style={{ color: "#9A9DA3", fontSize: 13, lineHeight: 1.7 }}>{a}</p>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ borderTop: "1px solid #232426", padding: "24px 32px", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8f8fa1", fontFamily: "monospace", maxWidth: 1200, margin: "0 auto" }}>
        <span>Powered by Groq</span>
        <span>© {new Date().getFullYear()} Sork Inc.</span>
      </footer>
    </div>
  );
}
