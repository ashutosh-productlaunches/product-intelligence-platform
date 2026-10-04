// /roadmap — what you'll learn: the journeys, and an honest checklist of
// which AI topics the lab covers today, partly, or not yet.
// A server component with no state. Words live in content/roadmap.ts.
import type { Metadata } from "next";
import Link from "next/link";
import { journeys, orderNote, topics, type Status } from "@/content/roadmap";
import { SiteBar } from "@/components/site-bar";
import { Hero, Lozenge, Numbered, PageGrid, RailCard, Row } from "@/components/scroll-page";
import { contentsFor, PAGES } from "@/lib/contents";
import { button } from "@/components/style";

export const metadata: Metadata = {
  title: "What you'll learn · BuildAI Lab",
  description: "What the lab teaches today, what it covers partly, and what comes next.",
};

const STATUS: Record<Status, { label: string; tone: "green" | "blue" | "default"; dot: string }> = {
  covered: { label: "Covered", tone: "green", dot: "bg-pass" },
  partly: { label: "Partly", tone: "blue", dot: "bg-signal" },
  "not-yet": { label: "Not yet", tone: "default", dot: "border border-graphite" },
};

const JOURNEY: Record<(typeof journeys)[number]["status"], string> = {
  built: "Ready",
  planned: "Planned next",
  upcoming: "Upcoming",
};

export default function RoadmapPage() {
  const count = (s: Status) => topics.filter((t) => t.status === s).length;

  const rail = (
    <RailCard>
      <p className="font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">Topics at a glance</p>
      <ul className="mt-3 grid gap-2">
        {(["covered", "partly", "not-yet"] as const).map((s) => (
          <li key={s} className="flex items-center gap-3 text-[16px]">
            <i className={`inline-block size-2.5 rounded-full ${STATUS[s].dot}`} />
            <span className="flex-1">{STATUS[s].label}</span>
            <span className="font-semibold tabular-nums">{count(s)}</span>
          </li>
        ))}
      </ul>
      <Link href="/journeys/1" className={`${button} mt-5 block w-full text-center`}>
        Start Journey 1
      </Link>
      <a href="/why#feedback" className="prose-link mt-3 block text-center text-[15px]">
        Tell me what you&apos;d want next
      </a>
    </RailCard>
  );

  return (
    <div className="w-full">
      <SiteBar where="What you'll learn" journeys={contentsFor()} links={PAGES} />
      <Hero
        crumbs={[{ label: "Home", href: "/" }, { label: "What you'll learn" }]}
        eyebrow="What you'll learn"
        title="What the lab teaches, and what it doesn't yet"
        lede="One app, built further in each journey. Here's what's included today and what's coming, so you know what you'll leave with."
      />

      <PageGrid rail={rail}>
        <Numbered n={1} id="journeys" eyebrow="The journeys" heading="Each journey adds one capability">
          <div className="grid gap-3">
            {journeys.map((j) => (
              <Row
                key={j.n}
                n={j.n}
                href={j.status === "built" ? `/journeys/${j.n}` : undefined}
                dim={j.status !== "built"}
                title={j.title}
                tag={<Lozenge tone={j.status === "built" ? "green" : "default"}>{JOURNEY[j.status]}</Lozenge>}
                pairs={[["Adds", j.adds]]}
              />
            ))}
          </div>
          <p className="mt-4 text-[16px] leading-relaxed text-graphite">{orderNote}</p>
        </Numbered>

        <Numbered n={2} id="topics" eyebrow="Topic by topic" heading="An honest checklist">
          <div className="grid gap-3">
            {topics.map((t) => (
              <Row
                key={t.name}
                title={t.name}
                tag={<Lozenge tone={STATUS[t.status].tone}>{STATUS[t.status].label}</Lozenge>}
                pairs={[
                  ...(t.now.length > 0
                    ? ([
                        [
                          "In the lab now",
                          <ul key="now" className="grid gap-1">
                            {t.now.map((n) => (
                              <li key={n.text}>
                                {n.text}
                                {n.step && (
                                  <>
                                    {" "}
                                    <a href={`/journeys/1/${n.step}`} className="prose-link whitespace-nowrap text-[14px]">
                                      Step {n.step}
                                    </a>
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>,
                        ],
                      ] as [string, React.ReactNode][])
                    : []),
                  ...(t.notYet
                    ? ([
                        [
                          "Not yet",
                          <span key="not" className="text-graphite">
                            {t.notYet}
                            {t.journey && <span className="font-semibold text-ink"> Planned for Journey {t.journey}.</span>}
                          </span>,
                        ],
                      ] as [string, React.ReactNode][])
                    : []),
                ]}
              />
            ))}
          </div>
        </Numbered>
      </PageGrid>
    </div>
  );
}
