"use client";
// The journey as a player: one step on screen at a time, with a stepper on top.
//
// The current step lives in the address: #step-6, or #done for the finish.
// Links anywhere on the page (the side rail, "step 7" references) just change
// the address, and the player follows. Without JavaScript every step shows,
// stacked, via the <noscript> style in app/page.tsx.
import { useEffect, useState, type ReactNode } from "react";

type Meta = { n: number; title: string; stage: string };
type Stage = { title: string; from: number; to: number };

// Which step the address points at: 1..total, total + 1 for the finish, or 0 for none.
export function stepFromHash(hash: string, total: number): number {
  if (hash === "#done") return total + 1;
  const m = hash.match(/^#step-(\d+)$/);
  return m ? Math.min(Math.max(Number(m[1]), 1), total) : 0;
}

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

  useEffect(() => {
    const follow = (scroll: boolean) => {
      const n = stepFromHash(window.location.hash, total);
      if (!n) return;
      setCur(n);
      if (scroll) document.getElementById("player")?.scrollIntoView({ block: "start" });
    };
    follow(true);
    const onHash = () => follow(true);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [total]);

  const hrefFor = (n: number) => (n > total ? "#done" : `#step-${n}`);
  const finished = cur > total;
  const here = meta[cur - 1];

  return (
    <div id="player" className="scroll-mt-6">
      {/* The stepper */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            {finished ? (
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">Journey complete</span>
            ) : (
              <>
                <span className="font-semibold">
                  Step {cur} of {total}
                </span>
                <span className="text-zinc-500"> · {here?.stage}</span>
              </>
            )}
          </p>
          <div className="flex gap-2 text-sm">
            <a
              href={hrefFor(Math.max(cur - 1, 1))}
              aria-disabled={cur === 1}
              className={`rounded-md border border-zinc-200 px-3 py-1.5 dark:border-zinc-800 ${
                cur === 1 ? "pointer-events-none opacity-40" : "hover:border-zinc-400"
              }`}
            >
              ← Back
            </a>
            {!finished && (
              <a
                href={hrefFor(cur + 1)}
                className="rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {cur === total ? "Finish →" : "Next →"}
              </a>
            )}
          </div>
        </div>

        <ol className="mt-4 flex gap-2" aria-label="Steps">
          {stages.map((st) => (
            <li key={st.title} className="min-w-0" style={{ flex: st.to - st.from + 1 }}>
              <ol className="flex gap-1">
                {meta.slice(st.from - 1, st.to).map((m) => (
                  <li key={m.n} className="flex-1">
                    <a
                      href={hrefFor(m.n)}
                      title={`${m.n} · ${m.title}`}
                      aria-label={`Step ${m.n}: ${m.title}`}
                      aria-current={m.n === cur ? "step" : undefined}
                      className={`block h-2 rounded-full transition-colors ${
                        m.n < cur || finished
                          ? "bg-emerald-600 dark:bg-emerald-400"
                          : m.n === cur
                            ? "bg-zinc-900 dark:bg-zinc-100"
                            : "bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800"
                      }`}
                    />
                  </li>
                ))}
              </ol>
              <p className="mt-1.5 hidden truncate text-[11px] text-zinc-400 sm:block">{st.title}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* One step at a time */}
      <div className="mt-4">
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
