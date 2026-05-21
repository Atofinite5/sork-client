import type { Metadata } from "next";
import { Inter, Manrope, GFS_Didot } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerkTheme";
import "./globals.css";

const inter    = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope  = Manrope({ subsets: ["latin"], variable: "--font-manrope", weight: ["400","500","600","700","800"] });
const gfsDidot = GFS_Didot({ weight: "400", subsets: ["greek","latin"], variable: "--font-didot" });

export const metadata: Metadata = {
  title: "SORK Cloud — AI Security Pipeline",
  description: "Multi-agent security scanning powered by sork.ai",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "pk_test_placeholder"}
      appearance={clerkAppearance}
    >
      <html lang="en" className={`${inter.variable} ${manrope.variable} ${gfsDidot.variable}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
