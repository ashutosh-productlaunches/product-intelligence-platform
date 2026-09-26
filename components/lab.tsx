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

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-950 px-4 py-3 font-mono text-[13px] leading-relaxed text-zinc-100 ring-1 ring-zinc-800">
      {children}
    </pre>
  );
}

const letters = ["A", "B", "C", "D"];

export function Experiment({ x, personalised }: { x: ExperimentData; personalised: boolean }) {
  const [guess, setGuess] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const right = guess === x.predict.answer;

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5">
      {/* 1 · Predict */}
      <div className="rounded-lg border border-amber-500/50 bg-amber-50/60 p-4 dark:border-amber-400/30 dark:bg-amber-950/20">
        <p className="text-xs font-semibold tracking-wider text-amber-800 uppercase dark:text-amber-300">
          1 · Predict before you touch anything
        </p>
        <p className="mt-1.5 text-[15px] font-medium">{x.predict.q}</p>
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
                className={`flex gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  reveal
                    ? "border-emerald-600 bg-emerald-50 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-100"
                    : picked
                      ? "border-zinc-900 bg-white font-medium dark:border-zinc-100 dark:bg-zinc-900"
                      : guess === null
                        ? "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
                        : "border-zinc-200 bg-white opacity-60 dark:border-zinc-800 dark:bg-zinc-950"
                }`}
              >
                <span className="font-mono text-xs leading-5 text-zinc-400">{letters[i]}</span>
                <span>{o}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          {guess === null ? "Pick one. You can't change it, so commit." : `Locked in: ${letters[guess]}. Now run the experiment.`}
        </p>
      </div>

      {/* 2 · Break it */}
      <div className={guess === null ? "opacity-50" : ""}>
        <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">2 · Break it: {x.title.toLowerCase()}</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200">{x.change}</p>
        {x.code && <Code>{x.code}</Code>}
        {personalised && x.ifYourApp && (
          <p className="mt-2 rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            <span className="font-semibold">Your app: </span>
            {x.ifYourApp}
          </p>
        )}
      </div>

      {/* 3 · Compare */}
      <div>
        <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">3 · Compare</p>
        {!shown ? (
          <button
            type="button"
            disabled={guess === null}
            onClick={() => setShown(true)}
            className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {guess === null ? "Predict first" : "I ran it: what should I see?"}
          </button>
        ) : (
          <div className="pane-in mt-2 grid gap-3">
            <p
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                right
                  ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                  : "bg-rose-50 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
              }`}
            >
              {right ? "Your prediction was right." : `You predicted ${letters[guess!]}; the answer is ${letters[x.predict.answer]}. That gap is the lesson.`}
            </p>
            <p className="text-[15px] leading-relaxed">
              <span className="font-semibold">What you should see: </span>
              {x.observe}
            </p>
            <div className="grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-800">
              <div className="bg-zinc-50 px-4 py-3 dark:bg-zinc-900">
                <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Why</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{x.why}</p>
              </div>
              <div className="bg-zinc-900 px-4 py-3 dark:bg-zinc-950">
                <p className="text-xs font-semibold tracking-wider text-sky-300 uppercase">PM lens</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-100">{x.pmLens}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="border-t border-zinc-100 pt-3 text-sm text-zinc-600 dark:border-zinc-900 dark:text-zinc-400">
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Put it back: </span>
        {x.undo}
      </p>
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
    <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="font-semibold text-zinc-900 dark:text-zinc-100">Still stuck? Ask your AI, with context.</p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
        Copies a prompt that tells ChatGPT, Claude or Gemini which step you&apos;re on, what you&apos;ve built, what should have
        happened and how to teach you. Paste it, then add your error or a screenshot.
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={copy}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {state === "copied" ? "Copied ✓" : "Copy context for your AI"}
        </button>
        {state === "failed" && <span className="text-xs text-rose-700 dark:text-rose-400">Couldn&apos;t copy. Select the text below instead.</span>}
      </div>
      <details className="mt-2" open={state === "failed"}>
        <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">See what gets copied</summary>
        <pre className="mt-2 max-h-64 overflow-auto rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          {prompt}
        </pre>
      </details>
    </div>
  );
}
