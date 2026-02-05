import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "SolForge — AI-Powered Solana Program Builder",
  description: "Describe it. We build it. On Solana. Autonomous AI agent that compiles, deploys, and verifies Solana programs.",
  keywords: ["Solana", "AI", "Blockchain", "Smart Contracts", "Autonomous Agent", "Anchor"],
  openGraph: {
    title: "SolForge — AI-Powered Solana Program Builder",
    description: "Describe it. We build it. On Solana.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black min-h-screen antialiased bg-grid bg-orbs">
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
