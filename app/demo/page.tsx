// /demo — the working app, on its own screen.
// Pick a tool, paste text, press Run. The tool itself needs no JavaScript in the
// browser: the form reloads the page, the server makes one model call, checks the
// reply against a fixed shape, and renders it.
//
// This screen commits to one dark look on purpose. It is the product face of
// the lab; the journey page it links back to stays light. The animation behind
// the tool is the only JavaScript that runs in the browser (components/transmutation-stage.tsx).
import type { Metadata } from "next";
import { getPattern, patterns } from "@/content/app-patterns";
import { buildMvp, parseIntake, type Intake } from "@/lib/build-mvp";
import { runDemo, MAX_TEXT, type DemoResult } from "@/lib/run-demo";
import { ResultPlaceholder, ResultView } from "@/components/app-preview";
import { ToolIcon } from "@/components/tool-icons";
import { TransmutationStage } from "@/components/transmutation-stage";
import { getLook } from "@/content/looks";

export const metadata: Metadata = {
  title: "Live demo · AI Tool Lab",
  description: "Five small AI tools you can use right now. Paste text, press Run.",
};

type SearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// Everything on this screen takes its colours from the "transmutation" look in
// content/looks.ts — the same values a learner can paste into their own app in step 12.
const look = getLook("transmutation");
const TOKENS = {
  "--bg": look.tokens.bg,
  "--surface": look.tokens.surface,
  "--text": look.tokens.text,
  "--muted": look.tokens.muted,
  "--accent": look.tokens.accent,
  "--accent-2": look.tokens.accent2,
  "--border": look.tokens.border,
  "--radius": look.tokens.radius,
  backgroundImage: look.backdrop,
} as React.CSSProperties;

const DISPLAY = "font-[family-name:var(--font-tm-display)]";
const MONO = "font-[family-name:var(--font-tm-mono)]";
const LABEL = `${MONO} text-[11px] font-medium uppercase tracking-[0.12em] text-(--accent)`;
const PANE =
  "relative z-10 flex flex-col gap-4 rounded-(--radius) border border-(--border) bg-(--surface)/80 p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-6";
const PILL = `${MONO} rounded-md bg-white/[.05] px-2 py-1 text-[11px] text-(--muted)`;

function Status({ result }: { result: DemoResult | null }) {
  const shell = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium";
  const dot = "h-1.5 w-1.5 rounded-full";
  if (!result) return <span className={`${shell} border-(--border) text-(--muted)`}><span className={`${dot} bg-(--muted)`} />Ready</span>;
  if (result.ok && result.repaired)
    return <span className={`${shell} border-amber-400/30 bg-amber-400/10 text-amber-300`}><span className={`${dot} bg-amber-400`} />Fixed on retry</span>;
  if (result.ok)
    return <span className={`${shell} border-emerald-300/30 bg-emerald-300/10 text-emerald-300`}><span className={`${dot} bg-emerald-300 shadow-[0_0_8px] shadow-emerald-300`} />Checked</span>;
  return <span className={`${shell} border-red-400/30 bg-red-400/10 text-red-300`}><span className={`${dot} bg-red-400`} />Stopped</span>;
}

