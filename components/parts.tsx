"use client";
// A long "Do it" split into numbered parts: 3.1 → 3.2 → 3.3 …
// One part on screen at a time, so a big step (installing three tools) feels like
// small ones without renumbering the journey. Moving between parts is a quiet text
// link; the step's own Continue stays the one filled button on screen.
import { useState, type ReactNode } from "react";

export function Parts({ step, labels, parts }: { step: number; labels: string[]; parts: ReactNode[] }) {
  const [i, setI] = useState(0);
  const go = (k: number) => setI(Math.max(0, Math.min(parts.length - 1, k)));

  return (
    <div className="mt-6">
      <ol className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[13px]">
        {labels.map((label, k) => (
          <li key={label} className="shrink-0">
            <button
              type="button"
              onClick={() => go(k)}
              aria-current={k === i ? "step" : undefined}
              className={`whitespace-nowrap ${k === i ? "text-ink underline decoration-signal decoration-2 underline-offset-[6px]" : k < i ? "text-ink hover:underline" : "text-graphite hover:text-ink"}`}
            >
              <span className={`text-[11px] ${k === i ? "text-signal" : ""}`}>
                {step}.{k + 1}
              </span>{" "}
              {label}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-5">
        {parts.map((part, k) => (
          <div key={k} className={k === i ? "pane-in" : "jp-hide"}>
            {part}
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 font-mono text-[13px]">
        <button type="button" onClick={() => go(i - 1)} className={`text-graphite hover:text-ink ${i === 0 ? "invisible" : ""}`}>
          ← {step}.{i} {labels[i - 1] ?? ""}
        </button>
        {i < parts.length - 1 && (
          <button type="button" onClick={() => go(i + 1)} className="border-b border-ink hover:border-signal hover:text-signal">
            Next part: {step}.{i + 2} {labels[i + 1]} →
          </button>
        )}
      </div>
    </div>
  );
}
