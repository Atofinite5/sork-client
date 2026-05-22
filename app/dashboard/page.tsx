export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Shield } from "lucide-react";
import Link from "next/link";
import UsageBar          from "./_components/UsageBar";
import ChatSection       from "./_components/ChatSection";
import ScansView         from "./_components/ScansView";
import KeyManager        from "./_components/KeyManager";
import ByokManager       from "./_components/ByokManager";
import KeysUsage         from "./_components/KeysUsage";
import ReposView         from "./_components/ReposView";
import PullRequestsView  from "./_components/PullRequestsView";
import { ShimmerIcon }   from "@/components/ShimmerIcon";
import type { IconType } from "@/components/ShimmerIcon";

type View = "command" | "scans" | "repos" | "pulls" | "keys" | "settings" | "billing";

interface Props {
  searchParams: Promise<{ view?: string; file?: string; code?: string; repo?: string; connected?: string }>;
}

const NAV: { icon: IconType; label: string; view: View; desc: string; dividerAfter?: boolean }[] = [
  { icon: "command",  label: "Command",       view: "command", desc: "AI DevSecOps engineer — scan, fix, resolve" },
  { icon: "scans",    label: "Scans",         view: "scans",   desc: "Full vulnerability dashboard", dividerAfter: true },
  { icon: "reports",  label: "Repositories",  view: "repos",   desc: "Connect GitHub repos" },
  { icon: "fixes",    label: "Pull Requests", view: "pulls",   desc: "Review PRs & resolve merge conflicts", dividerAfter: true },
  { icon: "keys",     label: "API Keys",      view: "keys",    desc: "License keys & BYOK credentials" },
  { icon: "verified", label: "Settings",      view: "settings",desc: "Preferences & integrations" },
];