// The picture behind the tool uses words from the text in the box: real input, not a script.
function wordsFrom(text: string) {
  return Array.from(new Set(text.split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}#'-]/gu, "")).filter((w) => w.length > 2))).slice(0, 40);
}

const STORY = [
  { n: "01", title: "You describe", text: "Pick a tool and answer three questions. Plain code turns your answers into a prompt. No model yet." },
  { n: "02", title: "The model reads", text: "The server sends the prompt to Gemini. Your browser never sees the prompt or the key." },
  { n: "03", title: "Code checks", text: "The reply must match a fixed shape, a schema. Wrong shape: one retry, then it stops instead of guessing." },
];

export default async function DemoPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const pattern = getPattern(one(params.pattern)) ?? patterns[0];
  const parsed = one(params.input) ? parseIntake(params) : null;
  const intake: Intake = parsed?.ok ? parsed.intake : { pattern: pattern.id, ...pattern.example };
  const mvp = buildMvp(intake);

  const text = one(params.text) ?? "";
  const question = one(params.question) ?? "";
  const result: DemoResult | null = text ? await runDemo(intake, text, question) : null;

  // Keep the learner's own wording when they switch tools or load a sample.
  const link = (over: Record<string, string> = {}) => {
    const q = new URLSearchParams({ pattern: pattern.id, ...over });
    if (parsed?.ok) {
      q.set("input", intake.input);
      q.set("audience", intake.audience);
      q.set("detail", intake.detail);
    }
    return `/demo?${q.toString()}`;
  };

  const boxText = text || pattern.samples[0].text;

  return (
    <div className="flex-1 bg-(--bg) font-[family-name:var(--font-tm-body)] text-(--text) antialiased" style={TOKENS}>
      <header className="sticky top-0 z-30 border-b border-(--border) bg-(--bg)/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <a href="/demo" className="flex items-center gap-3" aria-label="Tool Lab demo">
            <svg viewBox="0 0 26 26" width="26" height="26" fill="none" stroke="var(--accent-2)" strokeWidth="1.2" aria-hidden>
              <path d="M2 13h6.5" />
              <circle cx="13" cy="13" r="4.5" />
              <path d="M17.5 9.5h6.5M17.5 13h6.5M17.5 16.5h6.5" />
            </svg>
            <span className={`${DISPLAY} text-[15px] font-light whitespace-nowrap uppercase tracking-[0.32em]`}>Tool Lab</span>
          </a>
          <span className="hidden h-4 w-px bg-(--border) md:block" />
          <span className="hidden truncate text-sm text-(--muted) md:block">{mvp.name}</span>
          <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
            Live
          </span>
          <nav aria-label="Site" className={`${DISPLAY} ml-auto hidden gap-6 text-xs uppercase tracking-[0.22em] text-(--muted) lg:flex`}>
            <a href="/" className="transition-colors hover:text-(--text)">Journey</a>
            <a href="/architecture" className="transition-colors hover:text-(--text)">System map</a>
          </nav>
          <div className="ml-auto flex flex-col items-end lg:ml-6">
            <a
              href="/"
              className="rounded-full border border-(--border) px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors hover:border-(--accent) hover:text-(--accent)"
            >
              <span className="sm:hidden">How it works →</span>
              <span className="hidden sm:inline">Learn how it&apos;s built →</span>
            </a>
            <a href="/#step-1" className="mt-0.5 hidden text-[11px] text-(--muted) hover:text-(--text) sm:block">
              12 steps, one layer at a time
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 pt-12 pb-8 text-center sm:px-6 sm:pt-16">
        <p className={LABEL}>Live · every run is a real model call</p>
        <h1 className={`${DISPLAY} mt-4 text-4xl leading-[1.05] font-extralight tracking-[0.04em] text-balance sm:text-6xl`}>
          Messy words in. <span className="text-(--accent)">Checked answers</span> out.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-(--muted)">
          Paste any text and press Run. A model reads it, and code checks the answer before you see it.
        </p>
      </section>

      <nav aria-label="Tools" className="mx-auto max-w-7xl px-4 sm:px-6">
        <ul className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-(--border) md:justify-center">
          {patterns.map((p) => {
            const active = p.id === pattern.id;
            return (
              <li key={p.id} className="shrink-0">
                <a
                  href={active ? link() : `/demo?pattern=${p.id}`}
                  aria-current={active ? "page" : undefined}
                  className={`-mb-px flex items-center gap-2.5 border-b-2 px-4 py-3 text-sm transition-colors ${
                    active ? "border-(--accent) text-(--text)" : "border-transparent text-(--muted) hover:text-(--text)"
                  }`}
                >
                  <span className={active ? "text-(--accent)" : ""}>
                    <ToolIcon id={p.id} />
                  </span>
                  <span className={`${DISPLAY} text-[13px] uppercase tracking-[0.18em]`}>{p.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <main className="relative mx-auto grid max-w-7xl gap-0 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_16rem_minmax(0,1fr)] lg:items-stretch">
        <TransmutationStage words={wordsFrom(boxText)} />

        {/* input */}
        <section data-stage="in" className={PANE}>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{mvp.name}</h2>
            <p className="mt-1 text-sm text-(--muted)">
              {pattern.does} · for {mvp.audience}
            </p>
          </div>

          <form method="get" action="/demo" className="flex flex-1 flex-col">
            <input type="hidden" name="pattern" value={intake.pattern} />
            <input type="hidden" name="input" value={intake.input} />
            <input type="hidden" name="audience" value={intake.audience} />
            <input type="hidden" name="detail" value={intake.detail} />

            {pattern.asksQuestion && (
              <div className="mb-4">
                <label htmlFor="question" className={LABEL}>
                  Your question
                </label>
                <input
                  id="question"
                  name="question"
                  defaultValue={question}
                  placeholder="Can I return a sale item?"
                  maxLength={200}
                  className="mt-2 w-full rounded-xl border border-(--border) bg-black/40 px-4 py-2.5 text-[15px] outline-none transition-colors placeholder:text-(--muted)/60 focus:border-(--accent)/60 focus:ring-4 focus:ring-(--accent)/10"
                />
              </div>
            )}

            <div className="flex items-baseline justify-between">
              <label htmlFor="text" className={LABEL}>
                {mvp.input}
              </label>
              <span className={`${MONO} text-[11px] text-(--muted)/70 tabular-nums`}>max {MAX_TEXT.toLocaleString()}</span>
            </div>
            <textarea
              id="text"
              name="text"
              rows={9}
              maxLength={MAX_TEXT}
              spellCheck={false}
              defaultValue={boxText}
              className="mt-2 w-full flex-1 resize-y rounded-xl border border-(--border) bg-black/40 px-4 py-3.5 text-[15px] leading-relaxed outline-none transition-colors focus:border-(--accent)/60 focus:ring-4 focus:ring-(--accent)/10"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {pattern.samples.map((sample) => (
                <a
                  key={sample.label}
                  href={link({ text: sample.text })}
                  className="rounded-full border border-(--border) px-3 py-1 text-xs text-(--muted) transition-colors hover:border-(--accent)/50 hover:text-(--text)"
                >
                  {sample.label}
                </a>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-4">
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-(--accent) to-(--accent-2) px-6 py-2.5 text-sm font-semibold text-(--bg) shadow-lg shadow-(--accent-2)/25 transition-opacity hover:opacity-90"
              >
                Run →
              </button>
              <a href={link()} className="text-sm text-(--muted) transition-colors hover:text-(--text)">
                Reset
              </a>
            </div>
          </form>
        </section>

        {/* the model, drawn by TransmutationStage */}
        <div data-stage="core" className="relative h-52 lg:h-auto">
          <div className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 translate-y-[8.5rem] text-center lg:block">
            <p className={`${LABEL} text-(--accent-2)`}>Gemini reads</p>
            <p className={`${MONO} mt-1 text-[11px] text-(--muted)`}>then Zod checks</p>
          </div>
        </div>

        {/* result */}
        <section data-stage="out" className={PANE}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Result</h2>
            <Status result={result} />
          </div>

          <div className="flex flex-1 flex-col" aria-live="polite">
            {!result && (
              <div className="grid gap-4">
                <p className="text-sm text-(--muted)">Press Run to see {mvp.resultShownAs}.</p>
                <div className="rounded-xl border border-dashed border-(--border) p-4">
                  <ResultPlaceholder mvp={mvp} />
                </div>
              </div>
            )}

            {result?.ok && <ResultView mvp={mvp} data={result.data} />}

            {result && !result.ok && (
              <p className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-[15px] leading-relaxed text-red-200">
                {result.message}
              </p>
            )}

            <div className="mt-auto pt-6">
              <div className="flex flex-wrap items-center gap-2">
                {result?.meta ? (
                  <>
                    <span className={`${PILL} tabular-nums`}>{(result.meta.ms / 1000).toFixed(1)}s</span>
                    <span className={`${PILL} tabular-nums`}>
                      {result.meta.inputTokens + result.meta.outputTokens} tokens
                    </span>
                    <span className={PILL}>{result.meta.model}</span>
                    <span className={PILL}>
                      {result.meta.calls} call{result.meta.calls > 1 ? "s" : ""}
                    </span>
                  </>
                ) : (
                  <span className={PILL}>awaiting first run</span>
                )}
              </div>

              <details className="mt-4 border-t border-(--border) pt-3">
                <summary className="cursor-pointer text-[13px] text-(--muted) transition-colors hover:text-(--text)">
                  How this answer was checked
                </summary>
                <div className="mt-3 grid gap-2">
                  <code className={`${MONO} block overflow-x-auto rounded-lg bg-black/40 px-3 py-2 text-[11px] leading-relaxed text-(--accent)`}>
                    {mvp.schemaCode}
                  </code>
                  <p className="text-[13px] leading-relaxed text-(--muted)">{mvp.validationNote}</p>
                </div>
              </details>
            </div>
          </div>
        </section>
      </main>

      <section aria-label="How it works" className="border-t border-(--border)">
        <ol className="mx-auto grid max-w-7xl gap-px bg-(--border) md:grid-cols-3">
          {STORY.map((s) => (
            <li key={s.n} className="flex flex-col gap-2 bg-(--bg) px-6 py-8">
              <span className={`${DISPLAY} bg-gradient-to-b from-(--text) to-(--text)/15 bg-clip-text text-5xl leading-none font-extralight text-transparent`}>
                {s.n}
              </span>
              <h3 className={`${DISPLAY} mt-2 text-[15px] uppercase tracking-[0.2em]`}>{s.title}</h3>
              <p className="text-[15px] leading-relaxed text-(--muted)">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-14 text-center sm:px-6">
        <h2 className={`${DISPLAY} text-3xl font-extralight tracking-[0.04em] text-balance sm:text-4xl`}>Want to understand how each layer works?</h2>
        <p className="text-(--muted)">
          Browser, Next.js, server, AI API, LLM, structured output, validation, deployment. The journey builds this app from an
          empty folder, one layer at a time, and explains each one.
        </p>
        <a
          href="/"
          className="mt-2 rounded-full bg-gradient-to-r from-(--accent) to-(--accent-2) px-6 py-3 text-sm font-semibold text-(--bg) transition-opacity hover:opacity-90"
        >
          Start the journey →
        </a>
      </section>

      <footer className="mx-auto max-w-7xl px-4 pb-10 text-[13px] text-(--muted) sm:px-6">
        Free tier · every run is a real model call · nothing you paste is stored ·{" "}
        <a href="/" className="underline underline-offset-4 hover:text-(--text)">
          see how it was built
        </a>
        {" · "}
        <a href="/architecture" className="underline underline-offset-4 hover:text-(--text)">
          how it works
        </a>
      </footer>
    </div>
  );
}
