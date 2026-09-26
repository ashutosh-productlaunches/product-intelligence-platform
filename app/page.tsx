// Home page: the intake, then Journey 1.
// All wording comes from content/. This file only decides layout and which state to show.
// It is a server component: it runs on the server and sends plain HTML.
// The learner's choices live in the URL (?pattern=...&input=...), so no browser storage is needed.
import { journey01, stepsFor, type Layer, type Step } from "@/content/journey-01";
import { site } from "@/content/site";
import { checks01, type Question } from "@/content/checks-01";
import { getPattern } from "@/content/app-patterns";
import { buildMvp, parseIntake } from "@/lib/build-mvp";
import { IntakeForm, MvpCard, PatternMenu } from "@/components/intake";
import { patterns } from "@/content/app-patterns";
import type { Look } from "@/content/looks";
import { SectionNav } from "@/components/section-nav";
import { JourneyPlayer } from "@/components/journey-player";
import { Panes } from "@/components/panes";


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

// Five questions after each step. Each answer opens to say why it's right or why it's wrong.
// Plain <details>, so no JavaScript and no score: a self-check, not an exam.
// Put the correct answer in a varied position (A, B or C) so it can't be guessed by position.
// Deterministic: the same question always shows the same order.
function placed<T extends { correct?: true }>(answers: T[], step: number, qi: number): T[] {
  const right = answers.find((a) => a.correct)!;
  const wrong = answers.filter((a) => !a.correct);
  const at = (qi * 2 + step) % answers.length;
  return [...wrong.slice(0, at), right, ...wrong.slice(at)];
}

