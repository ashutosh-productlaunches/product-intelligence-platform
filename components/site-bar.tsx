"use client";
// The one navigation on every journey page: a bar fixed at the top, and the table of
// contents behind it (docs/design-direction.md).
//   The bar:      BuildAI Lab │ where you are │ Contents
//   Contents:     every journey. Built ones list their parts and steps, with done and
//                 current marks; journeys still to come are listed, dimmed. Then the
//                 other pages. Same sheet on desktop and phone.
import { useEffect, useState } from "react";
import { useSavedStep } from "@/components/progress";
import Link from "next/link";

export type ContentsJourney = {
  n: number;
  title: string;
  href?: string; // overview page; absent for journeys not built yet
  status?: string; // "Planned", "Upcoming" for journeys not built yet
  parts?: { title: string; steps: { n: number; title: string; href: string }[] }[];
  finishHref?: string;
};
type PageLink = { label: string; href: string };

const pad = (n: number) => String(n).padStart(2, "0");

// The main places, always visible in the bar on wide screens.
const NAV: PageLink[] = [
  { label: "Journeys", href: "/#journeys" },
  { label: "Live demo", href: "/demo" },
  { label: "System map", href: "/architecture" },
  { label: "What you'll learn", href: "/roadmap" },
  { label: "Why I built this", href: "/why" },
];

