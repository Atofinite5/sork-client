import Link from "next/link";

// Force dynamic so Clerk in root layout never tries to prerender this with a placeholder key
export const dynamic = "force-dynamic";
export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <p className="text-6xl font-bold text-accent">404</p>
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-muted text-sm">The page you're looking for doesn't exist.</p>
        <Link href="/" className="inline-block px-5 py-2 bg-accent text-bg text-sm font-semibold rounded-xl hover:bg-accent/90 transition-colors">
          Go home
        </Link>
      </div>
    </div>
  );
}