export default async function DashboardPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user   = await currentUser();
  const params = await searchParams;
  const view   = ((params.view ?? "command") as View);
  const repoParam = params.repo;

  let preloadedFile: { name: string; content: string } | undefined;
  if (params.file && params.code) {
    try { preloadedFile = { name: params.file, content: Buffer.from(params.code, "base64").toString("utf-8") }; }
    catch { /* bad base64 */ }
  }

  const titles: Record<View, string> = {
    command:  user?.firstName ? `Welcome back, ${user.firstName}` : "Command",
    scans:    "Security Dashboard",
    repos:    "Repositories",
    pulls:    "Pull Requests",
    keys:     "API Keys",
    settings: "Settings",
    billing:  "Billing",
  };
  const descs: Record<View, string> = {
    command:  preloadedFile ? `File received — ${preloadedFile.name} ready to scan` : "Your AI DevSecOps engineer — scan, fix, verify, and ship secure code.",
    scans:    "Live vulnerability data, trends, and full scan analytics.",
    repos:    "Connect GitHub to scan repositories, review PRs, and resolve conflicts.",
    pulls:    "Review open PRs, detect merge conflicts, and resolve them with AI.",
    keys:     "Manage license keys and BYOK credentials.",
    settings: "Configure your SORK Cloud environment.",
    billing:  "Manage your subscription and usage.",
  };

  return (
    <div style={{ background: "#070708", color: "#e5e2e3", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{ background: "#0e0e0fee", backdropFilter: "blur(12px)", borderBottom: "1px solid #232426", height: 54, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, flexShrink: 0 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sork-logo.png" alt="SORK" style={{ width: 34, height: 34, objectFit: "contain" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sork-wordmark.png" alt="SORK" style={{ height: 22, width: "auto", objectFit: "contain" }} />
        </Link>
        <div style={{ fontFamily: "'Inter', monospace", fontSize: 10, color: "#454655", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          AI DevSecOps Engineer
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <UsageBar clerkId={userId} />
          <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <aside style={{ width: 210, background: "#0e0e0f", borderRight: "1px solid #454655", display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "calc(100vh - 54px)" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #232426" }}>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "-0.01em", color: "#e5e2e3" }}>OPERATIONS</div>
            <div style={{ fontSize: 9, color: "#c6c5d8", marginTop: 2, fontFamily: "monospace" }}>v2.0.0-devsecops</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", paddingTop: 4 }}>
            {NAV.map(item => {
              const active = view === item.view;
              return (
                <div key={item.view}>
                  <Link href={`/dashboard?view=${item.view}`} title={item.desc}
                    style={{
                      display: "flex", alignItems: "center", gap: 11, padding: "10px 16px",
                      borderRight: active ? "2px solid #50d8e9" : "2px solid transparent",
                      color: active ? "#50d8e9" : "#8a8fa8",
                      background: active ? "#1c1b1d" : "transparent",
                      fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
                      fontWeight: 600, textDecoration: "none", transition: "background 0.15s",
                    }}>
                    <ShimmerIcon type={item.icon} active={active} size={15} />
                    {item.label}
                  </Link>
                  {item.dividerAfter && <div style={{ height: 1, background: "#1B1C1E", margin: "4px 0" }} />}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "auto", padding: "10px 8px", borderTop: "1px solid #232426" }}>
            <Link href="/pricing" style={{ display: "block", textAlign: "center", fontFamily: "monospace", fontSize: 9, color: "#9A9DA3", textDecoration: "none", padding: "4px 0" }}>
              Upgrade plan ↗
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflow: "auto", padding: "24px 28px 48px", background: "#050506" }}>
          {params.connected === "true" && (
            <div style={{ background: "rgba(146,241,255,0.08)", border: "1px solid rgba(146,241,255,0.25)", borderRadius: 4, padding: "10px 16px", marginBottom: 16, fontFamily: "monospace", fontSize: 12, color: "#92f1ff" }}>
              ✓ GitHub connected successfully
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.1, marginBottom: 3 }}>{titles[view]}</h1>
            <p style={{ fontSize: 12, color: "#9A9DA3" }}>{descs[view]}</p>
          </div>

          {view === "command" && <ChatSection clerkId={userId} preloadedFile={preloadedFile} />}
          {view === "scans"   && <ScansView clerkId={userId} />}
          {view === "repos"   && <ReposView clerkId={userId} />}
          {view === "pulls"   && <PullRequestsView clerkId={userId} repoParam={repoParam} />}
          {view === "keys"    && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <KeysUsage clerkId={userId} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <KeyManager  clerkId={userId} />
                <ByokManager clerkId={userId} />
              </div>
            </div>
          )}
          {view === "settings" && <SettingsView clerkId={userId} userName={user?.firstName ?? ""} email={user?.primaryEmailAddress?.emailAddress ?? ""} />}
          {view === "billing"  && <BillingView plan={user?.publicMetadata?.plan as string ?? "free"} />}
        </main>
      </div>
    </div>
  );
}

/* ── Inline Settings View ───────────────────────────── */
function SettingsView({ clerkId, userName, email }: { clerkId: string; userName: string; email: string }) {
  const T = { card: "#101112", b1: "#1B1C1E", text: "#e5e2e3", muted: "#9A9DA3", brand: "#5E6BFF", cyan: "#50d8e9" };
  const mono = { fontFamily: "'Inter', monospace" };
  const head = { fontFamily: "'Manrope', sans-serif", fontWeight: 700 };
  const sections = [
    { title: "Profile", items: [{ label: "Name", value: userName || "—" }, { label: "Email", value: email || "—" }, { label: "Clerk ID", value: clerkId.slice(0, 16) + "…" }] },
    { title: "Pipeline Defaults", items: [{ label: "Default model", value: "llama-3.3-70b-versatile" }, { label: "Safety gate", value: "Nemotron-3 (enabled)" }, { label: "Memory backend", value: "Cohere embed-english-v3.0" }] },
    { title: "Notifications", items: [{ label: "Scan complete", value: "In-dashboard" }, { label: "Critical findings", value: "Email + dashboard" }] },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {sections.map(s => (
        <div key={s.title} style={{ background: T.card, border: `1px solid ${T.b1}`, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ ...head, fontSize: 13, color: T.text, padding: "12px 16px", borderBottom: `1px solid ${T.b1}` }}>{s.title}</div>
          {s.items.map(item => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${T.b1}`, ...mono, fontSize: 12 }}>
              <span style={{ color: T.muted }}>{item.label}</span>
              <span style={{ color: T.text }}>{item.value}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Inline Billing View ────────────────────────────── */
function BillingView({ plan }: { plan: string }) {
  const T = { card: "#101112", b1: "#1B1C1E", text: "#e5e2e3", muted: "#9A9DA3", brand: "#5E6BFF", cyan: "#50d8e9", green: "#92f1ff" };
  const mono = { fontFamily: "'Inter', monospace" };
  const head = { fontFamily: "'Manrope', sans-serif", fontWeight: 700 };
  const plans = [
    { name: "Free",     price: "$0",  features: ["14 lifetime scans", "1 license key", "All 3 agents"], current: plan === "free" || !plan, link: null },
    { name: "Pro",      price: "$19/mo", features: ["Unlimited scans", "5 license keys", "Hybrid memory", "GitHub integration"], current: plan === "pro", link: "https://dashboard.skydo.com/pay/pyl_DvhKKI" },
    { name: "Pro Plus", price: "$28/mo", features: ["Everything in Pro", "20 license keys", "Team workspace", "SLA support"], current: plan === "pro_plus", link: "https://dashboard.skydo.com/pay/pyl_4Cfxc9" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, maxWidth: 800 }}>
      {plans.map(p => (
        <div key={p.name} style={{ background: p.current ? T.brand + "12" : T.card, border: `1px solid ${p.current ? T.brand + "60" : T.b1}`, borderRadius: 4, padding: "20px 18px" }}>
          <div style={{ ...head, fontSize: 16, color: T.text, marginBottom: 4 }}>{p.name}</div>
          <div style={{ ...head, fontSize: 26, color: p.current ? T.cyan : T.text, marginBottom: 12 }}>{p.price}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {p.features.map(f => (
              <div key={f} style={{ ...mono, fontSize: 12, color: T.muted, display: "flex", gap: 7 }}>
                <span style={{ color: T.green }}>✓</span>{f}
              </div>
            ))}
          </div>
          {p.current
            ? <div style={{ ...mono, fontSize: 11, textAlign: "center", color: T.green, padding: "8px 0", border: `1px solid ${T.green}30`, borderRadius: 2 }}>Current plan</div>
            : <a href={p.link!} target="_blank" rel="noreferrer"
                style={{ display: "block", textAlign: "center", ...mono, fontSize: 12, fontWeight: 700, background: T.brand, color: "#fff", padding: "8px 0", borderRadius: 2, textDecoration: "none" }}>
                Upgrade →
              </a>
          }
        </div>
      ))}
    </div>
  );
}
