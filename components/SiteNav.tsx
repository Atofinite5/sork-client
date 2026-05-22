"use client";

import Link from "next/link";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Platform", href: "/#features" },
  { label: "Docs",     href: "/docs"       },
  { label: "Pricing",  href: "/pricing"    },
];

export default function SiteNav() {
  const { isSignedIn } = useUser();
  const path = usePathname();

  return (
    <header style={{
      background: "#0e0e0fdd",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #454655",
      height: 80,
      display: "flex",
      alignItems: "center",
      padding: "0 32px",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sork-logo.png" alt="SORK" style={{ width: 40, height: 40, objectFit: "contain" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sork-wordmark.png" alt="SORK" style={{ height: 28, width: "auto", objectFit: "contain" }} />
      </Link>

      {/* Nav links */}
      <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {NAV_LINKS.map(l => {
          const active = path === l.href || (l.href !== "/" && path.startsWith(l.href.split("#")[0]!));
          return (
            <Link key={l.label} href={l.href}
              style={{
                fontSize: 14,
                color: active ? "#bec2ff" : "#c6c5d8",
                textDecoration: "none",
                borderBottom: active ? "2px solid #bec2ff" : "none",
                paddingBottom: active ? 3 : 0,
                transition: "color .15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#bec2ff")}
              onMouseLeave={e => (e.currentTarget.style.color = active ? "#bec2ff" : "#c6c5d8")}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      {/* Auth */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {isSignedIn ? (
          <Link href="/dashboard"
            style={{ background: "#5E6BFF", color: "#F0F1F2", padding: "8px 18px", borderRadius: 4, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            Dashboard
          </Link>
        ) : (
          <>
            <SignInButton mode="modal">
              <button style={{ background: "transparent", border: "1px solid #232426", color: "#c6c5d8", padding: "7px 16px", borderRadius: 4, fontSize: 13, cursor: "pointer" }}>
                Log in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button style={{ background: "#fff", color: "#000", padding: "8px 16px", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none" }}>
                Start free
              </button>
            </SignUpButton>
          </>
        )}
      </div>
    </header>
  );
}