function JourneyList({
  j,
  here,
  onPick,
}: {
  j: ContentsJourney;
  here?: number; // the step on screen, if this is the journey you're in
  onPick: () => void;
}) {
  // Off the journey's pages, mark the step last visited in this browser.
  const last = useSavedStep(j.n);
  return (
    <div>
      <p className="font-label text-[13px] text-graphite">
        Journey {j.n} · {j.parts!.reduce((a, p) => a + p.steps.length, 0)} steps
      </p>
      <a href={j.href} onClick={onPick} className="mt-1 block text-2xl leading-tight font-semibold hover:text-signal">
        {j.title}
      </a>
      <ol className="mt-5 grid gap-5">
        {j.parts!.map((part, i) => (
          <li key={part.title}>
            <p className="font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">
              {i + 1} · {part.title}
            </p>
            <ol className="mt-1.5 grid">
              {part.steps.map((s) => {
                const now = s.n === here;
                return (
                  <li key={s.n}>
                    <a
                      href={s.href}
                      onClick={onPick}
                      aria-current={now ? "page" : undefined}
                      className={`group flex items-baseline gap-3 py-1 text-[17px] leading-snug ${now ? "font-semibold text-signal" : ""}`}
                    >
                      <span className="w-6 shrink-0 font-label text-[13px] text-graphite tabular-nums">{pad(s.n)}</span>
                      <span className="group-hover:text-signal">{s.title}</span>
                      <span aria-hidden className="leader" />
                      <span className={`shrink-0 font-label text-[13px] ${now ? "text-signal" : "text-graphite"}`}>
                        {now ? "you are here" : here === undefined && s.n === last ? "last visited" : ""}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Contents({
  journeys,
  links,
  current,
  onPick,
}: {
  journeys: ContentsJourney[];
  links: PageLink[];
  current?: { journey: number; step?: number };
  onPick: () => void;
}) {
  const built = journeys.filter((j) => j.parts);
  const later = journeys.filter((j) => !j.parts);

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] md:gap-16">
      {/* Phones: the main places first (on wide screens they're in the bar). */}
      <ul className="grid gap-1 border-b border-rule pb-6 lg:hidden">
        {NAV.map((l) => (
          <li key={l.href}>
            <a href={l.href} onClick={onPick} className="block py-1.5 text-[19px] font-semibold hover:text-signal">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="grid gap-10">
        {built.map((j) => (
          <JourneyList key={j.n} j={j} here={current?.journey === j.n ? current.step : undefined} onPick={onPick} />
        ))}
      </div>

      <div className="grid content-start gap-8 border-t border-rule pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
        {later.length > 0 && (
          <div>
            <p className="font-label text-[13px] text-graphite">Still to come</p>
            <ul className="mt-2 grid gap-3">
              {later.map((u) => (
                <li key={u.n} className="text-graphite">
                  <span className="block font-label text-[13px]">
                    Journey {u.n} · {u.status}
                  </span>
                  <span className="block leading-snug">{u.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <p className="font-label text-[13px] text-graphite">Elsewhere</p>
          <ul className="mt-2 grid gap-1 text-[17px]">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="prose-link">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// "Continue" in the bar: one click back to where the learner left off, from any page.
// Hidden until they've got past step 1, and on the step they're already reading.
function BarContinue({ j, here }: { j: ContentsJourney; here?: number }) {
  const at = useSavedStep(j.n);
  const steps = j.parts!.flatMap((p) => p.steps);
  if (at < 2 || at > steps.length + 1 || at === here) return null;
  const finished = at > steps.length;
  const href = finished ? j.finishHref ?? j.href! : steps[at - 1].href;
  return (
    <a
      href={href}
      title={finished ? "See what you built" : `Continue: step ${at} · ${steps[at - 1].title}`}
      className="shrink-0 rounded-full bg-signal px-3.5 py-1.5 text-[14px] font-semibold whitespace-nowrap text-white hover:bg-signal-hover"
    >
      {finished ? "Your app" : <>Continue<span className="hidden sm:inline"> · step {at}</span></>}
    </a>
  );
}

export function SiteBar({
  where,
  journeys,
  links,
  current,
  wide = false,
}: {
  where?: string; // e.g. "Journey 1 · Step 6 of 12"; shown on phones, where the links don't fit
  journeys: ContentsJourney[];
  links: PageLink[];
  current?: { journey: number; step?: number };
  wide?: boolean; // full width, to line up with the journey sidebar
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper">
      <div className={`mx-auto flex h-14 w-full items-center gap-4 px-4 sm:px-6 ${wide ? "lg:px-5" : "max-w-[76rem] lg:px-10"}`}>
        <Link href="/" className={`shrink-0 text-[19px] font-bold tracking-[-0.01em] ${wide ? "lg:w-[16.25rem]" : ""}`}>
          BuildAI Lab
        </Link>
        <p className="min-w-0 flex-1 truncate border-l border-rule pl-4 font-label text-[13px] text-graphite lg:hidden">{where}</p>
        <nav aria-label="Main" className="hidden min-w-0 flex-1 items-center gap-1 lg:flex">
          {NAV.map((l) => (
            <a key={l.href} href={l.href} className="rounded-[3px] px-3 py-1.5 text-[15px] font-medium whitespace-nowrap text-ink hover:bg-paper-2 hover:text-signal">
              {l.label}
            </a>
          ))}
        </nav>
        {journeys
          .filter((j) => j.parts)
          .slice(0, 1)
          .map((j) => (
            <BarContinue key={j.n} j={j} here={current?.journey === j.n ? current.step : undefined} />
          ))}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="contents"
          className="shrink-0 rounded-[3px] border border-rule px-3 py-1.5 text-[14px] font-semibold hover:bg-paper-2"
        >
          {open ? "Close" : (
            <>
              <span aria-hidden className="mr-1.5">☰</span>
              <span className="lg:hidden">Menu</span>
              <span className="hidden lg:inline">All steps</span>
            </>
          )}
        </button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 top-14 bg-ink/30" onClick={() => setOpen(false)} aria-hidden />
          <nav
            id="contents"
            aria-label="Contents"
            className="absolute inset-x-0 top-full max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b border-rule bg-paper shadow-xl shadow-ink/10"
          >
            <div className="mx-auto w-full max-w-[76rem] px-4 py-8 sm:px-6 lg:px-10">
              <Contents journeys={journeys} links={links} current={current} onPick={() => setOpen(false)} />
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
