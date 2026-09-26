"use client";
// A long "Do it" split into numbered parts: 3.1 → 3.2 → 3.3 …
// One part on screen at a time, with its own Back/Next, so a big step
// (installing three tools) feels like small ones without renumbering the journey.
import { useState, type ReactNode } from "react";

export function Parts({ step, labels, parts }: { step: number; labels: string[]; parts: ReactNode[] }) {
  const [i, setI] = useState(0);
  const go = (k: number) => setI(Math.max(0, Math.min(parts.length - 1, k)));

  return (
    <div className="mt-4">
      <ol className="flex gap-1.5 overflow-x-auto pb-1">
        {labels.map((label, k) => (
          <li key={label} className="shrink-0">
            <button
              type="button"
              onClick={() => go(k)}
              aria-current={k === i ? "step" : undefined}
              className={`rounded-full border px-3 py-1 text-sm whitespace-nowrap transition-colors ${
                k === i
                  ? "border-zinc-900 bg-zinc-900 font-semibold text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : k < i
                    ? "border-emerald-600/40 text-emerald-700 dark:text-emerald-400"
                    : "border-zinc-300 text-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:hover:text-zinc-100"
              }`}
            >
              <span className="font-mono text-[11px] opacity-70">{k < i ? "✓" : `${step}.${k + 1}`}</span> {label}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-3">
        {parts.map((part, k) => (
          <div key={k} className={k === i ? "pane-in" : "jp-hide"}>
            {part}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(i - 1)}
          className={`text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 ${i === 0 ? "invisible" : ""}`}
        >
          ← {labels[i - 1] ?? ""}
        </button>
        {i < parts.length - 1 && (
          <button
            type="button"
            onClick={() => go(i + 1)}
            className="rounded-lg border border-zinc-900 px-3 py-1.5 text-sm font-semibold hover:bg-zinc-900 hover:text-white dark:border-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
          >
            Next: {labels[i + 1]} →
          </button>
        )}
      </div>
    </div>
  );
}
