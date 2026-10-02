// /why — why the lab exists, where it's going, and a form for what PMs want next.
// A server component; only the form runs in the browser. Words live in content/why.ts.
import type { Metadata } from "next";
import { why } from "@/content/why";
import { FeedbackForm } from "@/components/feedback-form";

export const metadata: Metadata = {
  title: "Why I built this · AI Tool Lab",
  description: "Why AI Tool Lab exists, where it's going, and how to tell me what you want next.",
};

export default function WhyPage() {
  const s = why.story;
  const para = "text-[17px] leading-relaxed";

  return (
    <main className="mx-auto w-full max-w-[42rem] px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">AI Tool Lab for PMs · {why.title}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{why.title}</h1>
      {why.linkedin && (
        <a
          href={why.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          Connect with me on LinkedIn →
        </a>
      )}

      <section className="mt-8 grid gap-4">
        {s.opening.map((p) => (
          <p key={p} className={para}>
            {p}
          </p>
        ))}
        <ul className="grid gap-1.5 border-l-4 border-emerald-600 py-1 pl-4 dark:border-emerald-400">
          {s.questions.map((q) => (
            <li key={q} className="text-[17px] font-semibold tracking-tight">
              {q}
            </li>
          ))}
        </ul>
        {s.middle.map((p) => (
          <p key={p} className={para}>
            {p}
          </p>
        ))}
        <div>
          <p className={para}>{s.goal.lead}</p>
          <ul className="mt-2 grid gap-1.5">
            {s.goal.items.map((it) => (
              <li key={it} className="flex gap-2.5 text-[17px] leading-snug">
                <span aria-hidden className="text-emerald-600 dark:text-emerald-400">✓</span>
                {it}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10 rounded-lg border border-dashed border-zinc-300 p-5 dark:border-zinc-700">
        <h2 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Where it&apos;s going</h2>
        <p className="mt-2 leading-relaxed">{why.future.lead}</p>
        <ol className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[13px]">
          {why.future.path.map((step, i) => (
            <li key={step} className="flex items-center gap-1.5">
              <span
                className={`rounded-md px-2 py-1 font-medium ${
                  i === 0 ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 dark:border-zinc-700"
                }`}
              >
                {step}
              </span>
              {i < why.future.path.length - 1 && (
                <span aria-hidden className="text-zinc-400">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">{why.future.evolve}</p>
        <a href="/roadmap" className="mt-2 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          See what&apos;s covered and what&apos;s next →
        </a>
      </section>

      <section id="feedback" className="mt-10 scroll-mt-6">
        <h2 className="text-xl font-bold tracking-tight">{why.form.title}</h2>
        <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">{why.form.invite}</p>
        <div className="mt-5">
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
