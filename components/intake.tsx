// "What do you want to build?" — the three states of the intake.
// No JavaScript runs in the browser: choices travel in the page URL,
// and the server renders the right state. That also makes every journey shareable.
import { patterns, type Pattern } from "@/content/app-patterns";
import { exampleHref, type Mvp } from "@/lib/build-mvp";

const box = "rounded-lg border-2 border-emerald-600/70 bg-white p-5 dark:bg-zinc-950";
const label = "text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400";

// State 1: nothing chosen yet.
export function PatternMenu({ activeId }: { activeId?: string }) {
  return (
    <section id="build" className={box}>
      <p className={label}>Start here</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight">What do you want to build?</h2>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        Pick the closest match. Most first AI tools are one of these five.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {patterns.map((p) => (
          <li key={p.id}>
            <a
              href={`/?pattern=${p.id}#build`}
              className={`block h-full rounded-md border p-3 hover:border-emerald-600 ${
                p.id === activeId
                  ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <span className="font-semibold">{p.name}</span>
              <span className="block text-sm text-zinc-600 dark:text-zinc-400">{p.does}</span>
              <span className="mt-1 block text-xs text-zinc-500">{p.examples.join(" · ")}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">
        <a href={`/?pattern=${activeId ?? "summarise"}&make=1#build`} className="font-medium underline underline-offset-4">
          Make it yours →
        </a>{" "}
        <span className="text-zinc-500">Answer three questions and every step uses your wording.</span>
      </p>
    </section>
  );
}

// State 2: a pattern is chosen; ask the three questions.
export function IntakeForm({
  pattern,
  error,
  values,
}: {
  pattern: Pattern;
  error?: string;
  values: { input?: string; audience?: string; detail?: string };
}) {
  const field =
    "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-[15px] dark:border-zinc-700 dark:bg-zinc-900";
  return (
    <section id="build" className={box}>
      <p className={label}>Start here · {pattern.name}</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight">Tell us about your app</h2>
      {error && (
        <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}
      <form method="get" action="/" className="mt-4 grid gap-4">
        <input type="hidden" name="pattern" value={pattern.id} />
        <label className="block">
          <span className="font-medium">1. What will people put in?</span>
          <input id="input" name="input" required defaultValue={values.input} placeholder={pattern.example.input} className={field} />
        </label>
        <label className="block">
          <span className="font-medium">2. Who uses the result?</span>
          <input id="audience" name="audience" required defaultValue={values.audience} placeholder={pattern.example.audience} className={field} />
        </label>
        {pattern.detail && (
          <label className="block">
            <span className="font-medium">3. {pattern.detail.label}</span>
            <span className="block text-sm text-zinc-500">{pattern.detail.hint}</span>
            <input id="detail" name="detail" defaultValue={values.detail} placeholder={pattern.example.detail} className={field} />
          </label>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800">
            Build my journey
          </button>
          <a href={exampleHref(pattern.id)} className="text-sm underline underline-offset-4">
            Use the example answers
          </a>
          <a href="/#build" className="text-sm text-zinc-500 underline underline-offset-4">
            Choose a different app type
          </a>
        </div>
      </form>
    </section>
  );
}

// State 3: the learner's MVP, built by plain code.
export function MvpCard({ mvp, changeHref }: { mvp: Mvp; changeHref: string }) {
  const row = "grid gap-1 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-3";
  const code =
    "overflow-x-auto rounded bg-zinc-50 px-2 py-1 font-mono text-[13px] dark:bg-zinc-900";
  return (
    <section id="build" className={box}>
      <p className={label}>Your MVP · {mvp.patternName}</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight">{mvp.name}</h2>
      <div className="mt-4 grid gap-3 text-[15px]">
        <div className={row}>
          <span className="text-sm text-zinc-500">Input</span>
          <span>{mvp.input}, pasted in</span>
        </div>
        <div className={row}>
          <span className="text-sm text-zinc-500">For</span>
          <span>{mvp.audience}</span>
        </div>
        <div className={row}>
          <span className="text-sm text-zinc-500">Output</span>
          <code className={code}>{mvp.outputExample}</code>
        </div>
        <div className={row}>
          <span className="text-sm text-zinc-500">Prompt</span>
          <code className={code}>{mvp.prompt}</code>
        </div>
      </div>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Steps marked <b>Your app</b> now use {mvp.name}&apos;s details.
      </p>
      <p className="mt-2 flex flex-wrap gap-4 text-sm">
        <a href={changeHref} className="underline underline-offset-4">Change answers</a>
        <a href="/#build" className="text-zinc-500 underline underline-offset-4">Start over</a>
      </p>
    </section>
  );
}
