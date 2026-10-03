"use client";
// A step split into short panes you click through: Why → Do it → See it work → …
// One pane on screen at a time, so there's never a wall of text.
// "Continue" moves to the next pane; after the last one, `after` is shown
// (usually a link to the next step), so there is only ever one way forward.
// Without JavaScript every pane shows, stacked.
import { useState, type ReactNode } from "react";
import { button } from "@/components/style";

export function Panes({
  labels,
  panes,
  after,
  section,
}: {
  labels: string[];
  panes: ReactNode[];
  after?: ReactNode;
  // The step number, so panes read §6.1, §6.2 … Leave out for panes outside a step.
  section?: number;
}) {
  const [i, setI] = useState(0);
  const last = i === panes.length - 1;
  const num = (k: number) => (section ? `§${section}.${k + 1}` : String(k + 1).padStart(2, "0"));

  return (
    <div>
      <div role="tablist" className="flex gap-x-6 overflow-x-auto border-b-2 border-rule [scrollbar-width:none]">
        {labels.map((label, k) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={k === i}
            onClick={() => setI(k)}
            className={`-mb-0.5 flex shrink-0 items-baseline gap-1.5 border-b-2 pt-1 pb-2.5 text-[15px] font-medium whitespace-nowrap ${
              k === i ? "border-signal text-signal" : k < i ? "border-transparent text-ink hover:border-rule" : "border-transparent text-graphite hover:text-ink"
            }`}
          >
            <span className="text-[12px] opacity-70">{num(k)}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {panes.map((pane, k) => (
          <div key={k} role="tabpanel" className={k === i ? "pane-in" : "jp-hide"}>
            {pane}
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-5">
        <button
          type="button"
          onClick={() => setI(i - 1)}
          className={`text-[15px] font-medium text-graphite hover:text-ink ${i === 0 ? "invisible" : ""}`}
        >
          ← {labels[i - 1] ?? ""}
        </button>
        {last ? (
          after
        ) : (
          <button
            type="button"
            onClick={() => setI(i + 1)}
            className={button}
          >
            Continue: {labels[i + 1]}
          </button>
        )}
      </div>
    </div>
  );
}
