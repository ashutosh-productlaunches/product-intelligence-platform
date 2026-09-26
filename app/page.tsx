// Home page: the intake, then Journey 1.
// All wording comes from content/. This file only decides layout and which state to show.
// It is a server component: it runs on the server and sends plain HTML.
// The learner's choices live in the URL (?pattern=...&input=...), so no browser storage is needed.
import { journey01, stepsFor, type Step } from "@/content/journey-01";
import { getPattern } from "@/content/app-patterns";
import { buildMvp, parseIntake } from "@/lib/build-mvp";
import { IntakeForm, MvpCard, PatternMenu } from "@/components/intake";
import { patterns } from "@/content/app-patterns";
import type { Look } from "@/content/looks";

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

function StepCard({ step, index, personalised }: { step: Step; index: number; personalised: boolean }) {
  return (
    <li
      id={`step-${index + 1}`}
      className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-sm text-zinc-400">{index + 1}</span>
        <h2 className="text-lg font-semibold tracking-tight">{step.title}</h2>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          {step.concept}
        </span>
        {personalised && (
          <span className="rounded-full border border-emerald-600 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Your app
          </span>
        )}
      </div>

      <div className="grid gap-4">
        <Block label="The problem">{step.problem}</Block>
        <Block label="The idea">
          {step.idea}
          {step.diagram && <Pre>{step.diagram}</Pre>}
        </Block>
        <Block label="Do this">
          {step.action}
          {step.code && <Pre>{step.code}</Pre>}
          {step.choices && (
            <div className="mt-3 grid min-w-0 gap-2">
              {step.choices.map((c, i) => (
                <details key={c.name} open={i === 0} className="group min-w-0 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
                  <summary className="flex cursor-pointer list-none items-center gap-4 p-3">
                    <LookSwatch look={c.look} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-zinc-900 dark:text-zinc-100">{c.name}</span>
                      <span className="block text-sm text-zinc-600 dark:text-zinc-400">{c.mood}</span>
                    </span>
                    <span aria-hidden className="text-zinc-400 transition-transform group-open:rotate-90">›</span>
                  </summary>
                  <div className="border-t border-zinc-200 px-3 pb-3 dark:border-zinc-800">
                    <Pre>{c.code}</Pre>
                  </div>
                </details>
              ))}
            </div>
          )}
        </Block>
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
        <Block label="Why it matters">{step.why}</Block>
        {step.snag && (
          <div className="rounded-md border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
            <span className="font-semibold">Where people get stuck: </span>
            {step.snag}
          </div>
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          AI Tool Lab for PMs · Journey {j.number}
          {parsed?.ok && ` · building ${mvp.name}`}
        </p>
        <nav aria-label="Site" className="flex gap-1 text-sm">
          <a
            href="/demo"
            className="rounded-md px-3 py-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            Live demo
          </a>
          <a
            href="/architecture"
            className="rounded-md px-3 py-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            System map
          </a>
        </nav>
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {j.title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">{j.promise}</p>

      <a
        href={mvp.demoHref}
        className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-900 bg-zinc-900 px-5 py-4 text-white transition-colors hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        <span className="text-[15px] font-semibold">Try {mvp.name} →</span>
        <span className="text-sm opacity-75">A working app. Paste text, press Run, see a real answer.</span>
      </a>

      <div className="mt-6">{chooser}</div>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold">By the end you&apos;ll have</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
          {j.outcome.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </div>

      <nav aria-label="Steps" className="mt-6 flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <a
            key={s.title}
            href={`#step-${i + 1}`}
            className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:border-zinc-400 dark:border-zinc-800 dark:text-zinc-400"
          >
            {i + 1} · {s.concept}
          </a>
        ))}
      </nav>

      <ol className="mt-8 grid gap-5">
        {steps.map((s, i) => (
          <StepCard key={s.title} step={s} index={i} personalised={s.personalised} />
        ))}
      </ol>

      <section className="mt-10 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          You&apos;re done
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">
          {parsed?.ok ? `${mvp.name} is live. Here's what you have.` : "Here's what you have."}
        </h2>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">What you built</p>
            <ul className="mt-2 grid gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              {j.closing.have.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="text-emerald-600 dark:text-emerald-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">What it can&apos;t do yet</p>
            <ul className="mt-2 grid gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              {j.closing.notYet.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="text-zinc-400">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-sm font-semibold">Things to try before you stop</p>
        <ol className="mt-2 grid gap-3">
          {j.closing.tryNext.map((item, i) => (
            <li key={item.title} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="text-sm font-medium">
                <span className="mr-2 font-mono text-xs text-zinc-400">{i + 1}</span>
                {item.title}
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded-lg border border-dashed border-zinc-300 p-5 dark:border-zinc-700">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Coming next</p>
        <h2 className="mt-2 text-lg font-semibold">{j.next.title}</h2>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{j.next.teaser}</p>
      </section>
    </main>
  );
}
