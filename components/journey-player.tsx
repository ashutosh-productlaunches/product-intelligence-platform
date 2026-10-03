"use client";
// The journey as a player: one step on screen at a time, with a channel strip on top
// (01–12, grouped by part). The strip shows position and lets you jump; moving on
// happens inside the step, so there is one advance control (docs/design-direction.md).
//
// The current step lives in the address: #step-6, or #done for the finish.
// Links anywhere on the page (the contents, "step 7" references) just change
// the address, and the player follows. Without JavaScript every step shows,
// stacked, via the <noscript> style in app/page.tsx.
//
// The last step visited is remembered in this browser, so a learner who comes
// back later (the journey rarely fits one sitting) is offered their place.
// Storage can be missing or blocked; then the offer simply doesn't appear.
import { useEffect, useState, type ReactNode } from "react";

type Meta = { n: number; title: string; stage: string };
type Stage = { title: string; from: number; to: number };

// Which step the address points at: 1..total, total + 1 for the finish, or 0 for none.
export function stepFromHash(hash: string, total: number): number {
  if (hash === "#done") return total + 1;
  const m = hash.match(/^#step-(\d+)$/);
  return m ? Math.min(Math.max(Number(m[1]), 1), total) : 0;
}

const SAVED = "buildailab:step";

export function JourneyPlayer({
  meta,
  stages,
  cards,
  finish,
}: {
  meta: Meta[];
  stages: Stage[];
  cards: ReactNode[];
  finish: ReactNode;
}) {
  const total = meta.length;
  const [cur, setCur] = useState(1);
  const [resume, setResume] = useState(0);

  useEffect(() => {
    const follow = (scroll: boolean) => {
      const n = stepFromHash(window.location.hash, total);
      if (!n) {
        // No step in the address: offer the one saved last time, if any.
        try {
          const saved = Number(localStorage.getItem(SAVED));
          if (saved > 1 && saved <= total + 1) setResume(saved);
        } catch {}
        return;
      }
      setCur(n);
      setResume(0);
      try {
        localStorage.setItem(SAVED, String(n));
      } catch {}
      if (scroll) document.getElementById("player")?.scrollIntoView({ block: "start" });
    };
    follow(true);
    const onHash = () => follow(true);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [total]);

  const hrefFor = (n: number) => (n > total ? "#done" : `#step-${n}`);
  const finished = cur > total;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div id="player" className="scroll-mt-20">
      {resume > 0 && (
        <p className="mb-6 rounded-[3px] bg-signal-soft px-4 py-3 text-[17px]">
          <span className="font-medium">Welcome back.</span>{" "}
          {resume > total ? "You finished the journey. " : `You were on §${pad(resume)}, ${meta[resume - 1]?.title}. `}
          <a href={hrefFor(resume)} className="prose-link">
            {resume > total ? "See what you built" : "Pick up where you left off"}
          </a>
        </p>
      )}

      {/* The channel strip: where you are, and a way to jump. Advancing happens inside the step. */}
      <ol className="flex gap-3 sm:gap-4" aria-label="Steps">
        {stages.map((st) => (
          <li key={st.title} className="min-w-0" style={{ flex: st.to - st.from + 1 }}>
            <ol className="flex gap-1">
              {meta.slice(st.from - 1, st.to).map((m) => {
                const now = m.n === cur;
                const done = m.n < cur || finished;
                return (
                  <li key={m.n} className="min-w-0 flex-1">
                    <a
                      href={hrefFor(m.n)}
                      title={`§${pad(m.n)} · ${m.title}`}
                      aria-label={`Step ${m.n}: ${m.title}`}
                      aria-current={now ? "step" : undefined}
                      className={`block border-t-[3px] pt-1 font-label text-[12px] tabular-nums ${
                        now
                          ? "border-signal font-bold text-signal"
                          : done
                            ? "border-signal/45 text-ink"
                            : "border-rule text-graphite hover:border-graphite"
                      }`}
                    >
                      {pad(m.n)}
                    </a>
                  </li>
                );
              })}
            </ol>
            <p className="mt-1 hidden truncate font-label text-[11px] text-graphite md:block">{st.title}</p>
          </li>
        ))}
      </ol>

      {/* One step at a time */}
      <div className="mt-10">
        {cards.map((card, i) => (
          <div key={i} className={i + 1 === cur ? "" : "jp-hide"}>
            {card}
          </div>
        ))}
        <div className={finished ? "" : "jp-hide"}>{finish}</div>
      </div>
    </div>
  );
}
