// /journeys/1/6 — one step of a journey, as one scrolling page.
// Sections in order (Why, Do it, See it work, Break it, Understand, Check yourself), each
// numbered in the margin; a side panel shows progress, the sections and the way forward.
// /journeys/1/done — the page after the last step.
// Wording comes from content/; this file decides layout. Server component.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { finishSections, getJourney, stepSections, type BuiltJourney } from "@/content/journeys";
import { journeyContext, type SearchParams } from "@/lib/journey-context";
import { contentsFor, PAGES } from "@/lib/contents";
import { helpPrompt } from "@/lib/tutor-context";
import { site } from "@/content/site";
import { SiteBar } from "@/components/site-bar";
import { RememberPlace } from "@/components/progress";
import { Hero, JourneyFrame, Lozenge, Numbered, Row } from "@/components/scroll-page";
import { JourneySidebar } from "@/components/journey-sidebar";
import { ArchitectureBar, CheckUnderstanding, Code, Figure, LookSwatch, Note, PmLens } from "@/components/step-parts";
import { Experiment, CopyHelp } from "@/components/lab";
import { bench, benchLabel, button } from "@/components/style";

type Props = { params: Promise<{ journey: string; step: string }>; searchParams: Promise<SearchParams> };

const pad = (n: number) => String(n).padStart(2, "0");
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const prose = "text-[18px] leading-[1.65]";

function resolve(bj: BuiltJourney | undefined, step: string) {
  if (!bj) return null;
  const total = bj.journey.steps.length;
  if (step === "done") return { bj, n: total + 1, total };
  const n = Number(step);
  return Number.isInteger(n) && n >= 1 && n <= total ? { bj, n, total } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { journey, step } = await params;
  const r = resolve(getJourney(journey), step);
  if (!r) return {};
  const j = r.bj.journey;
  const title = r.n > r.total ? "Journey complete" : `${r.n}. ${j.steps[r.n - 1].title}`;
  return { title: `${title} · Journey ${j.number} · BuildAI Lab` };
}

export default async function StepPage({ params, searchParams }: Props) {
  const { journey, step } = await params;
  const r = resolve(getJourney(journey), step);
  if (!r) notFound();
  const { bj, n, total } = r;
  const j = bj.journey;
  const ctx = journeyContext(bj, await searchParams);

  const bar = (
    <SiteBar
      where={n > total ? `Journey ${j.number} · complete` : `Journey ${j.number} · Step ${n} of ${total} · ${ctx.steps[n - 1].title}`}
      journeys={contentsFor(ctx.q)}
      links={PAGES}
      current={{ journey: j.number, step: n }}
      wide
    />
  );

  return (
    <div className="w-full">
      {bar}
      <RememberPlace journey={j.number} step={n} />
      {n > total ? <Finish bj={bj} ctx={ctx} /> : <Step bj={bj} n={n} total={total} ctx={ctx} />}
    </div>
  );
}

type Ctx = ReturnType<typeof journeyContext>;

// The always-visible left sidebar: every part and step of this journey, this page's sections, and Next.
function sidebar(bj: BuiltJourney, ctx: Ctx, current: number, sections: { id: string; label: string }[], next: { href: string; label: string }) {
  const j = bj.journey;
  const parts = contentsFor(ctx.q).find((x) => x.n === j.number)!.parts!;
  return (
    <JourneySidebar
      journey={{ n: j.number, title: j.name, href: ctx.overviewHref }}
      parts={parts}
      current={current}
      sections={sections}
      finish={{ href: ctx.stepHref("done"), label: "Finish: what you built" }}
      next={next}
    />
  );
}

// The page body beside the sidebar: a readable column.
const column = "mx-auto w-full max-w-[56rem] px-4 pt-12 pb-24 sm:px-6 lg:px-12 lg:pt-14";

