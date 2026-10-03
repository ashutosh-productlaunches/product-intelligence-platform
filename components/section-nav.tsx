"use client";
// The home page's one navigation: a thin bar fixed at the top, and the table of
// contents behind it (docs/design-direction.md).
//   The bar:      BuildAI Lab │ where you are (§06/12 · step title) │ Contents
//   Contents:     the journey as a book's contents — parts, § numbers, dot leaders,
//                 done and current marks — plus the journeys still to come and the
//                 other pages. Same sheet on desktop and phone.
//
// Every entry is a plain link. Step links change the address (#step-6), and the
// journey player shows that step.
import { useEffect, useState } from "react";
import { stepFromHash } from "@/components/journey-player";

type Section = { id: string; label: string };
type Stage = { title: string; steps: { n: number; title: string }[] };
type PageLink = { label: string; href: string };
type JourneyInfo = { n: number; title: string };
type Upcoming = { n: number; title: string; status: string };

// A section counts as "current" once its top has scrolled past this line (just under the bar).
const LINE = 120;
const pad = (n: number) => String(n).padStart(2, "0");

function useScrollSpy(sections: Section[], total: number) {
  const [active, setActive] = useState(sections[0].id);
  const [step, setStep] = useState(1);

  // Which section you're reading: from the scroll position.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= LINE) current = s.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [sections]);

  // Which step the journey player is showing: from the address (#step-6, #done).
  useEffect(() => {
    const follow = () => {
      const n = stepFromHash(window.location.hash, total);
      if (n) setStep(n);
    };
    follow();
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, [total]);

  return { active, step };
}

function Contents({
  sections,
  journey,
  upcoming,
  stages,
  links,
  step,
  onPick,
}: {
  sections: Section[];
  journey: JourneyInfo;
  upcoming: Upcoming[];
  stages: Stage[];
  links: PageLink[];
  step: number;
  onPick: () => void;
}) {
  const total = stages.reduce((a, s) => a + s.steps.length, 0);
  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] md:gap-16">
      <div>
        <p className="font-mono text-xs text-graphite">
          Journey {journey.n} · {total} steps
        </p>
        <p className="mt-1 text-2xl leading-tight font-medium">{journey.title}</p>
        <ol className="mt-6 grid gap-6">
          {stages.map((st, i) => (
            <li key={st.title}>
              <p className="font-mono text-xs text-graphite">Part {i + 1}</p>
              <p className="text-lg leading-snug font-medium italic">{st.title}</p>
              <ol className="mt-1.5 grid">
                {st.steps.map((s) => {
                  const done = s.n < step;
                  const now = s.n === step;
                  return (
                    <li key={s.n}>
                      <a
                        href={`#step-${s.n}`}
                        onClick={onPick}
                        aria-current={now ? "step" : undefined}
                        className={`group flex items-baseline gap-3 py-1 text-[17px] leading-snug ${now ? "text-signal" : ""}`}
                      >
                        <span className="w-8 shrink-0 font-mono text-xs text-graphite">§{pad(s.n)}</span>
                        <span className="group-hover:underline group-hover:underline-offset-4">{s.title}</span>
                        <span aria-hidden className="leader" />
                        <span className={`shrink-0 font-mono text-xs ${now ? "text-signal" : "text-graphite"}`}>
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

      <div className="grid content-start gap-8 border-t border-rule pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
        <div>
          <p className="font-mono text-xs text-graphite">On this page</p>
          <ul className="mt-2 grid gap-1 text-[17px]">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={onPick} className="prose-link">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs text-graphite">Elsewhere</p>
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
        {upcoming.length > 0 && (
          <div>
            <p className="font-mono text-xs text-graphite">Still to come</p>
            <ul className="mt-2 grid gap-2">
              {upcoming.map((u) => (
                <li key={u.n} className="text-graphite">
                  <span className="block font-mono text-xs">
                    Journey {u.n} · {u.status}
                  </span>
                  <span className="block leading-snug">{u.title}</span>
                </li>
              ))}
            </ul>
            <a href="/roadmap" className="prose-link mt-2 inline-block text-[15px]">
              The full roadmap
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionNav({
  brand,
  sections,
  journey,
  upcoming,
  stages,
  links,
}: {
  brand: string;
  sections: Section[];
  journey: JourneyInfo;
  upcoming: Upcoming[];
  stages: Stage[];
  links: PageLink[];
}) {
  const total = stages.reduce((a, s) => a + s.steps.length, 0);
  const { active, step } = useScrollSpy(sections, total);
  const [open, setOpen] = useState(false);
  const inJourney = active === "journey" && step > 0;
  const title = stages.flatMap((s) => s.steps).find((s) => s.n === step)?.title;
  const where = inJourney
    ? step > total
      ? `Journey ${journey.n} · complete`
      : `Journey ${journey.n} · §${pad(step)}/${total}`
    : sections.find((s) => s.id === active)?.label;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper">
      <div className="mx-auto flex h-12 w-full max-w-[76rem] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <a href="#overview" className="shrink-0 text-lg font-semibold tracking-tight">
          {brand}
        </a>
        <p className="min-w-0 flex-1 truncate border-l border-rule pl-4 font-mono text-xs text-graphite">
          {where}
          {inJourney && step <= total && title && <span className="hidden text-ink sm:inline"> · {title}</span>}
        </p>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="contents"
          className="shrink-0 border-l border-rule pl-4 font-mono text-xs font-medium hover:text-signal"
        >
          {open ? "Close" : "Contents"}
        </button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 top-12 bg-ink/20" onClick={() => setOpen(false)} aria-hidden />
          <nav
            id="contents"
            aria-label="Contents"
            className="absolute inset-x-0 top-full max-h-[calc(100vh-3rem)] overflow-y-auto border-b border-ink bg-paper"
          >
            <div className="mx-auto w-full max-w-[76rem] px-4 py-8 sm:px-6 lg:px-10">
              <Contents
                sections={sections}
                journey={journey}
                upcoming={upcoming}
                stages={stages}
                links={links}
                step={step}
                onPick={() => setOpen(false)}
              />
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
