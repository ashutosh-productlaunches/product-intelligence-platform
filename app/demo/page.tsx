// /demo — the working app, on its own screen.
// A visitor can use it without reading anything: pick a tool, paste text, press Run.
// Server component: the form reloads the page, the server makes one model call,
// checks the reply, and renders it. No JavaScript ships to the browser.
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

function statusChip(result: DemoResult | null) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium";
  const dot = "h-1.5 w-1.5 rounded-full";
  if (!result)
    return (
      <span className={`${base} bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400`}>
        <span className={`${dot} bg-zinc-400`} /> Ready
      </span>
    );
  if (result.ok && result.repaired)
    return (
      <span className={`${base} bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200`}>
        <span className={`${dot} bg-amber-500`} /> Fixed on retry
      </span>
    );
  if (result.ok)
    return (
      <span className={`${base} bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200`}>
        <span className={`${dot} bg-emerald-500`} /> Checked
      </span>
    );
  return (
    <span className={`${base} bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200`}>
      <span className={`${dot} bg-red-500`} /> Stopped
    </span>
  );
}

export default async function DemoPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const pattern = getPattern(one(params.pattern)) ?? patterns[0];
  const parsed = one(params.input) ? parseIntake(params) : null;
  const intake: Intake = parsed?.ok ? parsed.intake : { pattern: pattern.id, ...pattern.example };
  const mvp = buildMvp(intake);
  const text = one(params.text) ?? "";
  const result: DemoResult | null = text ? await runDemo(intake, text) : null;

  const keep = (id: string) => {
    const q = new URLSearchParams({ pattern: id });
    if (parsed?.ok && id === intake.pattern) {
      q.set("input", intake.input);
      q.set("audience", intake.audience);
      q.set("detail", intake.detail);
    }
    return `/demo?${q.toString()}`;
  };

  const card = "rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950";
  const cardHead = "border-b border-zinc-200 px-5 py-4 dark:border-zinc-800";

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      {/* top bar */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-zinc-900 text-[11px] font-bold text-white dark:bg-white dark:text-zinc-900">
            AI
          </span>
          <span className="text-sm font-semibold tracking-tight">AI Tool Lab</span>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="truncate text-sm text-zinc-600 dark:text-zinc-400">{mvp.name}</span>
          <a
            href="/"
            className="ml-auto rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Build this yourself
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)]">
        {/* tool switcher */}
        <nav aria-label="Tools" className="mb-6 lg:mb-0">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Tools</p>
          <ul className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:gap-1 lg:overflow-visible">
            {patterns.map((p) => {
              const active = p.id === pattern.id;
              return (
                <li key={p.id} className="shrink-0">
                  <a
                    href={keep(p.id)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-zinc-900 font-medium text-white dark:bg-white dark:text-zinc-900"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <ToolIcon id={p.id} />
                    <span className="whitespace-nowrap">{p.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 hidden px-1 text-xs leading-relaxed text-zinc-500 lg:block">
            Each tool is one model call with a checked, structured answer.
          </p>
        </nav>

        {/* workspace */}
        <main className="grid items-start gap-6 xl:grid-cols-2">
          <section className={card}>
            <div className={cardHead}>
              <h1 className="text-[15px] font-semibold tracking-tight">{mvp.name}</h1>
              <p className="mt-0.5 text-sm text-zinc-500">
                {pattern.does} · for {mvp.audience}
              </p>
            </div>
            <form method="get" action="/demo" className="px-5 py-4">
              <input type="hidden" name="pattern" value={intake.pattern} />
              <input type="hidden" name="input" value={intake.input} />
              <input type="hidden" name="audience" value={intake.audience} />
              <input type="hidden" name="detail" value={intake.detail} />
              <label htmlFor="text" className="text-sm font-medium">
                Paste {mvp.input}
              </label>
              <textarea
                id="text"
                name="text"
                rows={9}
                maxLength={MAX_TEXT}
                defaultValue={text || mvp.sampleText}
                spellCheck={false}
                className="mt-2 w-full resize-y rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Run
                </button>
                <a href={keep(pattern.id)} className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-200">
                  Reset
                </a>
                <span className="ml-auto text-xs text-zinc-400 tabular-nums">max {MAX_TEXT.toLocaleString()} characters</span>
              </div>
            </form>
          </section>

          <section className={card}>
            <div className={`${cardHead} flex items-center justify-between gap-3`}>
              <h2 className="text-[15px] font-semibold tracking-tight">Result</h2>
              {statusChip(result)}
            </div>

            <div className="px-5 py-4" aria-live="polite">
              {!result && (
                <div className="grid gap-4">
                  <p className="text-sm text-zinc-500">Press Run to see {mvp.resultShownAs}.</p>
                  <div className="rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
                    <ResultPlaceholder mvp={mvp} />
                  </div>
                </div>
              )}

              {result?.ok && <ResultView mvp={mvp} data={result.data} />}

              {result && !result.ok && (
                <div className="grid gap-4">
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[15px] leading-relaxed text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100">
                    {result.message}
                  </p>
                  <div className="rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
                    <ResultPlaceholder mvp={mvp} />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
              {result?.meta ? (
                <p className="font-mono text-[11px] text-zinc-500 tabular-nums">
                  {result.meta.model} · {(result.meta.ms / 1000).toFixed(1)}s ·{" "}
                  {result.meta.inputTokens + result.meta.outputTokens} tokens ·{" "}
                  {result.meta.calls} call{result.meta.calls > 1 ? "s" : ""}
                </p>
              ) : (
                <p className="font-mono text-[11px] text-zinc-400">awaiting first run</p>
              )}
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200">
                  How this answer was checked
                </summary>
                <div className="mt-2 grid gap-2">
                  <p className="text-xs text-zinc-500">The reply is refused unless it matches this shape:</p>
                  <code className="block overflow-x-auto rounded-md bg-zinc-50 px-3 py-2 font-mono text-[11px] leading-relaxed dark:bg-zinc-900">
                    {mvp.schemaCode}
                  </code>
                  <p className="text-xs text-zinc-500">{mvp.validationNote}</p>
                </div>
              </details>
            </div>
          </section>
        </main>
      </div>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-zinc-500 sm:px-6">
        A live demo on a free tier: every run makes a real model call, and nothing you paste is stored.{" "}
        <a href="/" className="underline underline-offset-4">
          See how it was built
        </a>
        .
      </footer>
    </div>
  );
}
