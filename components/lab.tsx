"use client";
// The lab parts of a step.
//
// <Experiment>: predict → change one thing → run it → compare. The answer stays
// hidden until the learner has locked in a guess, because a prediction you got
// wrong is what you remember.
//
// <CopyHelp>: copies a prompt that tells any AI assistant where the learner is
// in the journey and how to teach them (built by lib/tutor-context.ts).
import { useState } from "react";
import type { Experiment as ExperimentData } from "@/content/experiments-01";
import { bench, benchLabel, button } from "@/components/style";

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto bg-ink px-4 py-3 font-mono text-[13px] leading-relaxed text-paper">{children}</pre>
  );
}

const letters = ["A", "B", "C", "D"];

// The bench: predict → break → observe, as one flat instrument panel (B).
export function Experiment({ x, personalised }: { x: ExperimentData; personalised: boolean }) {
  const [guess, setGuess] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const right = guess === x.predict.answer;
  const row = "grid gap-3 border-t border-ink/30 px-4 py-5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6 sm:px-6";

  return (
    <div className={`${bench} min-w-0`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 sm:px-6">
        <p className={benchLabel}>Bench · Break it</p>
        <p className="font-mono text-[13px]">{x.title}</p>
      </div>

      {/* 01 · Predict */}
      <div className={row}>
        <p className={benchLabel}>01 Predict</p>
        <div className="min-w-0">
          <p className="text-[18px] leading-snug font-medium">{x.predict.q}</p>
          <div className="mt-3 grid gap-1.5" role="radiogroup" aria-label="Your prediction">
            {x.predict.options.map((o, i) => {
              const picked = guess === i;
              const reveal = shown && i === x.predict.answer;
              return (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={picked}
                  disabled={guess !== null}
                  onClick={() => setGuess(i)}
                  className={`flex gap-3 border px-3 py-2 text-left text-[16px] leading-snug ${
                    reveal
                      ? "border-pass bg-paper ring-1 ring-pass"
                      : picked
                        ? "border-ink bg-paper ring-1 ring-ink"
                        : guess === null
                          ? "border-ink/30 bg-paper hover:border-ink"
                          : "border-ink/20 bg-paper text-graphite"
                  }`}
                >
                  <span className="font-mono text-xs leading-6 text-graphite">{letters[i]}</span>
                  <span className="flex-1">{o}</span>
                  {reveal && <span className="font-mono text-[11px] leading-6 text-pass">expected</span>}
                </button>
              );
            })}
          </div>
          <p className="mt-2 font-mono text-xs text-graphite">
            {guess === null ? "Pick one. You can't change it, so commit." : `Locked in: ${letters[guess]}. Now run the experiment.`}
          </p>
        </div>
      </div>

      {/* 02 · Break it */}
      <div className={`${row} ${guess === null ? "opacity-50" : ""}`}>
        <p className={benchLabel}>02 Break</p>
        <div className="min-w-0">
          <p className="text-[17px] leading-relaxed">{x.change}</p>
          {x.code && <Code>{x.code}</Code>}
          {personalised && x.ifYourApp && (
            <p className="mt-3 border-l-2 border-signal pl-3 text-[16px]">
              <span className="font-mono text-xs text-signal">Your app </span>
              {x.ifYourApp}
            </p>
          )}
        </div>
      </div>

      {/* 03 · Observe */}
      <div className={row}>
        <p className={benchLabel}>03 Observe</p>
        <div className="min-w-0">
          {!shown ? (
            <button type="button" disabled={guess === null} onClick={() => setShown(true)} className={button}>
              {guess === null ? "Predict first" : "I ran it: what should I see?"}
            </button>
          ) : (
            <div className="pane-in grid gap-4">
              <p className={`font-mono text-[13px] font-medium ${right ? "text-pass" : "text-fail"}`}>
                {right
                  ? "Prediction matched."
                  : `Predicted ${letters[guess!]}, observed ${letters[x.predict.answer]}. That gap is the lesson.`}
              </p>
              <p className="text-[17px] leading-relaxed">
                <span className="font-medium">What you should see: </span>
                {x.observe}
              </p>
              <p className="text-[17px] leading-relaxed text-graphite">
                <span className="font-medium text-ink">Why: </span>
                {x.why}
              </p>
              <div className="border-l-2 border-signal pl-4">
                <p className="font-mono text-xs text-signal">PM lens</p>
                <p className="mt-1 text-[19px] leading-snug">{x.pmLens}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={row}>
        <p className={benchLabel}>Reset</p>
        <p className="text-[16px] leading-relaxed text-graphite">{x.undo}</p>
      </div>
    </div>
  );
}

export function CopyHelp({ prompt }: { prompt: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="mt-5 border-t border-rule pt-4">
      <p className="font-medium">Still stuck? Ask your AI, with context.</p>
      <p className="mt-1 text-[15px] leading-relaxed text-graphite">
        Copies a prompt that tells ChatGPT, Claude or Gemini which step you&apos;re on, what you&apos;ve built, what should have
        happened and how to teach you. Paste it, then add your error or a screenshot.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={copy}
          className="border border-ink px-3 py-1.5 font-mono text-[13px] hover:bg-ink hover:text-paper"
        >
          {state === "copied" ? "Copied" : "Copy context for your AI"}
        </button>
        {state === "failed" && <span className="font-mono text-xs text-fail">Couldn&apos;t copy. Select the text below instead.</span>}
        <details className="basis-full" open={state === "failed"}>
          <summary className="cursor-pointer font-mono text-xs text-graphite hover:text-ink">See what gets copied</summary>
          <pre className="mt-2 max-h-64 overflow-auto border border-rule bg-paper-2 px-3 py-2 font-mono text-[12px] leading-relaxed whitespace-pre-wrap">
            {prompt}
          </pre>
        </details>
      </div>
    </div>
  );
}
