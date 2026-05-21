// Server wrapper — force-dynamic prevents SSG which would crash
// ClerkProvider in layout.tsx when no valid publishable key is present.
export const dynamic = "force-dynamic";
export { default } from "./_client";
