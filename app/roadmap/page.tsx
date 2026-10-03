// /roadmap — what you'll learn: the journeys, and an honest checklist of
// which AI topics the lab covers today, partly, or not yet.
// A server component with no state. Words live in content/roadmap.ts.
import type { Metadata } from "next";
import { journeys, orderNote, topics, type Status } from "@/content/roadmap";

export const metadata: Metadata = {
  title: "What you'll learn · BuildAI Lab",
  description: "What the lab teaches today, what it covers partly, and what comes next.",
};

const STATUS: Record<Status, { label: string; dot: string; pill: string }> = {
  covered: {
    label: "Covered",
    dot: "bg-emerald-600 dark:bg-emerald-400",
    pill: "border-emerald-600/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  partly: {
    label: "Partly",
    dot: "bg-amber-500",
    pill: "border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  },
  "not-yet": {
    label: "Not yet",
    dot: "border border-zinc-400 bg-transparent",
    pill: "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400",
  },
};

const JOURNEY: Record<(typeof journeys)[number]["status"], string> = {
  built: "Built",
  planned: "Planned next",
  upcoming: "Upcoming",
};

export default function RoadmapPage() {
  const count = (s: Status) => topics.filter((t) => t.status === s).length;

  return (
    <main className="mx-auto w-full max-w-[60rem] px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">BuildAI Lab · What you&apos;ll learn</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">What the lab teaches, and what it doesn&apos;t yet</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        One app, built further in each journey. Here&apos;s what&apos;s included today and what&apos;s coming, so you know what you&apos;ll
        leave with.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">The journeys</h2>
        <ol className="mt-4 grid gap-2">
          {journeys.map((j) => (
            <li
              key={j.n}
              className={`flex gap-4 rounded-lg border p-4 ${
                j.status === "built"
                  ? "border-zinc-900 bg-white dark:border-zinc-200 dark:bg-zinc-950"
                  : j.status === "planned"
                    ? "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
                    : "border-dashed border-zinc-300 dark:border-zinc-700"
              }`}
            >
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                  j.status === "built" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 text-zinc-500 dark:border-zinc-700"
                }`}
              >
                {j.n}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className={`font-semibold ${j.status === "upcoming" ? "text-zinc-600 dark:text-zinc-400" : ""}`}>{j.title}</span>
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{JOURNEY[j.status]}</span>
                </p>
                <p className="mt-0.5 text-sm leading-snug text-zinc-600 dark:text-zinc-400">{j.adds}</p>
                {j.status === "built" && (
                  <a href="/#journey" className="mt-1 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                    Start or continue Journey 1 →
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">{orderNote}</p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight">Topic by topic</h2>
        <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          {(["covered", "partly", "not-yet"] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-2">
              <i className={`inline-block size-2.5 rounded-full ${STATUS[s].dot}`} />
              {STATUS[s].label} · {count(s)}
            </span>
          ))}
        </p>

        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {topics.map((t) => (
            <li key={t.name} className="rounded-lg border border-zinc-200 bg-white p-4 text-sm leading-snug dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-[15px]">{t.name}</p>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS[t.status].pill}`}>{STATUS[t.status].label}</span>
              </div>
              {t.now.length > 0 && (
                <>
                  <p className="mt-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">In the lab now</p>
                  <ul className="mt-1.5 grid gap-1">
                    {t.now.map((n) => (
                      <li key={n.text} className="flex gap-2">
                        <span aria-hidden className="text-emerald-600 dark:text-emerald-400">✓</span>
                        <span>
                          {n.text}
                          {n.step && (
                            <>
                              {" "}
                              <a href={`/#step-${n.step}`} className="whitespace-nowrap text-emerald-700 hover:underline dark:text-emerald-400">
                                step {n.step}
                              </a>
                            </>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {t.notYet && (
                <>
                  <p className="mt-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">Not yet</p>
                  <p className="mt-1.5 text-zinc-600 dark:text-zinc-400">
                    {t.notYet}
                    {t.journey && <span className="font-medium text-zinc-800 dark:text-zinc-200"> Planned for Journey {t.journey}.</span>}
                  </p>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm text-zinc-500">
        <a href="/" className="underline underline-offset-4 hover:text-zinc-800 dark:hover:text-zinc-200">
          Back to Journey 1
        </a>
        {" · "}
        <a href="/demo" className="underline underline-offset-4 hover:text-zinc-800 dark:hover:text-zinc-200">
          Try the live demo
        </a>
        {" · "}
        <a href="/architecture" className="underline underline-offset-4 hover:text-zinc-800 dark:hover:text-zinc-200">
          System map
        </a>
        {" · "}
        <a href="/why#feedback" className="underline underline-offset-4 hover:text-zinc-800 dark:hover:text-zinc-200">
          Tell me what you&apos;d want next
        </a>
      </p>
    </main>
  );
}
