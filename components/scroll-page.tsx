// The building blocks of a long scrolling page (docs/design-direction.md):
// a navy hero band, then a main column of numbered sections beside a side panel that
// stays on screen. Each section's number sits in the left margin and stays put while
// you read that section, so you always know where you are without tabs.
import type { ReactNode } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

export function Hero({
  crumbs,
  eyebrow,
  title,
  lede,
  children,
}: {
  crumbs?: { label: string; href?: string }[];
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto w-full max-w-[76rem] px-4 pt-12 pb-14 sm:px-6 lg:px-10 lg:pt-16 lg:pb-20">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="font-label text-[13px] text-white/70">
            {crumbs.map((c, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-2 text-white/40">/</span>}
                {c.href ? (
                  <a href={c.href} className="hover:text-white hover:underline">
                    {c.label}
                  </a>
                ) : (
                  <span className="text-white/90">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="lg:max-w-[48rem]">
          {eyebrow && <p className="mt-6 font-label text-[13px] font-bold tracking-[0.08em] text-[#85b8ff] uppercase">{eyebrow}</p>}
          <h1 className="mt-3 text-[2.5rem] leading-[1.08] font-semibold tracking-[-0.02em] text-balance sm:text-[3.5rem]">{title}</h1>
          {lede && <div className="mt-5 text-[20px] leading-relaxed text-white/85">{lede}</div>}
          {children}
        </div>
      </div>
    </section>
  );
}

// Main column and side panel. The panel stays on screen on wide screens; on phones it
// comes after the content.
// railOnPhone=false hides the panel below the wide breakpoint (the page ends with its own way forward).
export function PageGrid({ children, rail, railOnPhone = true }: { children: ReactNode; rail?: ReactNode; railOnPhone?: boolean }) {
  return (
    <div className="mx-auto grid w-full max-w-[76rem] gap-12 px-4 pt-12 pb-24 sm:px-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16 lg:px-10 lg:pt-16">
      <div className="min-w-0">{children}</div>
      {rail && (
        <aside className={`min-w-0 ${railOnPhone ? "" : "hidden lg:block"}`}>
          <div className="lg:sticky lg:top-[5.5rem]">{rail}</div>
        </aside>
      )}
    </div>
  );
}

// One numbered section. The number stays in the margin while the section is on screen.
export function Numbered({
  n,
  id,
  eyebrow,
  heading,
  children,
}: {
  n: number;
  id: string;
  eyebrow: string;
  heading: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} data-section className="scroll-mt-24 border-t border-rule pt-10 pb-14 first:border-t-0 first:pt-0 lg:grid lg:grid-cols-[4.5rem_minmax(0,1fr)]">
      <div aria-hidden className="hidden lg:block">
        <p className="sticky top-[5.5rem] text-[2.5rem] leading-none font-semibold tracking-[-0.03em] text-signal tabular-nums">{pad(n)}</p>
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-label text-[12px] font-bold tracking-[0.08em] text-graphite uppercase">
          <span className="text-signal lg:hidden">{pad(n)}</span>
          <span aria-hidden className="hidden h-1.5 w-1.5 rounded-full bg-signal lg:inline-block" />
          {eyebrow}
        </p>
        <h2 className="mt-2 text-[2rem] leading-[1.15] font-semibold tracking-[-0.02em] text-balance sm:text-[2.25rem]">{heading}</h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

// "● 2 · SET UP A REAL PROJECT ————" between groups of rows.
export function GroupDivider({ n, label }: { n?: number; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-signal" />
      <p className="shrink-0 font-label text-[12px] font-bold tracking-[0.08em] uppercase">
        {n !== undefined && <>{n} · </>}
        {label}
      </p>
      <span aria-hidden className="h-px flex-1 bg-rule" />
    </div>
  );
}

// A numbered row with labelled pairs, e.g. a step: PROBLEM … / YOU LEARN …
export function Row({
  n,
  title,
  href,
  pairs,
  tag,
  dim = false,
}: {
  n?: number | string;
  title: ReactNode;
  href?: string;
  pairs: [string, ReactNode][];
  tag?: ReactNode;
  dim?: boolean;
}) {
  const body = (
    <>
      {n !== undefined && (
        <p className={`text-[1.75rem] leading-none font-semibold tracking-[-0.03em] tabular-nums ${dim ? "text-graphite/60" : "text-signal"}`}>
          {typeof n === "number" ? pad(n) : n}
        </p>
      )}
      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className={`text-[20px] leading-snug font-semibold ${href ? "group-hover:text-signal" : ""}`}>{title}</span>
          {tag}
        </p>
        <dl className="mt-3 grid gap-2.5">
          {pairs.map(([k, v]) => (
            <div key={k} className="grid gap-0.5 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-4">
              <dt className="pt-1 font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">{k}</dt>
              <dd className="text-[16px] leading-relaxed">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
  const cls = `grid gap-3 rounded-[3px] border border-rule bg-paper p-5 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-5 sm:p-6 ${dim ? "bg-paper-2" : ""}`;
  return href ? (
    <a href={href} className={`group ${cls} hover:border-signal`}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

// A small status label, Atlassian-style.
export function Lozenge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "blue" | "green" }) {
  const c = tone === "blue" ? "bg-signal-soft text-[#0b4fb0]" : tone === "green" ? "bg-[#dcfff1] text-pass" : "bg-paper-2 text-graphite";
  return <span className={`rounded-[3px] px-1.5 py-0.5 font-label text-[11px] font-bold tracking-[0.04em] uppercase ${c}`}>{children}</span>;
}

// A white card for the side panel.
export function RailCard({ children }: { children: ReactNode }) {
  return <div className="rounded-[3px] border border-rule bg-paper p-5 shadow-[0_1px_1px_rgba(9,30,66,0.13),0_0_1px_rgba(9,30,66,0.13)]">{children}</div>;
}
