import type { Metadata } from "next";
import { Figtree, IBM_Plex_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

// Two families only (docs/design-direction.md): one sans for all text and labels,
// a mono for code and nothing else.
const sans = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Set NEXT_PUBLIC_GA_ID in Vercel (Production) to turn Google Analytics on. Unset: nothing loads.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  title: "BuildAI Lab",
  description: "For product managers: understand how AI apps actually work by building one, so you make better AI product decisions and hold real conversations with engineers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Smooth scrolling for in-page links (globals.css), but not when moving between pages.
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
      {/* Google Analytics: only when a Measurement ID (G-…) is set in Vercel's environment variables. */}
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
