// /journeys/1 — a journey at a glance: what you'll leave with, every step grouped by
// part, what you need before you start, and where the lab goes next.
// Wording comes from content/; this file decides layout. Server component.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJourney } from "@/content/journeys";
import { journeys as roadmap } from "@/content/roadmap";
import { site } from "@/content/site";
import { journeyContext, type SearchParams } from "@/lib/journey-context";
import { contentsFor, PAGES } from "@/lib/contents";
import { SiteBar } from "@/components/site-bar";
import { ResumeLink } from "@/components/progress";
import { GroupDivider, Hero, Lozenge, Numbered, PageGrid, RailCard, Row } from "@/components/scroll-page";

type Props = { params: Promise<{ journey: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bj = getJourney((await params).journey);
  return bj ? { title: `Journey ${bj.journey.number}: ${bj.journey.name} · BuildAI Lab`, description: bj.journey.promise } : {};
}

export default async function JourneyPage({ params, searchParams }: Props) {
  const bj = getJourney((await params).journey);
  if (!bj) notFound();
  const j = bj.journey;
  const ctx = journeyContext(bj, await searchParams);
  const total = ctx.steps.length;
  const later = roadmap.filter((r) => r.n > j.number && r.status !== "built");

  const places = [...ctx.steps.map((s, i) => ({ title: s.title, href: ctx.stepHref(i + 1) })), { title: "Finish", href: ctx.stepHref("done") }];

  const rail = (
    <div className="grid gap-4">
      <ResumeLink journey={j.number} places={places} />
      <RailCard>
        <p className="font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">Before you start</p>
        <ul className="mt-3 grid gap-2 text-[15px] leading-snug">
          {site.before.need.map((need) => (
            <li key={need} className="flex gap-2.5">
              <span aria-hidden className="text-graphite">–</span>
              {need}
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-rule pt-4 font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">Time</p>
        <p className="mt-2 text-[15px] leading-snug">{site.before.time}</p>
      </RailCard>
    </div>
  );

  return (
    <div className="w-full">
      <SiteBar where={`Journey ${j.number} · ${j.name}`} journeys={contentsFor(ctx.q)} links={PAGES} current={{ journey: j.number }} />

      <Hero
        crumbs={[{ label: "Home", href: `/${ctx.q}` }, { label: `Journey ${j.number}` }]}
        eyebrow={`Journey ${j.number} · ${total} steps in ${j.phases.length} parts`}
        title={j.name}
        lede={j.promise}
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a href={ctx.stepHref(1)} className="inline-block rounded-full bg-white px-5 py-2.5 text-[15px] font-semibold text-ink hover:bg-signal-soft">
            Start with step 1
          </a>
          {ctx.personal && <span className="text-[15px] text-white/80">Personalised for {ctx.mvp.name}</span>}
        </div>
      </Hero>

      <PageGrid rail={rail}>
        <Numbered n={1} id="outcome" eyebrow="What you'll leave with" heading={j.title}>
          <ul className="grid gap-3 text-[18px] leading-snug">
            {j.outcome.map((o) => (
              <li key={o} className="flex gap-3">
                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                {o}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[15px] text-graphite">{site.providerNote}</p>
        </Numbered>

        <Numbered n={2} id="route" eyebrow="The route" heading={`${total} steps in ${j.phases.length} parts`}>
          {j.phases.map((ph, p) => (
            <div key={ph.title} className="mt-12 first:mt-0">
              <GroupDivider n={p + 1} label={ph.title} />
              <p className="-mt-1 mb-4 text-[16px] text-graphite">{ph.summary}</p>
              <div className="grid gap-3">
                {ctx.steps.slice(ph.steps[0] - 1, ph.steps[1]).map((s, k) => {
                  const n = ph.steps[0] + k;
                  return (
                    <Row
                      key={n}
                      n={n}
                      href={ctx.stepHref(n)}
                      title={s.title}
                      tag={
                        <>
                          {bj.experiments[n - 1] && <Lozenge tone="blue">Break it</Lozenge>}
                          {s.personalised && <Lozenge tone="green">Your app</Lozenge>}
                        </>
                      }
                      pairs={[
                        ["Problem", s.problem],
                        ["You learn", s.concept],
                      ]}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </Numbered>

        {later.length > 0 && (
          <Numbered n={3} id="later" eyebrow="After this journey" heading="Each journey adds one capability to the same app">
            <div className="grid gap-3">
              {later.map((r) => (
                <Row
                  key={r.n}
                  n={r.n}
                  dim
                  title={r.title}
                  tag={<Lozenge>{r.status === "planned" ? "Planned next" : "Upcoming"}</Lozenge>}
                  pairs={[["Adds", r.adds]]}
                />
              ))}
            </div>
            <a href="/roadmap" className="prose-link mt-5 inline-block text-[17px]">
              What the lab covers today, and what it doesn&apos;t yet
            </a>
          </Numbered>
        )}
      </PageGrid>
    </div>
  );
}
