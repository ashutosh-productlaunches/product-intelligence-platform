// Fonts for the demo screen only. The journey page keeps the site's default fonts.
import { Instrument_Sans, Josefin_Sans, JetBrains_Mono } from "next/font/google";

const display = Josefin_Sans({ subsets: ["latin"], weight: ["200", "300", "400"], variable: "--font-tm-display" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-tm-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-tm-mono" });

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${body.variable} ${mono.variable} flex flex-1 flex-col`}>{children}</div>;
}
