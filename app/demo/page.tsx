// /demo — the working app, on its own screen.
// Pick a tool, paste text, press Run. No JavaScript ships to the browser:
// the form reloads the page, the server makes one model call, checks the
// reply against a fixed shape, and renders it.
//
// This screen commits to one dark look on purpose. It is the product face of
// the lab; the journey page it links back to stays light.
import type { Metadata } from "next";
import { getPattern, patterns } from "@/content/app-patterns";
import { buildMvp, parseIntake, type Intake } from "@/lib/build-mvp";
import { runDemo, MAX_TEXT, type DemoResult } from "@/lib/run-demo";
import { ResultPlaceholder, ResultView } from "@/components/app-preview";
import { ToolIcon } from "@/components/tool-icons";

export const metadata: Metadata = {
  title: "Live demo · AI Tool Lab",
  description: "Five small AI tools you can use right now. Paste text, press Run.",
};

type SearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const PANEL =
  "flex min-h-[32rem] flex-col rounded-2xl border border-white/[.07] bg-gradient-to-b from-white/[.055] to-white/[.025] shadow-2xl shadow-black/40";
const PANEL_HEAD = "border-b border-white/[.06] px-6 py-5";
const LABEL = "text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500";
const PILL = "rounded-md bg-white/[.05] px-2 py-1 font-mono text-[11px] text-zinc-400";

function Status({ result }: { result: DemoResult | null }) {
  const shell = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium";
  const dot = "h-1.5 w-1.5 rounded-full";
  if (!result) return <span className={`${shell} border-white/10 text-zinc-400`}><span className={`${dot} bg-zinc-500`} />Ready</span>;
  if (result.ok && result.repaired)
    return <span className={`${shell} border-amber-400/25 bg-amber-400/10 text-amber-300`}><span className={`${dot} bg-amber-400`} />Fixed on retry</span>;
  if (result.ok)
    return <span className={`${shell} border-emerald-400/25 bg-emerald-400/10 text-emerald-300`}><span className={`${dot} bg-emerald-400`} />Checked</span>;
  return <span className={`${shell} border-red-400/25 bg-red-400/10 text-red-300`}><span className={`${dot} bg-red-400`} />Stopped</span>;
}

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

  return (
    <div className="min-h-full bg-[#09090e] text-zinc-100">
      <div
        className="min-h-full"
        style={{
          backgroundImage:
            "radial-gradient(60rem 30rem at 12% -10%, rgba(99,102,241,.26), transparent 60%), radial-gradient(40rem 24rem at 90% 0%, rgba(168,85,247,.16), transparent 60%)",
        }}
      >
        <header className="sticky top-0 z-10 border-b border-white/[.06] bg-[#09090e]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-400 to-violet-600 text-[11px] font-bold text-white shadow-lg shadow-indigo-500/25">
              AI
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Tool Lab</span>
            <span className="hidden h-4 w-px bg-white/10 sm:block" />
            <span className="hidden truncate text-sm text-zinc-400 sm:block">{mvp.name}</span>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
              Live
            </span>
            <a
              href="/"
              className="ml-auto rounded-lg bg-white/[.06] px-3.5 py-2 text-sm font-medium text-zinc-200 ring-1 ring-white/10 transition-colors hover:bg-white/[.1]"
            >
              Build this yourself →
            </a>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <nav aria-label="Tools">
            <p className={`mb-3 px-2 ${LABEL}`}>Tools</p>
            <ul className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:gap-1 lg:overflow-visible">
              {patterns.map((p) => {
                const active = p.id === pattern.id;
                return (
                  <li key={p.id} className="shrink-0">
                    <a
                      href={p.id === pattern.id ? link() : `/demo?pattern=${p.id}`}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm whitespace-nowrap transition-colors ${
                        active
                          ? "bg-gradient-to-r from-indigo-500/20 to-transparent font-medium text-white ring-1 ring-inset ring-indigo-400/25"
                          : "text-zinc-400 hover:bg-white/[.04] hover:text-zinc-200"
                      }`}
                    >
                      {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-indigo-400" />}
                      <ToolIcon id={p.id} />
                      {p.name}
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 hidden rounded-xl border border-white/[.06] p-3 lg:block">
              <p className={LABEL}>How it works</p>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
                One model call. The answer is refused unless it matches a fixed shape.
              </p>
            </div>
          </nav>

          <main className="grid gap-6 xl:grid-cols-2 xl:items-stretch">
            {/* input */}
            <section className={PANEL}>
              <div className={PANEL_HEAD}>
                <h1 className="text-lg font-semibold tracking-tight">{mvp.name}</h1>
                <p className="mt-1 text-sm text-zinc-400">
                  {pattern.does} · for {mvp.audience}
                </p>
              </div>

              <form method="get" action="/demo" className="flex flex-1 flex-col px-6 py-5">
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
                      className="mt-2 w-full rounded-xl border border-white/[.08] bg-black/40 px-4 py-2.5 text-[15px] text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                )}

                <div className="flex items-baseline justify-between">
                  <label htmlFor="text" className={LABEL}>
                    {mvp.input}
                  </label>
                  <span className="font-mono text-[11px] text-zinc-600 tabular-nums">max {MAX_TEXT.toLocaleString()}</span>
                </div>
                <textarea
                  id="text"
                  name="text"
                  rows={10}
                  maxLength={MAX_TEXT}
                  spellCheck={false}
                  defaultValue={text || pattern.samples[0].text}
                  className="mt-2 w-full flex-1 resize-y rounded-xl border border-white/[.08] bg-black/40 px-4 py-3.5 text-[15px] leading-relaxed text-zinc-100 outline-none transition-colors focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/10"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {pattern.samples.map((sample) => (
                    <a
                      key={sample.label}
                      href={link({ text: sample.text })}
                      className="rounded-lg border border-white/[.08] px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:border-indigo-400/40 hover:text-zinc-100"
                    >
                      {sample.label}
                    </a>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-b from-indigo-400 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-opacity hover:opacity-90"
                  >
                    Run
                  </button>
                  <a href={link()} className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">
                    Reset
                  </a>
                </div>
              </form>
            </section>

            {/* result */}
            <section className={PANEL}>
              <div className={`${PANEL_HEAD} flex items-center justify-between gap-3`}>
                <h2 className="text-lg font-semibold tracking-tight">Result</h2>
                <Status result={result} />
              </div>

              <div className="flex flex-1 flex-col px-6 py-5" aria-live="polite">
                {!result && (
                  <div className="grid gap-4">
                    <p className="text-sm text-zinc-400">Press Run to see {mvp.resultShownAs}.</p>
                    <div className="rounded-xl border border-dashed border-white/10 p-4">
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

                  <details className="mt-4 border-t border-white/[.06] pt-3">
                    <summary className="cursor-pointer text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">
                      How this answer was checked
                    </summary>
                    <div className="mt-3 grid gap-2">
                      <code className="block overflow-x-auto rounded-lg bg-black/40 px-3 py-2 font-mono text-[11px] leading-relaxed text-zinc-300">
                        {mvp.schemaCode}
                      </code>
                      <p className="text-[13px] leading-relaxed text-zinc-400">{mvp.validationNote}</p>
                    </div>
                  </details>
                </div>
              </div>
            </section>
          </main>
        </div>

        <footer className="mx-auto max-w-7xl px-4 pb-10 text-[13px] text-zinc-500 sm:px-6">
          Free tier · every run is a real model call · nothing you paste is stored ·{" "}
          <a href="/" className="underline underline-offset-4 hover:text-zinc-300">
            see how it was built
          </a>
        </footer>
      </div>
    </div>
  );
}
