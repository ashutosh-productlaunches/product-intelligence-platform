// A picture of the screen the learner will build in step 11.
// Nothing here is live: no model call, no cost. The placeholders are labelled
// as placeholders rather than filled with invented results.
import type { Mvp } from "@/lib/build-mvp";

const line = "h-2 rounded bg-zinc-200 dark:bg-zinc-700";

function ResultPlaceholder({ mvp }: { mvp: Mvp }) {
  const p = mvp.preview;
  if (p.kind === "points") {
    return (
      <ol className="grid gap-3">
        {Array.from({ length: p.count }, (_, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 font-mono text-xs text-zinc-400">{i + 1}</span>
            <span className="grid flex-1 gap-1.5 pt-1">
              <span className={`${line} w-full`} />
              <span className={`${line} w-4/5`} />
            </span>
          </li>
        ))}
      </ol>
    );
  }
  if (p.kind === "category") {
    return (
      <div className="flex flex-wrap gap-2">
        {p.categories.map((c, i) => (
          <span
            key={c}
            className={
              i === 0
                ? "rounded-full bg-emerald-600 px-3 py-1 text-sm font-medium text-white"
                : "rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-400 dark:border-zinc-700"
            }
          >
            {c}
          </span>
        ))}
      </div>
    );
  }
  if (p.kind === "fields") {
    return (
      <dl className="grid gap-2">
        {p.fields.map((f) => (
          <div key={f.key} className="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-3 border-b border-zinc-100 pb-2 dark:border-zinc-800">
            <dt className="text-sm text-zinc-500">{f.label}</dt>
            <dd className={`${line} w-3/4`} />
          </div>
        ))}
      </dl>
    );
  }
  if (p.kind === "answer") {
    return (
      <div className="grid gap-2">
        <div className={`${line} w-full`} />
        <div className={`${line} w-2/3`} />
        <p className="pt-1 text-sm text-zinc-500">
          …or, when the text doesn&apos;t cover it: <b className="text-amber-700 dark:text-amber-500">Not in the text.</b>
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-2">
      <div className={`${line} w-full`} />
      <div className={`${line} w-full`} />
      <div className={`${line} w-1/2`} />
    </div>
  );
}

export function AppPreview({ mvp }: { mvp: Mvp }) {
  return (
    <section id="preview" className="mt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">What you&apos;ll build</h2>
        <p className="text-xs uppercase tracking-wider text-zinc-500">A picture, not a live app</p>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-zinc-300 shadow-sm dark:border-zinc-700">
        {/* the browser chrome, so it reads as a real screen */}
        <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="ml-2 truncate font-mono text-xs text-zinc-500">your-app.vercel.app</span>
        </div>

        <div className="grid gap-5 bg-white p-6 dark:bg-zinc-950">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">{mvp.name}</h3>
            <p className="text-sm text-zinc-500">
              Paste {mvp.input} below. Built for {mvp.audience}.
            </p>
          </div>

          <div>
            <div className="rounded-lg border border-zinc-300 bg-zinc-50 p-3 font-mono text-[13px] leading-relaxed whitespace-pre-line text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
              {mvp.sampleText}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white">Run</span>
              <span className="text-sm text-zinc-500">Takes a second or two.</span>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Result · {mvp.resultShownAs}
            </p>
            <ResultPlaceholder mvp={mvp} />
          </div>
        </div>
      </div>

      <p className="mt-2 text-sm text-zinc-500">
        The grey bars are where the model&apos;s words go. Step 11 builds this screen.
      </p>
    </section>
  );
}
