export const dynamic = "force-dynamic";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Shield } from "lucide-react";
import Link from "next/link";
import StatsCards    from "./_components/StatsCards";
import ActivityChart from "./_components/ActivityChart";
import ScanHistory   from "./_components/ScanHistory";
import TopFiles      from "./_components/TopFiles";
import KeysUsage     from "./_components/KeysUsage";
import KeyManager    from "./_components/KeyManager";
import UsageBar      from "./_components/UsageBar";
import ByokManager   from "./_components/ByokManager";
import ChatSection   from "./_components/ChatSection";

type View = "command" | "scans" | "fixes" | "verified" | "keys" | "reports";

interface Props {
  searchParams: Promise<{ view?: string; file?: string; code?: string }>;
}

const NAV_ITEMS: { icon: string; label: string; view: View; desc: string }[] = [
  { icon: "⚡", label: "Command",  view: "command",  desc: "Run scans & configure agents"   },
  { icon: "🔍", label: "Scans",    view: "scans",    desc: "View all vulnerability scans"   },
  { icon: "🛠",  label: "Fixes",   view: "fixes",    desc: "Review generated patches"        },
  { icon: "✓",  label: "Verified", view: "verified", desc: "Confirmed clean fixes"           },
  { icon: "🔑", label: "API Keys", view: "keys",     desc: "Manage license keys & BYOK"     },
  { icon: "📄", label: "Reports",  view: "reports",  desc: "Health scores & audit logs"     },
];

export default async function DashboardPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user   = await currentUser();
  const params = await searchParams;
  const view   = (params.view as View) ?? "command";

  let preloadedFile: { name: string; content: string } | undefined;
  if (params.file && params.code) {
    try {
      preloadedFile = {
        name:    params.file,
        content: Buffer.from(params.code, "base64").toString("utf-8"),
      };
    } catch { /* bad base64 */ }
  }

  const viewTitle: Record<View, string> = {
    command:  user?.firstName ? `Welcome back, ${user.firstName}` : "Command",
    scans:    "Scans",
    fixes:    "Fixes",
    verified: "Verified",
    keys:     "API Keys",
    reports:  "Reports",
  };

  const viewDesc: Record<View, string> = {
    command:  preloadedFile ? `File received — ${preloadedFile.name} ready to scan` : "Your security pipeline, live.",
    scans:    "Every security signal in one queue.",
    fixes:    "Review generated patches before applying.",
    verified: "Confirmed clean fixes ready for deploy.",
    keys:     "Manage license keys and BYOK credentials.",
    reports:  "Health scores, activity, and audit logs.",
  };

  return (
    <div style={{ background: "#070708", color: "#e5e2e3", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* ── Top Header ── */}
      <header style={{ background: "#0e0e0fcc", backdropFilter: "blur(12px)", borderBottom: "1px solid #232426", height: 56, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, flexShrink: 0 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(94,107,255,0.1)", border: "1px solid rgba(94,107,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield style={{ width: 14, height: 14, color: "#bec2ff" }} />
          </div>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "-0.03em" }}>SORK Cloud</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <UsageBar clerkId={userId} />
          <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
        </div>
      </header>

      {/* ── Body: sidebar + content ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: 220, background: "#0e0e0f", borderRight: "1px solid #454655", display: "flex", flexDirection: "column", padding: "0 0 16px", flexShrink: 0, minHeight: "calc(100vh - 56px)" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid #232426", marginBottom: 8 }}>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "-0.02em", color: "#e5e2e3" }}>OPERATIONS</div>
            <div style={{ fontSize: 10, color: "#c6c5d8", marginTop: 2, fontFamily: "monospace" }}>v1.3.0-stable</div>
          </div>

          {NAV_ITEMS.map(item => {
            const active = view === item.view;
            return (
              <Link
                key={item.view}
                href={`/dashboard?view=${item.view}`}
                title={item.desc}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 16px",
                  borderRight: active ? "2px solid #50d8e9" : "2px solid transparent",
                  color: active ? "#50d8e9" : "#c6c5d8",
                  background: active ? "#1c1b1d" : "transparent",
                  fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
                  fontWeight: 500, textDecoration: "none", transition: "background .1s, color .1s",
                }}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          {/* Launch scanner button */}
          <div style={{ marginTop: "auto", padding: "12px 8px 0", borderTop: "1px solid #232426" }}>
            <Link
              href="/dashboard?view=command"
              style={{ display: "block", background: "#5E6BFF", color: "#F0F1F2", borderRadius: 4, padding: "8px 16px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", textDecoration: "none" }}>
              ⚡ Launch Scanner
            </Link>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, overflow: "auto", padding: "28px 28px 48px" }}>

          {/* Page title */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.1, marginBottom: 4 }}>
              {viewTitle[view]}
            </h1>
            <p style={{ fontSize: 13, color: "#9A9DA3" }}>{viewDesc[view]}</p>
          </div>

          {/* ── COMMAND VIEW ── */}
          {view === "command" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <StatsCards clerkId={userId} />
              <ChatSection clerkId={userId} preloadedFile={preloadedFile} />
            </div>
          )}

          {/* ── SCANS VIEW ── */}
          {view === "scans" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <StatsCards clerkId={userId} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
                <ActivityChart clerkId={userId} />
                <TopFiles clerkId={userId} />
              </div>
              <ScanHistory clerkId={userId} />
            </div>
          )}

          {/* ── FIXES VIEW ── */}
          {view === "fixes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <StatsCards clerkId={userId} />
              <ScanHistory clerkId={userId} />
              <div style={{ background: "#101112", border: "1px solid #1B1C1E", borderRadius: 8, padding: 24, textAlign: "center", color: "#9A9DA3", fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>🛠</div>
                <div>Run <code style={{ color: "#50d8e9", background: "rgba(80,216,233,0.08)", padding: "2px 6px", borderRadius: 3 }}>sork fix</code> from your terminal to generate patches for pending issues above.</div>
              </div>
            </div>
          )}

          {/* ── VERIFIED VIEW ── */}
          {view === "verified" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <StatsCards clerkId={userId} />
              <ScanHistory clerkId={userId} />
              <div style={{ background: "#101112", border: "1px solid #1B1C1E", borderRadius: 8, padding: 24, textAlign: "center", color: "#9A9DA3", fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
                <div>Verified fixes appear here once the Verify Agent scores them <strong style={{ color: "#92f1ff" }}>≥ 80/100</strong>. Run <code style={{ color: "#50d8e9", background: "rgba(80,216,233,0.08)", padding: "2px 6px", borderRadius: 3 }}>sork verify</code> after applying a fix.</div>
              </div>
            </div>
          )}

          {/* ── API KEYS VIEW ── */}
          {view === "keys" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <KeysUsage clerkId={userId} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <KeyManager  clerkId={userId} />
                <ByokManager clerkId={userId} />
              </div>
            </div>
          )}

          {/* ── REPORTS VIEW ── */}
          {view === "reports" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <StatsCards clerkId={userId} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
                <ActivityChart clerkId={userId} />
                <TopFiles clerkId={userId} />
              </div>
              <KeysUsage clerkId={userId} />
              <ScanHistory clerkId={userId} />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
