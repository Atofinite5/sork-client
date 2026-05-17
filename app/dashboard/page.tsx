import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import KeyManager from "./_components/KeyManager";
import UsageBar from "./_components/UsageBar";
import ByokManager from "./_components/ByokManager";
import ChatSection from "./_components/ChatSection";
import AgentPipeline from "./_components/AgentPipeline";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* Header */}
      <header className="border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
              <span className="text-accent text-sm font-bold">S</span>
            </div>
            <span className="font-bold">SORK Cloud</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted text-sm">{user?.emailAddresses[0]?.emailAddress}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Welcome + Usage */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
            </h1>
            <p className="text-muted text-sm mt-1">Your security pipeline is ready.</p>
          </div>
          <UsageBar clerkId={userId} />
        </div>

        {/* Agent Pipeline Visualization */}
        <AgentPipeline />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chat with SORK */}
          <div className="lg:col-span-2">
            <ChatSection clerkId={userId} />
          </div>

          {/* BYOK Manager */}
          <ByokManager clerkId={userId} />

          {/* License Keys */}
          <KeyManager clerkId={userId} />
        </div>
      </main>
    </div>
  );
}
