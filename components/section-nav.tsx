"use client";
// The home page's one navigation: the whole route, always visible.
//   Desktop: a table of contents fixed in a left rail. Sections, then every
//            journey step grouped by stage: ✓ done, highlighted = on screen in the player.
//            Journey → stage → step, each level folding open and shut. The live
//            journey and the stage you're in open by themselves. Journeys not built
//            yet are listed below it, dimmed, so the route ahead is visible.
//   Phone:   a "Step 6 of 12 · Contents" button at the bottom that opens the same list.
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

// A section counts as "current" once its top has scrolled past this line.
const LINE = 120;

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
  active,
  step,
  onPick,
}: {
  sections: Section[];
  journey: JourneyInfo;
  upcoming: Upcoming[];
  stages: Stage[];
  links: PageLink[];
  active: string;
  step: number;
  onPick?: () => void;
}) {
  const [journeyOpen, setJourneyOpen] = useState(true);
  const total = stages.reduce((a, s) => a + s.steps.length, 0);
  const doneAll = Math.min(Math.max(step - 1, 0), total);
  // Which stages are open. A stage you haven't touched is open only while it holds
  // the current step, so moving into a new stage opens it. Clicking a header
  // opens or closes that stage, and that choice sticks.
  const current = stages.findIndex((st) => st.steps.some((s) => s.n === step));
  const [toggled, setToggled] = useState<Record<number, boolean>>({});
  const isOpen = (i: number) => toggled[i] ?? i === current;
  const toggle = (i: number) => setToggled((t) => ({ ...t, [i]: !(t[i] ?? i === current) }));

  const item = (on: boolean) =>
    `block rounded-md px-2 py-1 text-sm transition-colors ${
      on
        ? "bg-emerald-50 font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
    }`;
  return (
    <div className="grid gap-4">
      <ul className="grid gap-0.5">
        {sections
          .filter((s) => s.id !== "journey")
          .map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={onPick} className={item(active === s.id)}>
                {s.label}
              </a>
            </li>
          ))}
      </ul>

      <div>
        <p className="px-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase">Journeys</p>
        <button
          type="button"
          onClick={() => setJourneyOpen((o) => !o)}
          aria-expanded={journeyOpen}
          className={`mt-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
            active === "journey" ? "text-emerald-800 dark:text-emerald-300" : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          <span aria-hidden className={`text-zinc-400 transition-transform ${journeyOpen ? "rotate-90" : ""}`}>›</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
              Journey {journey.n} · {total} steps
            </span>
            <span className="block text-sm font-semibold leading-snug">{journey.title}</span>
          </span>
          <span className="shrink-0 font-mono text-[11px] text-zinc-400">
            {doneAll}/{total}
          </span>
        </button>
        {journeyOpen && (
        <ol className="mt-1 ml-3 grid gap-1 border-l border-zinc-200 pl-1 dark:border-zinc-800">
          {stages.map((st, i) => {
            const open = isOpen(i);
            const first = st.steps[0].n;
            const last = st.steps[st.steps.length - 1].n;
            const done = st.steps.filter((s) => s.n < step).length;
            const here = st.steps.some((s) => s.n === step);
            return (
            <li key={st.title}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={open}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
                  here ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <span aria-hidden className={`text-zinc-400 transition-transform ${open ? "rotate-90" : ""}`}>›</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold leading-snug">
                    {i + 1} · {st.title}
                  </span>
                  <span className="block text-[11px] text-zinc-500">
                    {first === last ? `Step ${first}` : `Steps ${first}–${last}`}
                  </span>
                </span>
                <span
                  className={`shrink-0 font-mono text-[11px] ${
                    done === st.steps.length ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"
                  }`}
                >
                  {done === st.steps.length ? "✓" : `${done}/${st.steps.length}`}
                </span>
              </button>
              {open && (
              <ol className="mt-0.5 mb-1 ml-3 grid border-l border-zinc-200 pl-1 dark:border-zinc-800">
                {st.steps.map((s) => {
                  const done = s.n < step;
                  const now = s.n === step;
                  return (
                    <li key={s.n}>
                      <a
                        href={`#step-${s.n}`}
                        onClick={onPick}
                        aria-current={now ? "step" : undefined}
                        className={`flex items-baseline gap-2 rounded-md px-2 py-1 text-[13px] leading-snug transition-colors ${
                          now
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                            : done
                              ? "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                              : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`w-4 shrink-0 text-right font-mono text-[11px] ${
                            done ? "text-emerald-600 dark:text-emerald-400" : now ? "" : "text-zinc-400"
                          }`}
                        >
                          {done ? "✓" : s.n}
                        </span>
                        {s.title}
                      </a>
                    </li>
                  );
                })}
              </ol>
              )}
            </li>
            );
          })}
        </ol>
        )}
        {upcoming.length > 0 && (
          <a
            href="/roadmap"
            className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
          >
            <span aria-hidden className="w-2" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold tracking-wider uppercase">
                Journey {upcoming[0].n} · {upcoming[0].status}
              </span>
              <span className="block text-sm leading-snug">{upcoming[0].title}</span>
              {upcoming.length > 1 && (
                <span className="mt-0.5 block text-[11px]">
                  Journeys {upcoming[1].n}–{upcoming[upcoming.length - 1].n} on the roadmap →
                </span>
              )}
            </span>
          </a>
        )}
      </div>

      <ul className="grid gap-0.5 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className={item(false)}>
              {l.label} <span aria-hidden className="text-zinc-400">→</span>
            </a>
          </li>
        ))}
      </ul>
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
  const inJourney = active === "journey" && step > 0 && step <= total;

  return (
    <>
      {/* Desktop: the rail */}
      <aside className="hidden border-r border-zinc-200 bg-zinc-50 lg:block dark:border-zinc-800 dark:bg-zinc-900/40">
        <nav
          aria-label="Contents"
          className="sticky top-0 max-h-screen overflow-y-auto px-4 py-8 [scrollbar-width:thin]"
        >
          <a href="#overview" className="block px-2 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
            {brand}
          </a>
          <div className="mt-6">
            <Contents sections={sections} journey={journey} upcoming={upcoming} stages={stages} links={links} active={active} step={step} />
          </div>
        </nav>
      </aside>

      {/* Phone: one button at the bottom, opening the same list */}
      <div className="lg:hidden">
        {open && (
          <div className="fixed inset-0 z-40 bg-zinc-900/30" onClick={() => setOpen(false)} aria-hidden />
        )}
        <div className="fixed inset-x-3 bottom-3 z-50">
          {open && (
            <nav
              aria-label="Contents"
              className="mb-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
            >
              <Contents
                sections={sections}
                journey={journey}
                upcoming={upcoming}
                stages={stages}
                links={links}
                active={active}
                step={step}
                onPick={() => setOpen(false)}
              />
            </nav>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="mx-auto flex items-center gap-3 rounded-full bg-zinc-900 px-4 py-2.5 text-sm text-white shadow-xl dark:bg-zinc-100 dark:text-zinc-900"
          >
            {inJourney ? (
              <span>
                <span className="font-semibold">Step {step} of {total}</span>
                <span className="opacity-70"> · {total - step} left</span>
              </span>
            ) : (
              <span className="font-semibold">{brand}</span>
            )}
            <span className="border-l border-white/20 pl-3 opacity-80 dark:border-zinc-900/20">{open ? "Close" : "Contents"}</span>
          </button>
        </div>
      </div>
    </>
  );
}
