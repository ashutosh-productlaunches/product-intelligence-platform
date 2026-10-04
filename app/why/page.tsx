// /why — why the lab exists, where it's going, and a form for what PMs want next.
// A server component; only the form runs in the browser. Words live in content/why.ts.
import type { Metadata } from "next";
import Link from "next/link";
import { why } from "@/content/why";
import { FeedbackForm } from "@/components/feedback-form";
import { SiteBar } from "@/components/site-bar";
import { Hero, Numbered, PageGrid, RailCard } from "@/components/scroll-page";
import { contentsFor, PAGES } from "@/lib/contents";
import { button } from "@/components/style";

export const metadata: Metadata = {
  title: "Why I built this · BuildAI Lab",
  description: "Why BuildAI Lab exists, where it's going, and how to tell me what you want next.",
};

export default function WhyPage() {
  const s = why.story;
  const [lede, ...opening] = s.opening;
  const para = "text-[18px] leading-[1.65]";

  const rail = (
    <RailCard>
      <p className="font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">Built by a product manager</p>
      <a href="#feedback" className={`${button} mt-4 block w-full text-center`}>
        {why.form.title}
      </a>
      {why.linkedin && (
        <a
          href={why.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block rounded-full border border-rule py-2.5 text-center text-[15px] font-semibold hover:bg-paper-2"
        >
          Connect on LinkedIn
        </a>
      )}
      <div className="mt-5 border-t border-rule pt-4 text-[15px]">
        <Link href="/journeys/1" className="prose-link block">
          Start Journey 1
        </Link>
        <a href="/roadmap" className="prose-link mt-1.5 block">
          What the lab covers, and what&apos;s next
        </a>
      </div>
    </RailCard>
  );

  return (
    <div className="w-full">
      <SiteBar where={why.title} journeys={contentsFor()} links={PAGES} />
      <Hero crumbs={[{ label: "Home", href: "/" }, { label: why.title }]} eyebrow="The story" title={why.title} lede={lede} />

      <PageGrid rail={rail}>
        <Numbered n={1} id="story" eyebrow="The story" heading="What I wanted to understand">
          <div className="grid gap-4">
            {opening.map((p) => (
              <p key={p} className={para}>
                {p}
              </p>
            ))}
          </div>
          <ul className="my-6 grid gap-2 border-l-4 border-signal py-1 pl-5">
            {s.questions.map((q) => (
              <li key={q} className="text-[19px] leading-snug font-semibold">
                {q}
              </li>
            ))}
          </ul>
          <div className="grid gap-4">
            {s.middle.map((p) => (
              <p key={p} className={para}>
                {p}
              </p>
            ))}
          </div>
        </Numbered>

        <Numbered n={2} id="goal" eyebrow="The goal" heading="Technically fluent, not an ML engineer">
          <p className={para}>{s.goal.lead}</p>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {s.goal.items.map((it) => (
              <li key={it} className="flex gap-3 rounded-[3px] border border-rule bg-paper-2 px-4 py-3 text-[16px] leading-snug">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                {it}
              </li>
            ))}
          </ul>
        </Numbered>

        <Numbered n={3} id="future" eyebrow="Where it's going" heading="One app, taken further in each journey">
          <p className={para}>{why.future.lead}</p>
          <ol className="mt-5 flex flex-wrap items-center gap-2">
            {why.future.path.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className={`rounded-[3px] px-2.5 py-1 text-[14px] font-semibold ${i === 0 ? "bg-signal text-white" : "bg-signal-soft"}`}>
                  {i + 1}. {step}
                </span>
                {i < why.future.path.length - 1 && <span aria-hidden className="text-[13px] text-graphite">→</span>}
              </li>
            ))}
          </ol>
          <p className={`mt-5 ${para} text-graphite`}>{why.future.evolve}</p>
        </Numbered>

        <Numbered n={4} id="feedback" eyebrow="Your turn" heading={why.form.title}>
          <p className={`${para} text-graphite`}>{why.form.invite}</p>
          <div className="mt-6">
            <FeedbackForm />
          </div>
        </Numbered>
      </PageGrid>
    </div>
  );
}