function CheckUnderstanding({ questions, step }: { questions: Question[]; step: number }) {
  const letters = ["A", "B", "C", "D"];
  return (
    <ol className="grid gap-5">
      {questions.map((qn, qi) => (
        <li key={qn.q}>
          <p className="text-[15px] font-medium">
            <span className="mr-2 font-mono text-xs text-zinc-400">
              {step}.{qi + 1}
            </span>
            {qn.q}
          </p>
          <div className="mt-2 grid gap-1.5">
            {placed(qn.answers, step, qi).map((a, ai) => (
              <details key={a.text} className="group/ans rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <summary className="flex cursor-pointer list-none gap-2.5 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <span className="font-mono text-xs leading-5 text-zinc-400">{letters[ai]}</span>
                  <span>{a.text}</span>
                </summary>
                <p
                  className={`border-t px-3 py-2 text-sm leading-relaxed ${
                    a.correct
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                      : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
                  }`}
                >
                  <span className="font-semibold">{a.correct ? "Correct. " : "Not quite. "}</span>
                  {a.why}
                </p>
              </details>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

// The app's architecture as a picture, at the top of every step.
// Filled: what this step builds. Outlined: what earlier steps already built. Dashed: still to come.
const ARCH: { id: Layer; label: string; short: string; note: string }[] = [
  { id: "computer", label: "Your computer", short: "Laptop", note: "VS Code · Node" },
  { id: "page", label: "Page", short: "Page", note: "what people see" },
  { id: "server", label: "Server", short: "Server", note: "holds the key" },
  { id: "model", label: "Model", short: "Model", note: "Gemini" },
  { id: "internet", label: "GitHub + Vercel", short: "Online", note: "live URL" },
];

function ArchitectureBar({ current, built }: { current: Layer[]; built: Layer[] }) {
  const box = (id: Layer) =>
    current.includes(id)
      ? "border-emerald-700 bg-emerald-700 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-zinc-950"
      : built.includes(id)
        ? "border-emerald-600/50 bg-emerald-50 text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-950/40 dark:text-emerald-200"
        : "border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600";
  const cell = (l: (typeof ARCH)[number]) => (
    <div className={`min-w-0 flex-1 rounded-lg border px-1 py-2 text-center transition-colors sm:px-2 ${box(l.id)}`}>
      <p className="truncate text-[11px] leading-tight font-semibold sm:text-[13px]">
        <span className="sm:hidden">{l.short}</span>
        <span className="hidden sm:inline">{l.label}</span>
      </p>
      <p className="hidden truncate text-[11px] leading-tight opacity-75 sm:block">{l.note}</p>
    </div>
  );
  const [computer, page, server, model, internet] = ARCH;
  return (
    <div aria-label={`This step works on: ${current.join(", ")}`}>
      <div className="flex items-stretch gap-1 sm:gap-2">
        {cell(computer)}
        <span aria-hidden className="self-center text-zinc-300 dark:text-zinc-700">|</span>
        {cell(page)}
        <span aria-hidden className="self-center text-zinc-400">→</span>
        {cell(server)}
        <span aria-hidden className="self-center text-zinc-400">→</span>
        {cell(model)}
        <span aria-hidden className="self-center text-zinc-300 dark:text-zinc-700">|</span>
        {cell(internet)}
      </div>
      <p className="mt-1.5 flex gap-4 text-[11px] text-zinc-400">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-emerald-700 align-middle dark:bg-emerald-500" />this step</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-sm border border-emerald-600/50 bg-emerald-50 align-middle dark:bg-emerald-950" />built earlier</span>
      </p>
    </div>
  );
}

function StepCard({
  step,
  index,
  total,
  phase,
  next,
  personalised,
  check,
  built,
}: {
  step: Step;
  index: number;
  total: number;
  phase: string;
  next?: { index: number; title: string };
  personalised: boolean;
  check?: Question[];
  built: Layer[];
}) {
  const why = (
    <div key="why" className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
      {step.idea}
      {step.diagram && <Pre>{step.diagram}</Pre>}
    </div>
  );

  const doIt = (
    <div key="do" className="min-w-0 text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200">
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
  );

  const see = (
    <div key="see" className="grid gap-4">
      <div className="flex gap-3 rounded-lg border border-emerald-600/40 bg-emerald-50/50 p-4 text-[15px] leading-relaxed dark:border-emerald-500/30 dark:bg-emerald-950/20">
        <span aria-hidden className="text-emerald-600 dark:text-emerald-400">✓</span>
        <div>
          {step.result}
          {step.link && (
            <p className="mt-1">
              <a href={step.link.href} className="font-medium text-emerald-700 underline underline-offset-4 dark:text-emerald-400">
                {step.link.label} →
              </a>
            </p>
          )}
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
            <span className="font-semibold">Didn&apos;t work?</span>
            <span className="text-zinc-500">· {step.fails.causes.length} likely causes</span>
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
  );

  const understand = (
    <div key="understand" className="grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-800">
      <div className="bg-zinc-50 px-4 py-3.5 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Technically, what happened</p>
        <p className="mt-1 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">{step.understand}</p>
      </div>
      <div className="bg-zinc-900 px-4 py-3.5 dark:bg-zinc-950">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">PM lens · why you should care</p>
        <p className="mt-1 text-[15px] leading-relaxed text-zinc-100">{step.pmLens}</p>
      </div>
    </div>
  );

  const labels = ["Why", "Do it", "See it work", "Understand"];
  const panes = [why, doIt, see, understand];
  if (check) {
    labels.push("Quiz");
    panes.push(<CheckUnderstanding key="quiz" questions={check} step={index + 1} />);
  }

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
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

      <div className="mt-4">
        <ArchitectureBar current={step.layers} built={built} />
      </div>

      <p className="mt-4 text-lg leading-snug font-medium text-balance">{step.problem}</p>

      <div className="mt-5">
        <Panes
          labels={labels}
          panes={panes}
          after={
            <a
              href={next ? `#step-${next.index + 1}` : "#done"}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {next ? `Next step: ${next.title} →` : "Finish: see what you built →"}
            </a>
          }
        />
      </div>
    </article>
  );
}

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "build", label: "Your app" },
  { id: "journey", label: "Journey" },
];
const PAGES = [
  { label: "Live demo", href: "/demo" },
  { label: "System map", href: "/architecture" },
];
// Steps 1–2 only show the shape of an AI app; building starts at step 3.
const FIRST_BUILD_STEP = 3;
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

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
  const eyebrow = "text-xs font-semibold uppercase tracking-widest";
  const navStages = j.phases.map((ph) => ({
    title: ph.title,
    steps: steps.slice(ph.steps[0] - 1, ph.steps[1]).map((st, k) => ({ n: ph.steps[0] + k, title: st.title })),
  }));
  const c = j.closing;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:grid lg:grid-cols-[15rem_minmax(0,48rem)] lg:justify-center lg:gap-12">
      <SectionNav brand="AI Tool Lab for PMs" sections={SECTIONS} stages={navStages} links={PAGES} />

    <main className="min-w-0 pt-6 pb-24 lg:pt-8">
      <noscript>
        <style>{".jp-hide{display:block!important}"}</style>
      </noscript>
      <p className={`${eyebrow} text-zinc-500 lg:hidden`}>
        AI Tool Lab for PMs
        {parsed?.ok && ` · building ${mvp.name}`}
      </p>

      {/* Overview: who it's for, what you'll learn, how it differs */}
      <section id="overview" className="scroll-mt-6 pt-6 lg:pt-2">
        <header>
          <p className={`${eyebrow} text-emerald-700 dark:text-emerald-400`}>{site.eyebrow}</p>
          <h1 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-[2.6rem]">{site.headline}</h1>
          <p className="mt-3 text-2xl leading-[1.3] font-semibold tracking-tight text-zinc-400 sm:text-3xl dark:text-zinc-500">
            Understand every layer:{" "}
            <span className="ticker text-emerald-700 dark:text-emerald-400">
              <span aria-hidden className="ticker-track">
                {[...site.layers, site.layers[0]].map((w, i) => (
                  <span key={i} className="ticker-word">
                    {w}
                  </span>
                ))}
              </span>
            </span>
            <span className="sr-only">{site.layers.join(", ")}</span>
          </p>
          <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">{site.promise}</p>
          <p className="mt-6 border-l-4 border-emerald-600 pl-4 text-lg font-semibold tracking-tight dark:border-emerald-400">
            {site.philosophy}
          </p>
        </header>

        {/* Different tools for different goals */}
        <div className="reveal mt-8 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="w-[26%] px-4 py-3" />
                <th className="w-[37%] px-4 py-3 align-bottom font-semibold">
                  {site.compare.builders.label}
                  <span className="block text-xs font-normal text-zinc-500">{site.compare.builders.examples}</span>
                </th>
                <th className="w-[37%] bg-zinc-900 px-4 py-3 align-bottom font-semibold text-emerald-400 dark:bg-zinc-800">
                  {site.compare.lab.label}
                </th>
              </tr>
            </thead>
            <tbody>
              {site.compare.rows.map((r) => (
                <tr key={r.label} className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-800">
                  <th scope="row" className="px-4 py-3 align-top text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                    {r.label}
                  </th>
                  <td className="px-4 py-3 align-top text-zinc-600 dark:text-zinc-400">{r.builders}</td>
                  <td className="bg-zinc-900 px-4 py-3 align-top text-zinc-100 dark:bg-zinc-800">{r.lab}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">What you&apos;ll actually understand</h2>
          <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {site.understand.map((u) => (
              <li key={u} className="reveal flex gap-2.5 text-[15px] leading-snug">
                <span aria-hidden className="text-emerald-600 dark:text-emerald-400">✓</span>
                {u}
              </li>
            ))}
          </ul>
          <p className="mt-5 font-medium">{site.outcomeLine}</p>
        </div>
      </section>

      {/* Your app: choose it and see what's underneath, in one place */}
      <section id="build" className="mt-12 scroll-mt-6 border-t border-zinc-200 pt-10 dark:border-zinc-800">
        <p className={`${eyebrow} text-zinc-500`}>Your app</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">Pick an app. See what&apos;s underneath it.</h2>

        <div className="mt-5">{chooser}</div>

        <div id="underneath" className="scroll-mt-6 pt-6">
        <div className="reveal grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] dark:border-zinc-800 dark:bg-zinc-800">
          <div className="bg-white p-4 dark:bg-zinc-950">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">What you see · {mvp.name}</p>
            <Chain items={[cap(mvp.input), "AI", cap(mvp.resultShownAs)]} />
          </div>
          <div className="bg-zinc-50 p-4 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">What&apos;s actually happening</p>
            <Chain items={site.underneath} dark />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            href={mvp.demoHref}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Try {mvp.name} →
          </a>
          <a href="#journey" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            Want to understand each layer? Start the journey ↓
          </a>
        </div>

        </div>
      </section>

      {/* Journey 1 */}
      <section id="journey" className="mt-12 scroll-mt-6 border-t border-zinc-200 pt-10 dark:border-zinc-800">
        <p className={`${eyebrow} text-zinc-500`}>Journey {j.number}</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{j.name}</h2>
        <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">{j.promise}</p>
        <p className="mt-3 text-xs text-zinc-500">{site.providerNote}</p>

        <div className="mt-8">
          <JourneyPlayer
            meta={steps.map((st, i) => ({ n: i + 1, title: st.title, stage: phaseOf(i).title }))}
            stages={j.phases.map((ph) => ({ title: ph.title, from: ph.steps[0], to: ph.steps[1] }))}
            cards={steps.map((s, i) => (
              <StepCard
                key={s.title}
                step={s}
                index={i}
                total={steps.length}
                phase={phaseOf(i).title}
                next={steps[i + 1] ? { index: i + 1, title: steps[i + 1].title } : undefined}
                personalised={s.personalised}
                check={checks01[i]}
                built={[...new Set(steps.slice(FIRST_BUILD_STEP - 1, i).flatMap((p) => p.layers))].filter((l) => !s.layers.includes(l))}
              />
            ))}
            finish={
              <section className="rounded-2xl border-2 border-zinc-900 bg-white p-6 sm:p-8 dark:border-zinc-200 dark:bg-zinc-950">
                <p className={`${eyebrow} text-emerald-700 dark:text-emerald-400`}>Journey {j.number} complete</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                  {parsed?.ok ? `You built ${mvp.name}. More importantly, you understand it.` : "You built an AI app. More importantly, you understand it."}
                </h2>
                <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">{c.intro}</p>
                <div className="mt-6">
                  <Panes
                    labels={["What you built", "The anatomy", "Reuse the pattern", "Questions", "What's next"]}
                    panes={[
                      <div key="built">
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {c.built.map((b) => (
              <li key={b.text} className="reveal flex gap-2.5 text-[15px] leading-snug">
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

                      </div>,
                      <div key="anatomy">
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

                      </div>,
                      <div key="pattern">
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
                      </div>,
                      <div key="questions">
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {c.questions.map((q, i) => (
              <li key={q.q} className="flex gap-2 text-sm leading-snug">
                <span className="w-5 shrink-0 font-mono text-xs text-zinc-400">{i + 1}</span>
                <span>
                  {q.q}{" "}
                  {q.step ? (
                    <a href={`#step-${q.step}`} className="font-mono text-xs whitespace-nowrap text-zinc-400 hover:text-emerald-700">
                      step {q.step}
                    </a>
                  ) : (
                    <span className="font-mono text-xs whitespace-nowrap text-zinc-400">see “Reuse the pattern”</span>
                  )}
                </span>
              </li>
            ))}
          </ol>

                      </div>,
                      <div key="next">
          <div className="grid gap-6 sm:grid-cols-2">
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
                        <div className="mt-6 rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Coming next</p>
                          <p className="mt-1 font-semibold">{j.next.title}</p>
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{j.next.teaser}</p>
                        </div>
                      </div>,
                    ]}
                    after={
                      <a href="/demo" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
                        Open the live demo →
                      </a>
                    }
                  />
                </div>
              </section>
            }
          />
        </div>
      </section>
    </main>
    </div>
  );
}
