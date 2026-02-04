import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "SolForge - Autonomous Solana Program Compiler",
  description: "Describe it. We build it. On Solana. AI-powered autonomous Solana program compilation and deployment.",
  keywords: ["Solana", "AI", "Blockchain", "Smart Contracts", "Autonomous", "Compiler"],
  openGraph: {
    title: "SolForge - Autonomous Solana Program Compiler",
    description: "Describe it. We build it. On Solana.",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SolForge - Autonomous Solana Program Compiler",
    description: "Describe it. We build it. On Solana.",
  },
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
      </head>
      <body className="bg-matrix min-h-screen antialiased">
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
