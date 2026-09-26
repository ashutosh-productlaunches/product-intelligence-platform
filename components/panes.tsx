"use client";
// A step split into short panes you click through: Why → Do it → See it work → …
// One pane on screen at a time, so there's never a wall of text.
// "Continue" moves to the next pane; after the last one, `after` is shown
// (usually a link to the next step). Without JavaScript every pane shows, stacked.
import { useState, type ReactNode } from "react";

export function Panes({ labels, panes, after }: { labels: string[]; panes: ReactNode[]; after?: ReactNode }) {
  const [i, setI] = useState(0);
  const last = i === panes.length - 1;

  return (
    <div>
      <div role="tablist" className="flex gap-1 overflow-x-auto rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
        {labels.map((label, k) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={k === i}
            onClick={() => setI(k)}
            className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
              k === i
                ? "bg-white font-semibold text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : k < i
                  ? "text-emerald-700 hover:text-emerald-900 dark:text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <span aria-hidden className="font-mono text-[11px] opacity-60">
              {k < i ? "✓" : k + 1}
            </span>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {panes.map((pane, k) => (
          <div key={k} role="tabpanel" className={k === i ? "pane-in" : "jp-hide"}>
            {pane}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-900">
        <button
          type="button"
          onClick={() => setI(i - 1)}
          className={`text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 ${i === 0 ? "invisible" : ""}`}
        >
          ← {labels[i - 1] ?? ""}
        </button>
        {last ? (
          after
        ) : (
          <button
            type="button"
            onClick={() => setI(i + 1)}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Continue: {labels[i + 1]} →
          </button>
        )}
      </div>
    </div>
  );
}
