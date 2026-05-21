// Server wrapper — force-dynamic prevents SSG which crashes ClerkProvider
// when no valid publishable key is available (Preview / CI environments).
export const dynamic = "force-dynamic";
export { default } from "./_home";
