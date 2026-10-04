"use client";
// The left sidebar on journey pages: always on screen on wide screens, so a learner can
// see the whole route and move anywhere in one click.
//   Journey title and progress
//   Parts → steps (done ✓, current highlighted). The current step opens to show the
//   sections of this page; the one you're reading is highlighted as you scroll.
//   Next, pinned at the bottom.
// On phones it's hidden; the top bar's Menu holds the same list.
import { useEffect, useState } from "react";
import { useSavedStep } from "@/components/progress";
import { button } from "@/components/style";

type Part = { title: string; steps: { n: number; title: string; href: string }[] };

const pad = (n: number) => String(n).padStart(2, "0");

// Which section of the page you're reading: the last one whose top has passed a line a
// third of the way down. At the very bottom, the last section counts even if it's short.
function useCurrentSection(ids: string[]) {
  const [current, setCurrent] = useState(ids[0]);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight / 3;
      let now = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) now = id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) now = ids[ids.length - 1];
      setCurrent(now);
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
  }, [ids]);
  return current;
}

export function JourneySidebar({
  journey,
  parts,
  current,
  sections,
  finish,
  next,
}: {
  journey: { n: number; title: string; href: string };
  parts: Part[];
  current: number; // the step on screen; total + 1 for the finish page
  sections: { id: string; label: string }[]; // sections of this page
  finish: { href: string; label: string };
  next: { href: string; label: string };
}) {
  const total = parts.reduce((a, p) => a + p.steps.length, 0);
  const ids = sections.map((s) => s.id);
  const reading = useCurrentSection(ids);
  // The progress bar fills up to the furthest of: the step on screen, the step last visited here.
  const saved = useSavedStep(journey.n);
  const upTo = Math.max(current, saved);
  const onFinish = current > total;

  const sectionList = (
    <ol className="mt-1 mb-2 ml-[1.15rem] grid border-l border-rule">
      {sections.map((s) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            aria-current={s.id === reading ? "location" : undefined}
            className={`-ml-px block border-l-2 py-1 pl-3 text-[14px] ${
              s.id === reading ? "border-signal font-semibold text-signal" : "border-transparent text-graphite hover:text-ink"
            }`}
          >
            {s.label}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <nav aria-label={`Journey ${journey.n}`} className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-4 [scrollbar-width:thin]">
        <a href={journey.href} className="block hover:text-signal">
          <span className="block font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">Journey {journey.n}</span>
          <span className="mt-0.5 block text-[16px] leading-snug font-semibold">{journey.title}</span>
        </a>
        <div className="mt-3" aria-hidden>
          <div className="flex gap-0.5">
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={`h-1.5 flex-1 rounded-[1px] ${i + 1 < upTo || onFinish ? "bg-signal/45" : i + 1 === current ? "bg-signal" : "bg-rule"}`} />
            ))}
          </div>
          <p className="mt-1.5 font-label text-[12px] text-graphite">{onFinish ? "Journey complete" : `Step ${current} of ${total}`}</p>
        </div>

        <ol className="mt-5 grid gap-4">
          {parts.map((part, i) => (
            <li key={part.title}>
              <p className="font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">
                {i + 1} · {part.title}
              </p>
              <ol className="mt-1 grid">
                {part.steps.map((s) => {
                  const now = s.n === current;
                  return (
                    <li key={s.n}>
                      <a
                        href={now ? "#top" : s.href}
                        aria-current={now ? "page" : undefined}
                        className={`flex items-baseline gap-2 rounded-[3px] px-2 py-1 text-[14px] leading-snug ${
                          now ? "bg-signal-soft font-semibold text-[#0b4fb0]" : "text-ink hover:bg-white"
                        }`}
                      >
                        <span className={`w-5 shrink-0 font-label text-[12px] tabular-nums ${now ? "" : "text-graphite"}`}>{pad(s.n)}</span>
                        {s.title}
                      </a>
                      {now && sectionList}
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
          <li>
            <a
              href={onFinish ? "#top" : finish.href}
              aria-current={onFinish ? "page" : undefined}
              className={`flex items-baseline gap-2 rounded-[3px] px-2 py-1 text-[14px] ${
                onFinish ? "bg-signal-soft font-semibold text-[#0b4fb0]" : "text-ink hover:bg-white"
              }`}
            >
              <span className="w-5 shrink-0 font-label text-[12px] text-graphite">★</span>
              {finish.label}
            </a>
            {onFinish && sectionList}
          </li>
        </ol>
      </div>

      <div className="border-t border-rule bg-paper-2 px-5 py-4">
        <a href={next.href} className={`${button} block w-full text-center`}>
          {next.label}
        </a>
      </div>
    </nav>
  );
}
