export const dynamic = "force-dynamic";
import { SignIn } from "@clerk/nextjs";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* Top nav */}
      <nav className="px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-accent" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-fg">SORK Cloud</span>
        </Link>
        <Link href="/sign-up" className="text-xs text-muted hover:text-fg transition-colors">
          No account? <span className="text-accent">Sign up</span>
        </Link>
      </nav>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

          {/* Brand header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-fg mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-muted">
              Sign in to your SORK Cloud dashboard
            </p>
          </div>

          <SignIn
            appearance={{
              elements: {
                rootBox: { width: "100%" },
                card: { width: "100%" },
              },
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted pb-6">
        © {new Date().getFullYear()} SORK Cloud · Built by Bhargav Kalambhe
      </p>
    </div>
  );
}
