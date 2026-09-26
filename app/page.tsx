// Home page: the intake, then Journey 1.
// All wording comes from content/. This file only decides layout and which state to show.
// It is a server component: it runs on the server and sends plain HTML.
// The learner's choices live in the URL (?pattern=...&input=...), so no browser storage is needed.
import { journey01, stepsFor, type Layer, type Step } from "@/content/journey-01";
import { site } from "@/content/site";
import { getPattern } from "@/content/app-patterns";
import { buildMvp, parseIntake } from "@/lib/build-mvp";
import { IntakeForm, MvpCard, PatternMenu } from "@/components/intake";
import { patterns } from "@/content/app-patterns";
import type { Look } from "@/content/looks";
import { Fragment } from "react";

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:pt-0.5">
        {label}
      </p>
      <div className="min-w-0 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
        {children}
      </div>
    </div>
  );
}

function Pre({ children }: { children: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-[13px] leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
      {children}
    </pre>
  );
}

// A small picture of a look, drawn from its own tokens: background, text, surface and accent.
function LookSwatch({ look }: { look: Look }) {
  const t = look.tokens;
  return (
    <span
      aria-hidden
      className="grid h-14 w-24 shrink-0 content-center gap-1.5 overflow-hidden border px-2.5"
      style={{ background: t.bg, borderColor: t.border, borderRadius: t.radius }}
    >
      <span className="block h-1.5 w-12 rounded-full" style={{ background: t.text }} />
      <span className="block h-3 w-full border" style={{ background: t.surface, borderColor: t.border, borderRadius: t.radius }} />
      <span className="block h-2 w-8 rounded-full" style={{ background: t.accent }} />
    </span>
  );
}

const LAYERS: { id: Layer; label: string }[] = [
  { id: "computer", label: "Your computer" },
  { id: "page", label: "Page" },
  { id: "server", label: "Server" },
  { id: "model", label: "Model" },
  { id: "internet", label: "GitHub + Vercel" },
];