function Step({ bj, n, total, ctx }: { bj: BuiltJourney; n: number; total: number; ctx: Ctx }) {
  const j = bj.journey;
  const { steps, stepHref } = ctx;
  const s = steps[n - 1];
  const i = n - 1;
  const phase = ctx.phaseOf(i);
  const part = j.phases.indexOf(phase) + 1;
  const experiment = bj.experiments[i];
  const check = bj.checks[i];
  const built = [...new Set(steps.slice(bj.firstBuildStep - 1, i).flatMap((p) => p.layers))].filter((l) => !s.layers.includes(l));
  const next = n < total ? { href: stepHref(n + 1), label: `Next: ${n + 1}. ${steps[n].title}` } : { href: stepHref("done"), label: "Finish: see what you built" };
  const back = n > 1 ? { href: stepHref(n - 1), label: `${n - 1}. ${steps[n - 2].title}` } : { href: ctx.overviewHref, label: "Journey overview" };

  const sections: { id: string; label: string; heading: string; body: React.ReactNode }[] = [];

  sections.push({
    id: "why",
    ...stepSections.why,
    body: (
      <>
        <div className={prose}>{s.idea}</div>
        {s.diagram && <Figure n={n} caption={s.concept}>{s.diagram}</Figure>}
      </>
    ),
  });

  sections.push({
    id: "do",
    ...stepSections.do,
    body: (
      <>
        <div className={prose}>{s.action}</div>
        {s.install && (
          <ol className="mt-8 grid gap-10">
            {s.install.map((t, k) => (
              <li key={t.name} className="grid gap-3 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-5">
                <span className="text-[22px] leading-tight font-semibold text-signal tabular-nums">{n}.{k + 1}</span>
                <div className="min-w-0 text-[17px] leading-relaxed">
                  <p className="text-[22px] font-semibold">{t.name}</p>
                  <p className="text-graphite">{t.what}</p>
                  <p className="mt-3">
                    <span className="font-label text-[13px] font-semibold text-graphite">Download from </span>
                    {t.from}
                  </p>
                  <div className="mt-5 grid gap-6 md:grid-cols-2">
                    {([["Windows", t.windows], ["Mac", t.mac]] as const).map(([os, list]) => (
                      <div key={os} className="min-w-0">
                        <p className="font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">{os}</p>
                        <ol className="mt-1.5 grid list-decimal gap-1.5 pl-5 marker:text-[13px] marker:text-graphite">
                          {list.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">Or install from the command line</p>
                  <Code>{`# Windows (winget is built in)\n${t.cli.windows}\n\n# Mac (needs Homebrew: brew.sh)\n${t.cli.mac}`}</Code>
                  <p className="mt-4">
                    <span className="font-label text-[13px] font-semibold text-graphite">Updating later </span>
                    {t.update}
                  </p>
                </div>
              </li>
            ))}
            {s.assistants && (
              <li className="grid gap-3 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-5">
                <span className="text-[22px] leading-tight font-semibold text-signal tabular-nums">{n}.{s.install.length + 1}</span>
                <div className="min-w-0 text-[17px] leading-relaxed">
                  <p className="text-[22px] font-semibold">AI assistant <span className="font-normal text-graphite">(optional)</span></p>
                  <p className="mt-1">{s.assistants.intro}</p>
                  <div className="mt-4 grid gap-x-8 md:grid-cols-2">
                    {s.assistants.tools.map((a) => (
                      <div key={a.name} className="min-w-0 border-t border-rule py-4">
                        <p className="text-[19px] font-semibold">{a.name}</p>
                        <p className="font-label text-[13px] text-graphite">{a.cost}</p>
                        {a.install && <Code>{`${a.install}\n\n# then start it\n${a.start}`}</Code>}
                        {a.steps && <p className="mt-2">{a.steps}</p>}
                        <p className="mt-2">{a.signIn}</p>
                        {a.note && <p className="mt-1 text-graphite">{a.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            )}
          </ol>
        )}
        {s.thenCheck && <p className={`mt-8 ${prose}`}>{s.thenCheck}</p>}
        {s.code && <Code>{s.code}</Code>}
        {s.choices && (
          <div className="mt-6 border-t border-rule">
            {s.choices.map((c) => (
              <div key={c.name} className="min-w-0 border-b border-rule pb-5">
                <div className="flex items-center gap-4 py-3">
                  <LookSwatch look={c.look} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xl font-semibold">{c.name}</span>
                    <span className="block text-[16px] text-graphite">{c.mood}</span>
                  </span>
                </div>
                <Code>{c.code}</Code>
              </div>
            ))}
          </div>
        )}
        {s.inPractice && (
          <div className="mt-8">
            <Note label="Decided earlier, applied here">
              <ul className="grid gap-3">
                {s.inPractice.map((d) => (
                  <li key={d.q}>
                    <a href={stepHref(d.from)} className="prose-link">
                      Step {d.from} · {d.q}
                    </a>
                    <span className="mt-0.5 block">{d.here}</span>
                  </li>
                ))}
              </ul>
            </Note>
          </div>
        )}
      </>
    ),
  });

  sections.push({
    id: "see",
    ...stepSections.see,
    body: (
      <>
        <div className={`${bench} px-4 py-4 sm:px-6`}>
          <p className={`${benchLabel} text-pass`}>Expected result</p>
          <div className="mt-2 text-[18px] leading-relaxed">
            {s.result}
            {s.link && (
              <p className="mt-2">
                <a href={s.link.href} className="prose-link">
                  {s.link.label}
                </a>
              </p>
            )}
          </div>
        </div>
        {s.snag && (
          <div className="mt-6">
            <Note label="Where people get stuck">{s.snag}</Note>
          </div>
        )}
        {s.fails && (
          <div className="mt-8 border-t border-rule pt-6">
            <h3 className="flex items-baseline gap-3">
              <span className="text-[20px] font-semibold">Didn&apos;t work?</span>
              <span className="font-label text-[13px] text-graphite">{s.fails.causes.length} likely causes</span>
            </h3>
            <div className="mt-3 text-[17px] leading-relaxed">
              <ol className="grid list-decimal gap-1.5 pl-5 marker:text-[13px] marker:text-graphite">
                {s.fails.causes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ol>
              <p className="mt-3">
                <span className="font-semibold">Most likely fix: </span>
                {s.fails.fix}
              </p>
              <CopyHelp prompt={helpPrompt({ steps, index: i, appName: ctx.mvp.name })} />
            </div>
          </div>
        )}
      </>
    ),
  });

  if (experiment)
    sections.push({ id: "break", ...stepSections.break, body: <Experiment x={experiment} personalised={s.personalised} /> });

  sections.push({
    id: "understand",
    ...stepSections.understand,
    body: (
      <>
        <p className="font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">Technically</p>
        <p className={`mt-2 ${prose}`}>{s.understand}</p>
        <div className="mt-10">
          <PmLens>{s.pmLens}</PmLens>
        </div>
        {s.pmDetail && (
          <div className="mt-12 border-t border-rule pt-6">
            <h3 className="text-[20px] font-semibold">In depth: cost, speed and safety, and what you decide</h3>
            <div className="mt-4">
              <div className="grid gap-3">
                {s.pmDetail.boxes.map((b) => (
                  <Row key={b.name} title={b.name} pairs={(["cost", "speed", "safety"] as const).map((k) => [cap(k), b[k]])} />
                ))}
              </div>
              <p className="mt-8 font-label text-[11px] font-bold tracking-[0.08em] text-signal uppercase">Decisions you own</p>
              <ul className="mt-2 grid">
                {s.pmDetail.decisions.map((d) => (
                  <li key={d.q} className="border-t border-rule py-3 text-[16px] leading-snug">
                    <p className="text-[18px] font-semibold">{d.q}</p>
                    <p className="mt-0.5 font-label text-[13px] text-graphite">Trades {d.trades}</p>
                    <p className="mt-1">Start with: {d.start}</p>
                    {d.step && (
                      <a href={stepHref(d.step)} className="prose-link mt-1 inline-block text-[14px]">
                        Applied in step {d.step}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </>
    ),
  });

  if (check) sections.push({ id: "quiz", ...stepSections.quiz, body: <CheckUnderstanding questions={check} step={n} /> });

  return (
    <JourneyFrame sidebar={sidebar(bj, ctx, n, sections.map(({ id, label }) => ({ id, label })), next)}>
      <Hero
        crumbs={[
          { label: `Journey ${j.number}`, href: ctx.overviewHref },
          { label: `Part ${part} · ${phase.title}` },
        ]}
        eyebrow={
          <>
            Step {n} of {total} · {s.concept}
          </>
        }
        title={s.title}
        lede={s.problem}
      >
        {s.personalised && (
          <p className="mt-5 inline-block rounded-[3px] bg-white/10 px-3 py-1.5 text-[14px] font-medium">Uses your app: {ctx.mvp.name}</p>
        )}
      </Hero>

      <div className={column}>
        <div className="mb-12">
          <ArchitectureBar current={s.layers} built={built} />
        </div>
        {sections.map((sec, k) => (
          <Numbered key={sec.id} n={k + 1} id={sec.id} eyebrow={sec.label} heading={sec.heading}>
            {sec.body}
          </Numbered>
        ))}

        {/* The way forward at the end of the page. */}
        <div className="mt-4 rounded-[3px] bg-paper-2 p-5">
          <p className="font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">Up next</p>
          <a href={next.href} className={`${button} mt-3`}>
            {next.label}
          </a>
          <a href={back.href} className="mt-3 block text-[14px] font-medium text-graphite hover:text-ink">
            ← {back.label}
          </a>
        </div>
      </div>
    </JourneyFrame>
  );
}

function Finish({ bj, ctx }: { bj: BuiltJourney; ctx: Ctx }) {
  const j = bj.journey;
  const c = j.closing;
  const total = j.steps.length;
  const { stepHref } = ctx;
  const ids = Object.keys(finishSections) as (keyof typeof finishSections)[];

  const body: Record<keyof typeof finishSections, React.ReactNode> = {
    built: (
      <ul className="grid gap-x-10 border-b border-rule sm:grid-cols-2">
        {c.built.map((b) => (
          <li key={b.text} className="flex items-baseline gap-4 border-t border-rule py-3 text-[17px] leading-snug">
            <span className="flex-1">{b.text}</span>
            <a href={stepHref(b.step)} className="prose-link shrink-0 text-[13px]">
              Step {b.step}
            </a>
          </li>
        ))}
      </ul>
    ),
    anatomy: (
      <>
        <figure className={`${bench} px-3 py-4 sm:px-5`}>
          <figcaption className={`${benchLabel} mb-3`}>The anatomy of your app</figcaption>
          <ol className="flex flex-wrap items-stretch gap-x-2 gap-y-3">
            {c.flow.map((f, k) => (
              <li key={k} className="flex items-center gap-2">
                <span className="rounded-[3px] border border-rule bg-paper px-3 py-2">
                  <span className="block text-[14px] font-semibold">{f.label}</span>
                  <span className="block text-[13px] text-graphite">{f.note}</span>
                </span>
                {k < c.flow.length - 1 && <span aria-hidden className="text-[13px] text-graphite">→</span>}
              </li>
            ))}
          </ol>
        </figure>
        <p className={`mt-6 ${prose}`}>
          Around it sits the development lifecycle: <span className="font-semibold">Git</span> records versions,{" "}
          <span className="font-semibold">GitHub</span> shares them, and <span className="font-semibold">Vercel</span> turns a push into a live URL.
        </p>
      </>
    ),
    pattern: (
      <>
        <p className={prose}>
          Only the prompt and the schema change. Once you can see this anatomy, you can reason about almost any AI feature an engineer describes to you.
        </p>
        <ol className="mt-6 flex flex-wrap items-center gap-2">
          {c.pattern.stages.map((st, k) => (
            <li key={st} className="flex items-center gap-2">
              <span className="rounded-[3px] bg-signal-soft px-2.5 py-1 text-[14px] font-semibold">{st}</span>
              {k < c.pattern.stages.length - 1 && <span aria-hidden className="text-[13px] text-graphite">→</span>}
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-3">
          {c.pattern.examples.map((e) => (
            <Row
              key={e.name}
              title={e.name}
              tag={e.note && <Lozenge>{e.note}</Lozenge>}
              pairs={[
                ["Input", e.input],
                ["Output", <code key="o" className="font-mono text-[13px]">{e.output}</code>],
              ]}
            />
          ))}
        </div>
        <a href="/architecture" className="prose-link mt-5 inline-block text-[17px]">
          Explore every layer on the system map
        </a>
      </>
    ),
    questions: (
      <ol className="grid border-b border-rule">
        {c.questions.map((q, k) => (
          <li key={q.q} className="flex gap-3 border-t border-rule py-3 text-[17px] leading-snug">
            <span className="w-6 shrink-0 font-label text-[13px] leading-6 text-graphite tabular-nums">{pad(k + 1)}</span>
            <span className="flex-1">{q.q}</span>
            {q.step ? (
              <a href={stepHref(q.step)} className="prose-link shrink-0 text-[13px] leading-6">
                Step {q.step}
              </a>
            ) : (
              <a href="#pattern" className="prose-link shrink-0 text-[13px] leading-6">
                Reuse the pattern
              </a>
            )}
          </li>
        ))}
      </ol>
    ),
    next: (
      <>
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <p className="font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">What it can&apos;t do yet</p>
            <ul className="mt-2 grid gap-2 text-[17px] leading-snug">
              {c.notYet.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="text-graphite">–</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">Things to try before you stop</p>
            <ol className="mt-2 grid gap-4">
              {c.tryNext.map((item, k) => (
                <li key={item.title} className="text-[17px] leading-snug">
                  <p className="font-semibold">
                    <span className="mr-2 font-label text-[13px] font-normal text-graphite">{k + 1}</span>
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-graphite">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="mt-10">
          <Note label="Coming next">
            <p className="text-[19px] font-semibold">{j.next.title}</p>
            <p className="mt-1">{j.next.teaser}</p>
            <a href="/why#feedback" className="prose-link mt-2 inline-block">
              Tell me what you&apos;d want next
            </a>
          </Note>
        </div>
      </>
    ),
  };

  const next = { href: "/demo", label: "Open the live demo" };
  const back = { href: stepHref(total), label: `${total}. ${ctx.steps[total - 1].title}` };

  return (
    <JourneyFrame sidebar={sidebar(bj, ctx, total + 1, ids.map((id) => ({ id, label: finishSections[id].label })), next)}>
      <Hero
        crumbs={[{ label: `Journey ${j.number}`, href: ctx.overviewHref }, { label: "Complete" }]}
        eyebrow={`Journey ${j.number} complete`}
        title={ctx.personal ? `You built ${ctx.mvp.name}. More importantly, you understand it.` : "You built an AI app. More importantly, you understand it."}
        lede={c.intro}
      />
      <div className={column}>
        {ids.map((id, k) => (
          <Numbered key={id} n={k + 1} id={id} eyebrow={finishSections[id].label} heading={finishSections[id].heading}>
            {body[id]}
          </Numbered>
        ))}
        <div className="mt-4 rounded-[3px] bg-paper-2 p-5">
          <a href={next.href} className={button}>
            {next.label}
          </a>
          <a href={back.href} className="mt-3 block text-[14px] font-medium text-graphite hover:text-ink">
            ← {back.label}
          </a>
        </div>
        <p className="mt-10 text-[15px] text-graphite">{site.providerNote}</p>
      </div>
    </JourneyFrame>
  );
}
