// Home page: renders Journey 1.
// All wording comes from content/journey-01.ts. This file only decides layout.
// It is a server component: it runs on the server and sends plain HTML,
// so no JavaScript is needed in the browser to read the journey.
import { journey01, type Step } from "@/content/journey-01";

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:pt-0.5">
        {label}
      </p>
      <div className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
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

function StepCard({ step, index }: { step: Step; index: number }) {
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

export default function Home() {
  const j = journey01;
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        AI Tool Lab for PMs · Journey {j.number}
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {j.title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">{j.promise}</p>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold">By the end you&apos;ll have</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
          {j.outcome.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </div>

      <nav aria-label="Steps" className="mt-6 flex flex-wrap gap-2">
        {j.steps.map((s, i) => (
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
        {j.steps.map((s, i) => (
          <StepCard key={s.title} step={s} index={i} />
        ))}
      </ol>

      <section className="mt-10 rounded-lg border border-dashed border-zinc-300 p-5 dark:border-zinc-700">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Coming next</p>
        <h2 className="mt-2 text-lg font-semibold">{j.next.title}</h2>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{j.next.teaser}</p>
      </section>
    </main>
  );
}
