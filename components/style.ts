// Shared class strings for the BuildAI Lab look (docs/design-direction.md).
// A = the manual (words), B = the bench (the machine).

// The one filled button: ink, square, mono. Used for the single "advance" action on screen.
export const button =
  "inline-block bg-ink px-4 py-2.5 font-mono text-[13px] font-medium text-paper hover:bg-signal disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink";

// A small mono label, sentence case (A).
export const label = "font-mono text-xs text-graphite";

// A bench panel label: the only place uppercase letter-spacing is allowed (B).
export const benchLabel = "font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-graphite";

// A bench panel: flat, square, hairline (B).
export const bench = "border border-ink/80 bg-paper-2";