// "Where this fits": the app's layers, with the ones this step touches filled in.
function LayerStrip({ active }: { active: Layer[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px]" aria-label={`Where this fits: ${active.join(", ")}`}>
      <span className="mr-1 font-semibold uppercase tracking-wider text-zinc-400">Where this fits</span>
      {LAYERS.map((l, i) => {
        const on = active.includes(l.id);
        const arrow = i >= 2 && i <= 3; // page → server → model is the request path
        return (
          <span key={l.id} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden className="text-zinc-300 dark:text-zinc-700">{arrow ? "→" : "·"}</span>}
            <span
              className={`rounded px-1.5 py-0.5 font-medium ${
                on
                  ? "bg-emerald-700 text-white dark:bg-emerald-500 dark:text-zinc-950"
                  : "text-zinc-400 ring-1 ring-inset ring-zinc-200 dark:text-zinc-600 dark:ring-zinc-800"
              }`}
            >
              {l.label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

// A left-to-right chain of labelled boxes, e.g. Browser → Server → Model. Wraps on small screens.
function Chain({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ol className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[13px]">
      {items.map((it, i) => (
        <li key={it} className="flex items-center gap-1.5">
          <span
            className={`rounded-md px-2 py-1 font-medium ${
              dark ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 dark:border-zinc-700"
            }`}
          >
            {it}
          </span>
          {i < items.length - 1 && <span aria-hidden className="text-zinc-400">→</span>}
        </li>
      ))}
    </ol>
  );
}

// Code the learner types or runs: dark, like the editor they'll paste it into.
function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-950 px-4 py-3 font-mono text-[13px] leading-relaxed text-zinc-100 ring-1 ring-zinc-800">
      {children}
    </pre>
  );
}

function StepCard({
  step,
  index,
  total,
  phase,
  next,
  personalised,
}: {
  step: Step;
  index: number;
  total: number;
  phase: string;
  next?: { index: number; title: string };
  personalised: boolean;
}) {
  return (
    <li
      id={`step-${index + 1}`}
      className="scroll-mt-6 rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <p className="font-mono text-xs text-zinc-500">
        Step {index + 1} of {total} · {phase}
      </p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          {step.concept}
        </span>
        {personalised && (
          <span className="rounded-full border border-emerald-600 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Your app
          </span>
        )}
      </div>
      <div className="mt-3">
        <LayerStrip active={step.layers} />
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-5">
        <Block label="The problem">{step.problem}</Block>
        <Block label="The idea">
          {step.idea}
          {step.diagram && <Pre>{step.diagram}</Pre>}
        </Block>

        <div className="min-w-0 rounded-lg border border-emerald-600/40 bg-emerald-50/40 p-4 dark:border-emerald-500/30 dark:bg-emerald-950/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Do this</p>
          <div className="mt-1.5 min-w-0 text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200">
            {step.action}
            {step.code && <Code>{step.code}</Code>}
            {step.choices && (
              <div className="mt-3 grid min-w-0 gap-2">
                {step.choices.map((c, i) => (
                  <details key={c.name} open={i === 0} className="group min-w-0 overflow-hidden rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    <summary className="flex cursor-pointer list-none items-center gap-4 p-3">
                      <LookSwatch look={c.look} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-zinc-900 dark:text-zinc-100">{c.name}</span>
                        <span className="block text-sm text-zinc-600 dark:text-zinc-400">{c.mood}</span>
                      </span>
                      <span aria-hidden className="text-zinc-400 transition-transform group-open:rotate-90">›</span>
                    </summary>
                    <div className="border-t border-zinc-200 px-3 pb-3 dark:border-zinc-800">
                      <Code>{c.code}</Code>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>

        <Block label="You should see">
          {step.result}
          {step.link && (
            <p className="mt-1">
              <a
                href={step.link.href}
                className="font-medium text-emerald-700 underline underline-offset-4 dark:text-emerald-400"
              >
                {step.link.label} →
              </a>
            </p>
          )}
        </Block>
        <div className="grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-800">
          <div className="bg-zinc-50 px-4 py-3.5 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Technically, what just happened</p>
            <p className="mt-1 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">{step.understand}</p>
          </div>
          <div className="bg-zinc-900 px-4 py-3.5 dark:bg-zinc-950">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">PM lens · why you should care</p>
            <p className="mt-1 text-[15px] leading-relaxed text-zinc-100">{step.pmLens}</p>
          </div>
        </div>

        {step.snag && (
          <div className="rounded-md border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
            <span className="font-semibold">Where people get stuck: </span>
            {step.snag}
          </div>
        )}

        {step.fails && (
          <details className="group rounded-md border border-zinc-200 dark:border-zinc-800">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm">
              <span aria-hidden className="text-zinc-400 transition-transform group-open:rotate-90">›</span>
              <span className="font-semibold">If this doesn&apos;t work</span>
              <span className="text-zinc-500">
                · {step.fails.causes.length} likely cause{step.fails.causes.length > 1 ? "s" : ""}
              </span>
            </summary>
            <div className="border-t border-zinc-200 px-4 py-3 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
              <ol className="grid list-decimal gap-1.5 pl-5">
                {step.fails.causes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ol>
              <p className="mt-3">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Most likely fix: </span>
                {step.fails.fix}
              </p>
              <div className="mt-4 rounded-md border border-dashed border-zinc-300 px-3 py-2.5 dark:border-zinc-700">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Stuck? Show me what you&apos;re seeing.</span>
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800">Coming soon</span>
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Paste an error, upload a screenshot or describe what happened. You&apos;ll get a diagnosis that explains what
                  happened and why, the fix, and the concept behind it, then asks you to check the result.
                </p>
              </div>
            </div>
          </details>
        )}
      </div>

      <div className="mt-5 border-t border-zinc-100 pt-3 text-sm dark:border-zinc-900">
        {next ? (
          <a href={`#step-${next.index + 1}`} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            Next: {next.index + 1} · {next.title} ↓
          </a>
        ) : (
          <a href="#done" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            Finish: see what you built ↓
          </a>
        )}
      </div>
    </li>
  );
}

type SearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const j = journey01;

  // A live app is always on screen. Without any choices, it runs the first
  // pattern's example, so a visitor can press Run within seconds of arriving.
  const pattern = getPattern(one(params.pattern)) ?? patterns[0];
  const answered = one(params.input) !== undefined && one(params.edit) === undefined;
  const parsed = answered ? parseIntake(params) : null;
  const intake = parsed?.ok ? parsed.intake : { pattern: pattern.id, ...pattern.example };
  const mvp = buildMvp(intake);
  const steps = stepsFor(parsed?.ok ? mvp : undefined);

  const values = { input: one(params.input), audience: one(params.audience), detail: one(params.detail) };
  const changeHref = `/?${new URLSearchParams({ pattern: pattern.id, ...values, edit: "1" } as Record<string, string>).toString()}#build`;

  let chooser;
  if (parsed?.ok) chooser = <MvpCard mvp={mvp} changeHref={changeHref} />;
  else if (one(params.pattern) && (one(params.edit) !== undefined || one(params.input) !== undefined || one(params.make) !== undefined))
    chooser = <IntakeForm pattern={pattern} values={values} error={parsed && !parsed.ok ? parsed.message : undefined} />;
  else chooser = <PatternMenu activeId={pattern.id} />;

  const phaseOf = (i: number) => j.phases.find((ph) => i + 1 >= ph.steps[0] && i + 1 <= ph.steps[1])!;
  const nav = "rounded-md px-3 py-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100";
  const eyebrow = "text-xs font-semibold uppercase tracking-widest";
  const c = j.closing;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={`${eyebrow} text-zinc-500`}>
          AI Tool Lab for PMs
          {parsed?.ok && ` · building ${mvp.name}`}
        </p>
        <nav aria-label="Site" className="flex gap-1 text-sm">
          <a href="/demo" className={nav}>
            Live demo
          </a>
          <a href="/architecture" className={nav}>
            System map
          </a>
        </nav>
      </div>

      {/* Who it's for, what you'll learn, what you'll do */}
      <header className="mt-10">
        <p className={`${eyebrow} text-emerald-700 dark:text-emerald-400`}>{site.eyebrow}</p>
        <h1 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-[2.6rem]">{site.headline}</h1>
        <p className="mt-4 text-xl leading-relaxed text-zinc-700 dark:text-zinc-300">{site.promise}</p>
        <p className="mt-3 leading-relaxed text-zinc-500">{site.audience}</p>
        <p className="mt-6 border-l-4 border-emerald-600 pl-4 text-lg font-semibold tracking-tight dark:border-emerald-400">
          {site.philosophy}
        </p>
      </header>

      {/* Why this is different: a different goal, not a better builder */}
      <section aria-label="Is this for you?" className="mt-8 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        {site.goals.map((g, i) => (
          <div
            key={g.goal}
            className={`grid gap-1 p-4 sm:grid-cols-[15rem_minmax(0,1fr)] sm:gap-4 ${
              i === 1 ? "border-t border-zinc-200 bg-zinc-900 text-zinc-100 dark:border-zinc-800" : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <p className="text-sm">
              If your goal is <span className={`font-semibold ${i === 1 ? "text-emerald-400" : "text-zinc-900 dark:text-zinc-100"}`}>{g.goal}</span>
            </p>
            <p className="text-sm">→ {g.answer}</p>
          </div>
        ))}
        <p className="border-t border-zinc-200 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800">
          A course: {site.format.course.join(" → ")}. Here: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{site.format.lab.join(" → ")}</span>.
        </p>
      </section>

      {/* The demo as a hook: what you see, and what's underneath */}
      <section aria-label="The app you'll build" className="mt-10">
        <h2 className="text-sm font-semibold">The app you&apos;ll build, and what&apos;s underneath it</h2>
        <div className="mt-3 grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] dark:border-zinc-800 dark:bg-zinc-800">
          <div className="bg-white p-4 dark:bg-zinc-950">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">What you see</p>
            <Chain items={site.demo.sees} />
          </div>
          <div className="bg-zinc-50 p-4 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">What&apos;s actually happening</p>
            <Chain items={site.demo.underneath} dark />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            href={mvp.demoHref}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Try {mvp.name} →
          </a>
          <a href="#step-1" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            Want to understand each layer? Start the journey ↓
          </a>
        </div>
      </section>

      {/* The real value: understanding */}
      <section aria-label="What you'll understand" className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">What you&apos;ll actually understand</h2>
        <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {site.understand.map((u) => (
            <li key={u} className="flex gap-2.5 text-[15px] leading-snug">
              <span aria-hidden className="text-emerald-600 dark:text-emerald-400">✓</span>
              {u}
            </li>
          ))}
        </ul>
        <p className="mt-5 font-medium">{site.outcomeLine}</p>
      </section>

      {/* Journey 1 */}
      <section className="mt-12 border-t border-zinc-200 pt-10 dark:border-zinc-800">
        <p className={`${eyebrow} text-zinc-500`}>Journey {j.number}</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{j.name}</h2>
        <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">{j.promise}</p>

        <div className="mt-6">{chooser}</div>

        <p className="mt-4 text-xs text-zinc-500">{site.providerNote}</p>

        {/* The route: where am I, what's next */}
        <nav aria-label="Your route" className="mt-8">
          <p className="text-sm font-semibold">Your route · {steps.length} steps</p>
          <ol className="mt-3 grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-5 dark:border-zinc-800 dark:bg-zinc-800">
            {j.phases.map((ph, pi) => (
              <li key={ph.title} className="bg-white p-3 dark:bg-zinc-950">
                <p className="font-mono text-[11px] text-zinc-400">{String(pi + 1).padStart(2, "0")}</p>
                <p className="text-[13px] leading-snug font-semibold">{ph.title}</p>
                <ul className="mt-2 grid gap-1">
                  {steps.slice(ph.steps[0] - 1, ph.steps[1]).map((st, k) => {
                    const n = ph.steps[0] + k;
                    return (
                      <li key={st.title}>
                        <a href={`#step-${n}`} className="flex gap-1.5 text-xs leading-snug text-zinc-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400">
                          <span className="font-mono text-zinc-400">{n}</span>
                          {st.title}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        </nav>

        <ol className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-5">
          {steps.map((s, i) => {
            const ph = phaseOf(i);
            const firstOfPhase = i + 1 === ph.steps[0];
            return (
              <Fragment key={s.title}>
                {firstOfPhase && (
                  <li className="mt-4 first:mt-0">
                    <p className="font-mono text-xs text-zinc-400">Stage {j.phases.indexOf(ph) + 1} of {j.phases.length}</p>
                    <p className="text-lg font-semibold tracking-tight">{ph.title}</p>
                  </li>
                )}
                <StepCard
                  step={s}
                  index={i}
                  total={steps.length}
                  phase={ph.title}
                  next={steps[i + 1] ? { index: i + 1, title: steps[i + 1].title } : undefined}
                  personalised={s.personalised}
                />
              </Fragment>
            );
          })}
        </ol>

        {/* The finish line */}
        <section id="done" className="mt-12 scroll-mt-6 rounded-2xl border-2 border-zinc-900 bg-white p-6 sm:p-8 dark:border-zinc-200 dark:bg-zinc-950">
          <p className={`${eyebrow} text-emerald-700 dark:text-emerald-400`}>Journey {j.number} complete</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            {parsed?.ok ? `You built ${mvp.name}. More importantly, you understand it.` : "You built an AI app. More importantly, you understand it."}
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">{c.intro}</p>

          <h3 className="mt-8 text-sm font-semibold">What your app does, and you can now explain</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {c.built.map((b) => (
              <li key={b.text} className="flex gap-2.5 text-[15px] leading-snug">
                <span aria-hidden className="mt-0.5 text-emerald-600 dark:text-emerald-400">✓</span>
                <span>
                  {b.text}{" "}
                  <a href={`#step-${b.step}`} className="font-mono text-xs whitespace-nowrap text-zinc-400 hover:text-emerald-700">
                    step {b.step}
                  </a>
                </span>
              </li>
            ))}
          </ul>

          <h3 className="mt-8 text-sm font-semibold">The anatomy of an AI application</h3>
          <ol className="mt-3 flex flex-wrap items-stretch gap-x-2 gap-y-3">
            {c.flow.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  <span className="block text-sm font-semibold">{f.label}</span>
                  <span className="block text-xs text-zinc-500">{f.note}</span>
                </span>
                {i < c.flow.length - 1 && <span aria-hidden className="text-zinc-400">→</span>}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-zinc-500">
            Around it sits the development lifecycle: <span className="font-medium text-zinc-700 dark:text-zinc-300">Git</span> records
            versions, <span className="font-medium text-zinc-700 dark:text-zinc-300">GitHub</span> shares them, and{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Vercel</span> turns a push into a live URL.
          </p>

          <div id="pattern" className="mt-10 scroll-mt-6">
            <h3 className="text-xl font-semibold tracking-tight">The same anatomy powers many AI products</h3>
            <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">
              Only the prompt and the schema change. Once you can see this anatomy, you can reason about almost any AI feature an
              engineer describes to you.
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              {c.pattern.stages.map((st, i) => (
                <span key={st} className="flex items-center gap-2">
                  <span className="rounded-md bg-zinc-900 px-2.5 py-1 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">{st}</span>
                  {i < c.pattern.stages.length - 1 && <span aria-hidden className="text-zinc-400">→</span>}
                </span>
              ))}
            </p>
            <div className="mt-5 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="bg-zinc-50 text-xs text-zinc-500 dark:bg-zinc-900">
                  <tr>
                    <th className="px-3 py-2 font-semibold">What you could build next</th>
                    <th className="px-3 py-2 font-semibold">Input</th>
                    <th className="px-3 py-2 font-semibold">Output shape (your schema)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {c.pattern.examples.map((e) => (
                    <tr key={e.name} className="align-top">
                      <td className="px-3 py-2.5 font-medium">
                        {e.name}
                        {e.note && <span className="mt-1 block text-xs font-normal text-amber-700 dark:text-amber-400">{e.note}</span>}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{e.input}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-zinc-700 dark:text-zinc-300">{e.output}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <a href="/architecture" className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              Explore every layer on the system map →
            </a>
          </div>

          <h3 className="mt-10 text-sm font-semibold">Questions you can now answer</h3>
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {c.questions.map((q, i) => (
              <li key={q.q} className="flex gap-2 text-sm leading-snug">
                <span className="w-5 shrink-0 font-mono text-xs text-zinc-400">{i + 1}</span>
                <span>
                  {q.q}{" "}
                  <a href={q.step ? `#step-${q.step}` : "#pattern"} className="font-mono text-xs whitespace-nowrap text-zinc-400 hover:text-emerald-700">
                    {q.step ? `step ${q.step}` : "the pattern"}
                  </a>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-10 grid gap-6 border-t border-zinc-200 pt-6 sm:grid-cols-2 dark:border-zinc-800">
            <div>
              <p className="text-sm font-semibold">What it can&apos;t do yet</p>
              <ul className="mt-2 grid gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                {c.notYet.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="text-zinc-400">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold">Things to try before you stop</p>
              <ol className="mt-2 grid gap-3">
                {c.tryNext.map((item, i) => (
                  <li key={item.title} className="text-sm">
                    <p className="font-medium">
                      <span className="mr-2 font-mono text-xs text-zinc-400">{i + 1}</span>
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-zinc-600 dark:text-zinc-400">{item.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-dashed border-zinc-300 p-5 dark:border-zinc-700">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Coming next</p>
          <h2 className="mt-2 text-lg font-semibold">{j.next.title}</h2>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{j.next.teaser}</p>
        </section>
      </section>
    </main>
  );
}
