export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Shield } from "lucide-react";
import Link from "next/link";
import UsageBar    from "./_components/UsageBar";
import ChatSection from "./_components/ChatSection";
import ScansView   from "./_components/ScansView";
import KeyManager  from "./_components/KeyManager";
import ByokManager from "./_components/ByokManager";
import KeysUsage   from "./_components/KeysUsage";
import { ShimmerIcon } from "@/components/ShimmerIcon";
import type { IconType } from "@/components/ShimmerIcon";

type View = "command" | "scans" | "keys";

interface Props {
  searchParams: Promise<{ view?: string; file?: string; code?: string }>;
}

const NAV: { icon: IconType; label: string; view: View; desc: string }[] = [
  { icon: "command", label: "Command",  view: "command", desc: "Chat with sork.ai — scan, fix, configure" },
  { icon: "scans",   label: "Scans",    view: "scans",   desc: "Full vulnerability dashboard & graphs"   },
  { icon: "keys",    label: "API Keys", view: "keys",    desc: "License keys, BYOK, usage"               },
];

export default async function DashboardPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user   = await currentUser();
  const params = await searchParams;
  const view   = ((params.view ?? "command") as View);

  let preloadedFile: { name: string; content: string } | undefined;
  if (params.file && params.code) {
    try { preloadedFile = { name: params.file, content: Buffer.from(params.code, "base64").toString("utf-8") }; }
    catch { /* bad base64 */ }
  }

  const titles: Record<View, string> = {
    command: user?.firstName ? `Welcome back, ${user.firstName}` : "Command",
    scans:   "Security Dashboard",
    keys:    "API Keys",
  };
  const descs: Record<View, string> = {
    command: preloadedFile ? `File received — ${preloadedFile.name} ready to scan` : "Chat with sork.ai to scan, fix and verify your code.",
    scans:   "Live vulnerability data, trends, and full scan analytics.",
    keys:    "Manage license keys and BYOK credentials.",
  };

  return (
    <div style={{ background: "#070708", color: "#e5e2e3", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{ background: "#0e0e0fee", backdropFilter: "blur(12px)", borderBottom: "1px solid #232426", height: 54, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, flexShrink: 0 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 26, height: 26, borderRadius: 4, background: "rgba(94,107,255,0.1)", border: "1px solid rgba(94,107,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield style={{ width: 13, height: 13, color: "#bec2ff" }} />
          </div>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "-0.03em" }}>SORK Cloud</span>
        </Link>
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
            <div style={{ fontSize: 9, color: "#c6c5d8", marginTop: 2, fontFamily: "monospace" }}>v1.3.0-stable</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", paddingTop: 6 }}>
            {NAV.map(item => {
              const active = view === item.view;
              return (
                <Link key={item.view} href={`/dashboard?view=${item.view}`} title={item.desc}
                  style={{
                    display: "flex", alignItems: "center", gap: 11, padding: "11px 16px",
                    borderRight: active ? "2px solid #50d8e9" : "2px solid transparent",
                    color: active ? "#50d8e9" : "#8a8fa8",
                    background: active ? "#1c1b1d" : "transparent",
                    fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
                    fontWeight: 600, textDecoration: "none",
                    transition: "background 0.15s, color 0.15s",
                  }}>
                  <ShimmerIcon type={item.icon} active={active} size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div style={{ marginTop: "auto", padding: "10px 8px", borderTop: "1px solid #232426" }}>
            <div style={{ fontSize: 9, color: "#9A9DA3", fontFamily: "monospace", textAlign: "center" }}>sork.ai · always on</div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflow: "auto", padding: "24px 28px 48px", background: "#050506" }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.1, marginBottom: 3 }}>{titles[view]}</h1>
            <p style={{ fontSize: 12, color: "#9A9DA3" }}>{descs[view]}</p>
          </div>

          {view === "command" && <ChatSection clerkId={userId} preloadedFile={preloadedFile} />}
          {view === "scans"   && <ScansView   clerkId={userId} />}
          {view === "keys"    && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <KeysUsage  clerkId={userId} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <KeyManager  clerkId={userId} />
                <ByokManager clerkId={userId} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
