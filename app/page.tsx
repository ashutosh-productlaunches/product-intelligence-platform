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
import { journeys } from "@/content/roadmap";
import { JourneyPlayer } from "@/components/journey-player";
import { Panes } from "@/components/panes";
import { Parts } from "@/components/parts";
import { Experiment, CopyHelp } from "@/components/lab";
import { experiments01, type Experiment as ExperimentData } from "@/content/experiments-01";
import { helpPrompt } from "@/lib/tutor-context";
import { bench, benchLabel, button } from "@/components/style";
import type { ReactNode } from "react";


const pad = (n: number) => String(n).padStart(2, "0");

// Two columns on wide screens: the reading column, and a margin for notes (the manual, A).
// The reading column keeps the same width whether or not there's a note, so the measure never jumps.
function Spread({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-14">
      <div className="min-w-0">{children}</div>
      <aside className="min-w-0">{note}</aside>
    </div>
  );
}

// A margin note: a short signal rule, a mono label, graphite text.
function Note({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t-2 border-signal pt-2 text-[16px] leading-relaxed text-graphite">
      <p className="font-mono text-xs text-signal">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

// A plain-text diagram, set as a numbered figure.
function Figure({ children, n, caption }: { children: string; n: number; caption: string }) {
  return (
    <figure className="mt-6">
      <pre className="overflow-x-auto border-y border-ink py-4 font-mono text-[13px] leading-relaxed">{children}</pre>
      <figcaption className="mt-2 text-[15px] text-graphite italic">
        <span className="font-mono text-xs not-italic">Fig. {n}</span> — {caption}
      </figcaption>
    </figure>
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
        <li key={i} className="flex items-center gap-1.5">
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

// Code the learner types or runs: dark, like the terminal or editor they'll paste it into.
function Code({ children }: { children: string }) {
  return <pre className="mt-3 overflow-x-auto bg-ink px-4 py-3 font-mono text-[13px] leading-relaxed text-paper">{children}</pre>;
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
    <Spread>
      <p className="text-2xl italic">Questions for review</p>
      <ol className="mt-6 grid gap-9">
        {questions.map((qn, qi) => (
          <li key={qn.q}>
            <p className="text-[18px] leading-snug font-medium">
              <span className="mr-2 font-mono text-xs font-normal text-graphite">
                {step}.{qi + 1}
              </span>
              {qn.q}
            </p>
            <div className="mt-3 border-t border-rule">
              {placed(qn.answers, step, qi).map((a, ai) => (
                <details key={a.text} className="border-b border-rule">
                  <summary className="flex cursor-pointer list-none gap-3 py-2.5 text-[16px] leading-snug hover:text-signal">
                    <span className="font-mono text-xs leading-6 text-graphite">{letters[ai]}</span>
                    <span>{a.text}</span>
                  </summary>
                  <p className={`mb-3 ml-6 border-l-2 pl-3 text-[16px] leading-relaxed ${a.correct ? "border-pass" : "border-fail"}`}>
                    <span className={`font-mono text-xs ${a.correct ? "text-pass" : "text-fail"}`}>{a.correct ? "Correct. " : "Not quite. "}</span>
                    {a.why}
                  </p>
                </details>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </Spread>
  );
}

// The app's architecture as a small schematic at the top of every step (the bench, B).
// Signal: what this step builds. Ink outline: what earlier steps built. Dashed: still to come.
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
      ? "border-signal bg-signal text-paper"
      : built.includes(id)
        ? "border-ink bg-paper text-ink"
        : "border-dashed border-graphite/60 text-graphite";
  const cell = (l: (typeof ARCH)[number]) => (
    <div className={`min-w-0 flex-1 border px-1.5 py-2 sm:px-2.5 ${box(l.id)}`}>
      <p className="truncate font-mono text-[11px] leading-tight font-medium sm:text-[12px]">
        <span className="sm:hidden">{l.short}</span>
        <span className="hidden sm:inline">{l.label}</span>
      </p>
      <p className="mt-0.5 hidden truncate text-[13px] leading-tight italic opacity-80 sm:block">{l.note}</p>
    </div>
  );
  const wire = <span aria-hidden className="self-center font-mono text-xs text-graphite">→</span>;
  const gap = <span aria-hidden className="w-px self-stretch bg-rule" />;
  const [computer, page, server, model, internet] = ARCH;
  return (
    <figure className={`${bench} px-3 py-3 sm:px-4`} aria-label={`This step works on: ${current.join(", ")}`}>
      <figcaption className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className={benchLabel}>Where this step works</span>
        <span className="flex gap-4 font-mono text-[11px] text-graphite">
          <span><span className="mr-1.5 inline-block h-2 w-2 bg-signal align-middle" />this step</span>
          <span><span className="mr-1.5 inline-block h-2 w-2 border border-ink align-middle" />built</span>
          <span className="hidden sm:inline"><span className="mr-1.5 inline-block h-2 w-2 border border-dashed border-graphite align-middle" />to come</span>
        </span>
      </figcaption>
      <div className="flex items-stretch gap-1 sm:gap-2">
        {cell(computer)}
        {gap}
        {cell(page)}
        {wire}
        {cell(server)}
        {wire}
        {cell(model)}
        {gap}
        {cell(internet)}
      </div>
    </figure>
  );
}

function StepCard({
  step,
  index,
  total,
  phase,
  part,
  next,
  personalised,
  check,
  experiment,
  help,
  built,
}: {
  step: Step;
  index: number;
  total: number;
  phase: string;
  part: number;
  next?: { index: number; title: string };
  personalised: boolean;
  check?: Question[];
  experiment?: ExperimentData;
  help: string;
  built: Layer[];
}) {
  const n = index + 1;
  const osLabel = "font-mono text-xs text-graphite";

  const why = (
    <Spread key="why">
      <div className="text-[19px] leading-[1.6]">{step.idea}</div>
      {step.diagram && <Figure n={n} caption={step.concept}>{step.diagram}</Figure>}
    </Spread>
  );

  const doIt = (
    <Spread
      key="do"
      note={
        step.inPractice && (
          <Note label="Decided earlier, applied here">
            <ul className="grid gap-3">
              {step.inPractice.map((d) => (
                <li key={d.q}>
                  <a href={`#step-${d.from}`} className="prose-link text-ink">
                    §{pad(d.from)} · {d.q}
                  </a>
                  <span className="mt-0.5 block">{d.here}</span>
                </li>
              ))}
            </ul>
          </Note>
        )
      }
    >
      <div className="text-[19px] leading-[1.6]">{step.action}</div>
      {step.install ? (
        <Parts
          step={n}
          labels={[...step.install.map((t) => t.name), ...(step.assistants ? ["AI assistant (optional)"] : []), "Check"]}
          parts={[
            ...step.install.map((t) => (
              <div key={t.name} className="border-t border-ink pt-4 text-[17px] leading-relaxed">
                <p className="text-2xl font-medium">{t.name}</p>
                <p className="text-graphite">{t.what}</p>
                <p className="mt-3">
                  <span className={osLabel}>Download from </span>
                  {t.from}
                </p>
                <div className="mt-5 grid gap-6 md:grid-cols-2">
                  {([["Windows", t.windows], ["Mac", t.mac]] as const).map(([os, list]) => (
                    <div key={os} className="min-w-0">
                      <p className={osLabel}>{os}</p>
                      <ol className="mt-1.5 grid list-decimal gap-1.5 pl-5 marker:font-mono marker:text-xs marker:text-graphite">
                        {list.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
                <p className={`${osLabel} mt-6`}>Or install from the command line</p>
                <Code>{`# Windows (winget is built in)\n${t.cli.windows}\n\n# Mac (needs Homebrew: brew.sh)\n${t.cli.mac}`}</Code>
                <p className="mt-4">
                  <span className={osLabel}>Updating later </span>
                  {t.update}
                </p>
              </div>
            )),
            ...(step.assistants
              ? [
                  <div key="assistants" className="border-t border-ink pt-4 text-[17px] leading-relaxed">
                    <p>{step.assistants.intro}</p>
                    <div className="mt-4 grid gap-x-8 md:grid-cols-2">
                      {step.assistants.tools.map((a) => (
                        <div key={a.name} className="min-w-0 border-t border-rule py-4">
                          <p className="text-xl font-medium">{a.name}</p>
                          <p className={osLabel}>{a.cost}</p>
                          {a.install && <Code>{`${a.install}\n\n# then start it\n${a.start}`}</Code>}
                          {a.steps && <p className="mt-2">{a.steps}</p>}
                          <p className="mt-2">{a.signIn}</p>
                          {a.note && <p className="mt-1 text-graphite">{a.note}</p>}
                        </div>
                      ))}
                    </div>
                  </div>,
                ]
              : []),
            <div key="check" className="border-t border-ink pt-4 text-[17px] leading-relaxed">
              {step.thenCheck && <p>{step.thenCheck}</p>}
              {step.code && <Code>{step.code}</Code>}
            </div>,
          ]}
        />
      ) : (
        <>
          {step.thenCheck && <p className="mt-5 text-[19px] leading-[1.6]">{step.thenCheck}</p>}
          {step.code && <Code>{step.code}</Code>}
        </>
      )}
      {step.choices && (
        <div className="mt-6 border-t border-rule">
          {step.choices.map((c, i) => (
            <details key={c.name} open={i === 0} className="group min-w-0 border-b border-rule">
              <summary className="flex cursor-pointer list-none items-center gap-4 py-3">
                <LookSwatch look={c.look} />
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-medium">{c.name}</span>
                  <span className="block text-[16px] text-graphite italic">{c.mood}</span>
                </span>
                <span aria-hidden className="font-mono text-xs text-graphite group-open:hidden">Show code</span>
                <span aria-hidden className="hidden font-mono text-xs text-graphite group-open:inline">Hide</span>
              </summary>
              <div className="pb-4">
                <Code>{c.code}</Code>
              </div>
            </details>
          ))}
        </div>
      )}
    </Spread>
  );

  const see = (
    <Spread key="see" note={step.snag && <Note label="Where people get stuck">{step.snag}</Note>}>
      <div className={`${bench} px-4 py-4 sm:px-6`}>
        <p className={`${benchLabel} text-pass`}>Expected result</p>
        <div className="mt-2 text-[18px] leading-relaxed">
          {step.result}
          {step.link && (
            <p className="mt-2">
              <a href={step.link.href} className="prose-link">
                {step.link.label}
              </a>
            </p>
          )}
        </div>
      </div>
      {step.fails && (
        <details className="group mt-6 border-y border-rule">
          <summary className="flex cursor-pointer list-none items-baseline gap-3 py-3">
            <span aria-hidden className="inline-block font-mono text-xs text-graphite transition-transform group-open:rotate-90">▸</span>
            <span className="text-[18px] font-medium">Didn&apos;t work?</span>
            <span className="font-mono text-xs text-graphite">{step.fails.causes.length} likely causes</span>
          </summary>
          <div className="pb-5 text-[17px] leading-relaxed">
            <ol className="grid list-decimal gap-1.5 pl-5 marker:font-mono marker:text-xs marker:text-graphite">
              {step.fails.causes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ol>
            <p className="mt-3">
              <span className="font-medium">Most likely fix: </span>
              {step.fails.fix}
            </p>
            <CopyHelp prompt={help} />
          </div>
        </details>
      )}
    </Spread>
  );

  const understand = (
    <div key="understand">
      <Spread>
        <p className="font-mono text-xs text-graphite">Technically, what happened</p>
        <p className="mt-2 text-[19px] leading-[1.6]">{step.understand}</p>
        <div className="mt-10 border-l-2 border-signal pl-5">
          <p className="font-mono text-xs text-signal">PM lens · why you should care</p>
          <p className="mt-2 text-[24px] leading-snug sm:text-[26px]">{step.pmLens}</p>
        </div>
      </Spread>
      {step.pmDetail && (
        <details className="group mt-10 border-y border-rule">
          <summary className="flex cursor-pointer list-none items-baseline gap-3 py-3">
            <span aria-hidden className="inline-block font-mono text-xs text-graphite transition-transform group-open:rotate-90">▸</span>
            <span className="text-[18px] font-medium">In depth: cost, speed and safety, and what you decide</span>
          </summary>
          <div className="pb-6">
            <div className="hidden grid-cols-[10rem_repeat(3,minmax(0,1fr))] gap-6 border-b border-ink pb-2 font-mono text-xs text-graphite md:grid">
              <span />
              <span>Cost</span>
              <span>Speed</span>
              <span>Safety</span>
            </div>
            {step.pmDetail.boxes.map((b) => (
              <div key={b.name} className="grid gap-2 border-b border-rule py-3 text-[16px] leading-snug md:grid-cols-[10rem_repeat(3,minmax(0,1fr))] md:gap-6">
                <p className="font-medium">{b.name}</p>
                {(["cost", "speed", "safety"] as const).map((k) => (
                  <p key={k}>
                    <span className="font-mono text-xs text-graphite md:hidden">{cap(k)} </span>
                    {b[k]}
                  </p>
                ))}
              </div>
            ))}
            <p className="mt-8 font-mono text-xs text-signal">Decisions you own</p>
            <ul className="mt-2 grid lg:w-[64%]">
              {step.pmDetail.decisions.map((d) => (
                <li key={d.q} className="border-t border-rule py-3 text-[16px] leading-snug">
                  <p className="text-[18px] font-medium">{d.q}</p>
                  <p className="mt-0.5 font-mono text-xs text-graphite">Trades {d.trades}</p>
                  <p className="mt-1">Start with: {d.start}</p>
                  {d.step && (
                    <a href={`#step-${d.step}`} className="prose-link mt-1 inline-block font-mono text-xs">
                      Applied in §{pad(d.step)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </div>
  );

  const labels = ["Why", "Do it", "See it work"];
  const panes = [why, doIt, see];
  if (experiment) {
    labels.push("Break it");
    panes.push(<Experiment key="break" x={experiment} personalised={personalised} />);
  }
  labels.push("Understand");
  panes.push(understand);
  if (check) {
    labels.push("Quiz");
    panes.push(<CheckUnderstanding key="quiz" questions={check} step={n} />);
  }

  return (
    <article>
      <header>
        <p className="font-mono text-xs text-graphite">
          §{pad(n)} of {total} · Part {part}, {phase}
        </p>
        <h3 className="mt-3 text-[2.5rem] leading-[1.05] font-medium tracking-tight text-balance sm:text-[3.25rem]">{step.title}</h3>
        <p className="mt-3 font-mono text-xs">
          <span className="text-graphite">Concept </span>
          {step.concept}
          {personalised && <span className="text-signal"> · uses your app</span>}
        </p>
      </header>

      <div className="mt-8">
        <ArchitectureBar current={step.layers} built={built} />
      </div>

      <div className="mt-8">
        <Spread>
          <p className="text-[24px] leading-snug text-balance sm:text-[28px]">{step.problem}</p>
        </Spread>
      </div>

      <div className="mt-10">
        <Panes
          section={n}
          labels={labels}
          panes={panes}
          after={
            <a href={next ? `#step-${next.index + 1}` : "#done"} className={button}>
              {next ? `Next: §${pad(next.index + 1)} ${next.title}` : "Finish: see what you built"}
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
  { label: "What you'll learn", href: "/roadmap" },
  { label: "Why I built this", href: "/why" },
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
    <div className="w-full">
      <SectionNav
        brand="BuildAI Lab"
        sections={SECTIONS}
        journey={{ n: j.number, title: j.name }}
        upcoming={journeys
          .filter((x) => x.status !== "built")
          .map((x) => ({ n: x.n, title: x.title, status: x.status === "planned" ? "Planned" : "Upcoming" }))}
        stages={navStages}
        links={PAGES}
      />

    <main className="mx-auto w-full max-w-[76rem] min-w-0 px-4 pt-10 pb-32 sm:px-6 lg:px-10">
      <noscript>
        <style>{".jp-hide{display:block!important}"}</style>
      </noscript>

      {/* Overview: who it's for, what you'll learn, how it differs */}
      <section id="overview" className="scroll-mt-16 pt-6 lg:pt-2">
        <header>
          <p className={`${eyebrow} text-emerald-700 dark:text-emerald-400`}>{site.eyebrow}</p>
          <h1 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-[2.6rem]">{site.headline}</h1>
          <p className="mt-3 text-2xl leading-[1.3] font-semibold tracking-tight text-zinc-400 sm:text-3xl dark:text-zinc-500">
            {site.tickerLead}{" "}
            <span className="ticker text-emerald-700 dark:text-emerald-400">
              <span aria-hidden className="ticker-track">
                {[...site.ticker, site.ticker[0]].map((w, i) => (
                  <span key={i} className="ticker-word">
                    {w}
                  </span>
                ))}
              </span>
            </span>
            <span className="sr-only">{site.ticker.join(", ")}</span>
          </p>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">{site.promise}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href="#build"
              className="rounded-lg bg-zinc-900 px-5 py-3 text-[15px] font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {site.cta.primary}
            </a>
            <a href={mvp.demoHref} className="text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100">
              {site.cta.secondary}
            </a>
          </div>
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
          <div className="mt-4 grid gap-x-6 gap-y-5 md:grid-cols-3">
            {site.understand.map((g) => (
              <div key={g.group} className="reveal">
                <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">{g.group}</p>
                <ul className="mt-2 grid gap-2.5">
                  {g.items.map((it) => (
                    <li key={it.term} className="flex gap-2.5 text-[15px] leading-snug">
                      <span aria-hidden className="text-emerald-600 dark:text-emerald-400">✓</span>
                      <span>
                        <span className="font-semibold">{it.term}</span>
                        <span className="text-zinc-600 dark:text-zinc-400">: {it.meaning}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 font-medium">{site.outcomeLine}</p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {site.stackLine} {site.notYet}{" "}
            <a href="/roadmap" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              See what&apos;s covered and what&apos;s next →
            </a>
          </p>
          <a
            href="#build"
            className="mt-5 inline-block rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Pick your app ↓
          </a>
        </div>
      </section>

      {/* Your app: choose it and see what's underneath, in one place */}
      <section id="build" className="mt-12 scroll-mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-800">
        <p className={`${eyebrow} text-zinc-500`}>Your app</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">Pick an app. See what&apos;s underneath it.</h2>

        <div className="mt-5">{chooser}</div>

        <div id="underneath" className="scroll-mt-16 pt-6">
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
      <section id="journey" className="mt-24 scroll-mt-16 border-t border-ink pt-10">
        <p className="font-mono text-xs text-graphite">Journey {j.number}</p>
        <h2 className="mt-2 text-[2.5rem] leading-[1.05] font-medium tracking-tight text-balance sm:text-[3.5rem]">{j.name}</h2>
        <div className="mt-5">
          <Spread note={<Note label="About the model">{site.providerNote}</Note>}>
            <p className="text-[21px] leading-relaxed">{j.promise}</p>
          </Spread>
        </div>

        <div className="mt-10 grid gap-8 border-t border-rule pt-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-14">
          <div>
            <p className="font-mono text-xs text-graphite">Before you start</p>
            <ul className="mt-2 grid gap-1.5 text-[17px] leading-snug">
              {site.before.need.map((need) => (
                <li key={need} className="flex gap-3">
                  <span aria-hidden className="font-mono text-xs leading-6 text-graphite">–</span>
                  {need}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-[17px] leading-relaxed">
            <p className="font-mono text-xs text-graphite">Time</p>
            <p className="mt-2">{site.before.time}</p>
            <p className="mt-2 text-graphite">
              From step 5, each step has a <span className="text-ink italic">Break it</span> experiment: predict, break one thing on
              purpose, see what happens.
            </p>
          </div>
        </div>

        <div className="mt-16">
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
                part={j.phases.indexOf(phaseOf(i)) + 1}
                next={steps[i + 1] ? { index: i + 1, title: steps[i + 1].title } : undefined}
                personalised={s.personalised}
                check={checks01[i]}
                experiment={experiments01[i]}
                help={helpPrompt({ steps, index: i, appName: mvp.name })}
                built={[...new Set(steps.slice(FIRST_BUILD_STEP - 1, i).flatMap((p) => p.layers))].filter((l) => !s.layers.includes(l))}
              />
            ))}
            finish={
              <section>
                <p className="font-mono text-xs text-signal">Journey {j.number} complete</p>
                <h2 className="mt-3 text-[2.5rem] leading-[1.05] font-medium tracking-tight text-balance sm:text-[3.25rem]">
                  {parsed?.ok ? `You built ${mvp.name}. More importantly, you understand it.` : "You built an AI app. More importantly, you understand it."}
                </h2>
                <div className="mt-6">
                  <Spread>
                    <p className="text-[21px] leading-relaxed">{c.intro}</p>
                  </Spread>
                </div>
                <div className="mt-10">
                  <Panes
                    labels={["What you built", "The anatomy", "Reuse the pattern", "Questions", "What's next"]}
                    panes={[
                      <ul key="built" className="grid gap-x-12 border-b border-rule sm:grid-cols-2">
                        {c.built.map((b) => (
                          <li key={b.text} className="flex items-baseline gap-4 border-t border-rule py-3 text-[17px] leading-snug">
                            <span className="flex-1">{b.text}</span>
                            <a href={`#step-${b.step}`} className="prose-link shrink-0 font-mono text-xs text-graphite">
                              §{pad(b.step)}
                            </a>
                          </li>
                        ))}
                      </ul>,
                      <div key="anatomy">
                        <figure className={`${bench} px-3 py-4 sm:px-5`}>
                          <figcaption className={`${benchLabel} mb-3`}>The anatomy of your app</figcaption>
                          <ol className="flex flex-wrap items-stretch gap-x-2 gap-y-3">
                            {c.flow.map((f, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="border border-ink bg-paper px-3 py-2">
                                  <span className="block font-mono text-[13px] font-medium">{f.label}</span>
                                  <span className="block text-[14px] text-graphite italic">{f.note}</span>
                                </span>
                                {i < c.flow.length - 1 && <span aria-hidden className="font-mono text-xs text-graphite">→</span>}
                              </li>
                            ))}
                          </ol>
                        </figure>
                        <div className="mt-6">
                          <Spread>
                            <p className="text-[19px] leading-[1.6]">
                              Around it sits the development lifecycle: <span className="italic">Git</span> records versions,{" "}
                              <span className="italic">GitHub</span> shares them, and <span className="italic">Vercel</span> turns a push into a
                              live URL.
                            </p>
                          </Spread>
                        </div>
                      </div>,
                      <div key="pattern">
                        <Spread>
                          <p className="text-[19px] leading-[1.6]">
                            Only the prompt and the schema change. Once you can see this anatomy, you can reason about almost any AI feature
                            an engineer describes to you.
                          </p>
                        </Spread>
                        <ol className="mt-6 flex flex-wrap items-center gap-2">
                          {c.pattern.stages.map((st, i) => (
                            <li key={st} className="flex items-center gap-2">
                              <span className="bg-ink px-2.5 py-1 font-mono text-[13px] text-paper">{st}</span>
                              {i < c.pattern.stages.length - 1 && <span aria-hidden className="font-mono text-xs text-graphite">→</span>}
                            </li>
                          ))}
                        </ol>
                        <div className="mt-8">
                          <div className="hidden grid-cols-[minmax(0,4fr)_minmax(0,4fr)_minmax(0,5fr)] gap-6 border-b border-ink pb-2 font-mono text-xs text-graphite md:grid">
                            <span>What you could build next</span>
                            <span>Input</span>
                            <span>Output shape (your schema)</span>
                          </div>
                          {c.pattern.examples.map((e) => (
                            <div
                              key={e.name}
                              className="grid gap-1 border-b border-rule py-3 text-[16px] leading-snug md:grid-cols-[minmax(0,4fr)_minmax(0,4fr)_minmax(0,5fr)] md:gap-6"
                            >
                              <p className="font-medium">
                                {e.name}
                                {e.note && <span className="mt-1 block text-[14px] font-normal text-signal italic">{e.note}</span>}
                              </p>
                              <p className="text-graphite">{e.input}</p>
                              <p className="font-mono text-xs leading-relaxed">{e.output}</p>
                            </div>
                          ))}
                        </div>
                        <a href="/architecture" className="prose-link mt-5 inline-block text-[17px]">
                          Explore every layer on the system map
                        </a>
                      </div>,
                      <ol key="questions" className="grid gap-x-12 border-b border-rule sm:grid-cols-2">
                        {c.questions.map((q, i) => (
                          <li key={q.q} className="flex gap-3 border-t border-rule py-3 text-[17px] leading-snug">
                            <span className="w-5 shrink-0 font-mono text-xs leading-6 text-graphite">{i + 1}</span>
                            <span className="flex-1">{q.q}</span>
                            {q.step ? (
                              <a href={`#step-${q.step}`} className="prose-link shrink-0 font-mono text-xs leading-6 text-graphite">
                                §{pad(q.step)}
                              </a>
                            ) : (
                              <span className="shrink-0 font-mono text-xs leading-6 text-graphite">Reuse the pattern</span>
                            )}
                          </li>
                        ))}
                      </ol>,
                      <div key="next">
                        <div className="grid gap-10 sm:grid-cols-2">
                          <div>
                            <p className="font-mono text-xs text-graphite">What it can&apos;t do yet</p>
                            <ul className="mt-2 grid gap-2 text-[17px] leading-snug">
                              {c.notYet.map((item) => (
                                <li key={item} className="flex gap-3">
                                  <span aria-hidden className="font-mono text-xs leading-6 text-graphite">–</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-mono text-xs text-graphite">Things to try before you stop</p>
                            <ol className="mt-2 grid gap-4">
                              {c.tryNext.map((item, i) => (
                                <li key={item.title} className="text-[17px] leading-snug">
                                  <p className="font-medium">
                                    <span className="mr-2 font-mono text-xs font-normal text-graphite">{i + 1}</span>
                                    {item.title}
                                  </p>
                                  <p className="mt-0.5 text-graphite">{item.text}</p>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                        <div className="mt-10 lg:w-[64%]">
                          <Note label="Coming next">
                            <p className="text-[19px] font-medium text-ink">{j.next.title}</p>
                            <p className="mt-1">{j.next.teaser}</p>
                            <a href="/why#feedback" className="prose-link mt-2 inline-block text-ink">
                              Tell me what you&apos;d want next
                            </a>
                          </Note>
                        </div>
                      </div>,
                    ]}
                    after={
                      <a href="/demo" className={button}>
                        Open the live demo
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
