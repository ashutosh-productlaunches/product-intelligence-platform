// /why — why the lab exists, where it's going, and a form for what PMs want next.
// A server component; only the form runs in the browser. Words live in content/why.ts.
import type { Metadata } from "next";
import { why } from "@/content/why";
import { FeedbackForm } from "@/components/feedback-form";

export const metadata: Metadata = {
  title: "Why I built this · AI Tool Lab",
  description: "Why Build AI Lab exists, where it's going, and how to tell me what you want next.",
};

export default function WhyPage() {
  return (
    <main className="mx-auto w-full max-w-[42rem] px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">AI Tool Lab for PMs · {why.title}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{why.title}</h1>
      <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">{why.intro}</p>

      <section className="mt-8 grid gap-4 text-[17px] leading-relaxed">
        {why.story.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>

      <section className="mt-10 rounded-lg border border-dashed border-zinc-300 p-5 dark:border-zinc-700">
        <h2 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Where it&apos;s going</h2>
        <p className="mt-2 leading-relaxed">{why.future.lead}</p>
        <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">{why.future.ask}</p>
        <a href="/roadmap" className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          See what&apos;s covered and what&apos;s next →
        </a>
      </section>

      <section id="feedback" className="mt-10 scroll-mt-6">
        <h2 className="text-xl font-bold tracking-tight">{why.form.title}</h2>
        <div className="mt-4">
          <FeedbackForm />
        </div>
      </section>

      <p className="mt-12 text-sm text-zinc-500">
        <a href="/" className="underline underline-offset-4 hover:text-zinc-800 dark:hover:text-zinc-200">
          Back to Journey 1
        </a>
        {" · "}
        <a href="/roadmap" className="underline underline-offset-4 hover:text-zinc-800 dark:hover:text-zinc-200">
          What you&apos;ll learn
        </a>
      </p>
    </main>
  );
}
