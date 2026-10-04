// Home page: what the lab is, pick your app, then the journeys.
// All wording comes from content/. This file only decides layout and which state to show.
// It is a server component: it runs on the server and sends plain HTML.
// The learner's choices live in the URL (?pattern=...&input=...), so no browser storage is needed.
// Each journey has its own pages (/journeys/1, /journeys/1/6); see app/journeys/.
import { site } from "@/content/site";
import { getPattern, patterns } from "@/content/app-patterns";
import { builtJourneys } from "@/content/journeys";
import { journeys as roadmap } from "@/content/roadmap";
import { buildMvp, parseIntake } from "@/lib/build-mvp";
import { journeyContext, one, type SearchParams } from "@/lib/journey-context";
import { contentsFor, PAGES } from "@/lib/contents";
import { IntakeForm, MvpCard, PatternMenu } from "@/components/intake";
import { SiteBar } from "@/components/site-bar";
import { LegacyStepRedirect, StartOrResume } from "@/components/progress";
import { button } from "@/components/style";
import { Lozenge, Row } from "@/components/scroll-page";

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

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  // A live app is always on screen. Without any choices, it runs the first
  // pattern's example, so a visitor can press Run within seconds of arriving.
  const pattern = getPattern(one(params.pattern)) ?? patterns[0];
  const answered = one(params.input) !== undefined && one(params.edit) === undefined;
  const parsed = answered ? parseIntake(params) : null;
  const intake = parsed?.ok ? parsed.intake : { pattern: pattern.id, ...pattern.example };
  const mvp = buildMvp(intake);

  const values = { input: one(params.input), audience: one(params.audience), detail: one(params.detail) };
  const changeHref = `/?${new URLSearchParams({ pattern: pattern.id, ...values, edit: "1" } as Record<string, string>).toString()}#build`;

  let chooser;
  if (parsed?.ok) chooser = <MvpCard mvp={mvp} changeHref={changeHref} />;
  else if (one(params.pattern) && (one(params.edit) !== undefined || one(params.input) !== undefined || one(params.make) !== undefined))
    chooser = <IntakeForm pattern={pattern} values={values} error={parsed && !parsed.ok ? parsed.message : undefined} />;
  else chooser = <PatternMenu activeId={pattern.id} />;

  // Journey links carry the learner's answers, so every step uses their app.
  const contexts = builtJourneys.map((bj) => ({ bj, ctx: journeyContext(bj, answered ? params : {}) }));
  const q = contexts[0]?.ctx.q ?? "";
  // Every place in Journey 1, for the Start / Continue buttons: steps 1..12, then the finish.
  const placesFor = ({ ctx }: (typeof contexts)[number]) => [
    ...ctx.steps.map((s, i) => ({ title: s.title, href: ctx.stepHref(i + 1) })),
    { title: "Finish", href: ctx.stepHref("done") },
  ];
  const first = contexts[0];
  const builtNumbers = new Set(builtJourneys.map((b) => b.journey.number));
  const eyebrow = "text-xs font-semibold uppercase tracking-widest";

  return (
    <div className="w-full">
      <SiteBar where={parsed?.ok ? `Building ${mvp.name}` : undefined} journeys={contentsFor(q)} links={PAGES} />
      <LegacyStepRedirect total={builtJourneys[0].journey.steps.length} />

    <main className="mx-auto w-full max-w-[76rem] min-w-0 px-4 pt-10 pb-32 sm:px-6 lg:px-10">
      {/* Overview: who it's for, what you'll learn, how it differs */}
      <section id="overview" className="scroll-mt-20 pt-6 lg:pt-2">
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
            {/* Straight into step 1, or back to where they left off. */}
            <StartOrResume journey={first.bj.journey.number} places={placesFor(first)} className={button} startLabel="Start Journey 1: step 1" />
            <a href="#build" className="text-[15px] font-medium text-signal hover:underline">
              Or pick your own app first
            </a>
            <a href={mvp.demoHref} className="text-[15px] font-medium text-graphite hover:text-ink hover:underline">
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
      <section id="build" className="mt-12 scroll-mt-20 border-t border-zinc-200 pt-10 dark:border-zinc-800">
        <p className={`${eyebrow} text-zinc-500`}>Your app</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">Pick an app. See what&apos;s underneath it.</h2>

        <div className="mt-5">{chooser}</div>

        <div id="underneath" className="scroll-mt-20 pt-6">
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
          <StartOrResume
            journey={first.bj.journey.number}
            places={placesFor(first)}
            className="text-[15px] font-semibold text-signal hover:underline"
            startLabel={`Build ${mvp.name} yourself: start step 1 →`}
          />
        </div>

        </div>
      </section>

      {/* Journeys: every one the lab has, built or coming */}
      <section id="journeys" className="mt-24 scroll-mt-20 border-t border-rule pt-12">
        <p className="font-label text-[12px] font-bold tracking-[0.08em] text-graphite uppercase">Journeys</p>
        <h2 className="mt-2 text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.02em] text-balance sm:text-[2.75rem]">
          One app, built further in each journey
        </h2>
        <p className="mt-4 max-w-[44rem] text-[18px] leading-relaxed text-graphite">{site.providerNote}</p>

        <div className="mt-8 grid gap-3 lg:max-w-[52rem]">
          {contexts.map(({ bj, ctx }) => {
            const j = bj.journey;
            return (
              <div key={j.number} className="grid gap-3">
                <Row
                  n={j.number}
                  href={ctx.overviewHref}
                  title={j.name}
                  tag={<Lozenge tone="green">Ready</Lozenge>}
                  pairs={[
                    ["You build", j.promise],
                    ["Route", `${j.steps.length} steps in ${j.phases.length} parts: ${j.phases.map((p) => p.title).join(", ")}`],
                  ]}
                />
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1">
                  <StartOrResume journey={j.number} places={placesFor({ bj, ctx })} className={button} />
                  <a href={ctx.overviewHref} className="text-[15px] font-medium text-signal hover:underline">
                    See all {j.steps.length} steps
                  </a>
                </div>
              </div>
            );
          })}
          {roadmap
            .filter((r) => !builtNumbers.has(r.n))
            .map((r) => (
              <Row key={r.n} n={r.n} dim title={r.title} tag={<Lozenge>{r.status === "planned" ? "Planned next" : "Upcoming"}</Lozenge>} pairs={[["Adds", r.adds]]} />
            ))}
        </div>
        <a href="/roadmap" className="prose-link mt-5 inline-block text-[17px]">
          What the lab covers today, and what it doesn&apos;t yet
        </a>
      </section>
    </main>
    </div>
  );
}
