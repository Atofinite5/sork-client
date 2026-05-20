import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Shield } from "lucide-react";
import Link from "next/link";
import StatsCards   from "./_components/StatsCards";
import ActivityChart from "./_components/ActivityChart";
import ScanHistory  from "./_components/ScanHistory";
import TopFiles     from "./_components/TopFiles";
import KeysUsage    from "./_components/KeysUsage";
import KeyManager   from "./_components/KeyManager";
import UsageBar     from "./_components/UsageBar";
import ByokManager  from "./_components/ByokManager";
import ChatSection  from "./_components/ChatSection";
import AgentPipeline from "./_components/AgentPipeline";

interface Props {
  searchParams: Promise<{ file?: string; code?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user   = await currentUser();
  const params = await searchParams;

  let preloadedFile: { name: string; content: string } | undefined;
  if (params.file && params.code) {
    try {
      preloadedFile = {
        name:    params.file,
        content: Buffer.from(params.code, "base64").toString("utf-8"),
      };
    } catch { /* bad base64 */ }
  }

  return (
    <div className="min-h-screen bg-bg text-fg">

      {/* ── Header ── */}
      <header className="border-b border-border bg-bg/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="font-semibold text-sm tracking-tight">SORK Cloud</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-muted">
            <Link href="/dashboard" className="text-fg font-medium">Dashboard</Link>
            <Link href="/pricing" className="hover:text-fg transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            <UsageBar clerkId={userId} />
            <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Welcome row ── */}
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {user?.firstName ? `Welcome back, ${user.firstName}` : "Dashboard"}
          </h1>
          <p className="text-muted text-sm mt-1">
            {preloadedFile
              ? `File received from VS Code — @${preloadedFile.name} ready to scan`
              : "Your security pipeline, live."}
          </p>
        </div>

        {/* ── Stats cards ── */}
        <StatsCards clerkId={userId} />

        {/* ── Pipeline + Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivityChart clerkId={userId} />
          </div>
          <div>
            <AgentPipeline />
          </div>
        </div>

        {/* ── History + Top Files ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ScanHistory clerkId={userId} />
          </div>
          <div>
            <TopFiles clerkId={userId} />
          </div>
        </div>

        {/* ── Per-key analytics (Pro) ── */}
        <KeysUsage clerkId={userId} />

        {/* ── Chat + BYOK + Keys row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <ChatSection clerkId={userId} preloadedFile={preloadedFile} />
          </div>
          <ByokManager clerkId={userId} />
          <KeyManager  clerkId={userId} />
        </div>

      </main>
    </div>
  );
}
