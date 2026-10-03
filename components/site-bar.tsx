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
};
type PageLink = { label: string; href: string };

const pad = (n: number) => String(n).padStart(2, "0");

function JourneyList({
  j,
  here,
  onPick,
}: {
  j: ContentsJourney;
  here?: number; // the step on screen, if this is the journey you're in
  onPick: () => void;
}) {
  // Without a step on screen, "done" means before the step last visited in this browser.
  const far = useSavedStep(j.n);
  const upTo = here ?? far;
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
                const done = s.n < upTo;
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
                        {now ? "you are here" : done ? "done" : ""}
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

export function SiteBar({
  where,
  journeys,
  links,
  current,
}: {
  where?: string; // e.g. "Journey 1 · Step 6 of 12"
  journeys: ContentsJourney[];
  links: PageLink[];
  current?: { journey: number; step?: number };
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
      <div className="mx-auto flex h-14 w-full max-w-[76rem] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="shrink-0 text-[19px] font-bold tracking-[-0.01em]">
          BuildAI Lab
        </Link>
        <p className="min-w-0 flex-1 truncate border-l border-rule pl-4 font-label text-[13px] text-graphite">{where}</p>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="contents"
          className="shrink-0 rounded-[3px] px-3 py-1.5 text-[14px] font-semibold hover:bg-paper-2"
        >
          {open ? "Close" : "Contents"}
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
