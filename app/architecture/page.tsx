// /architecture — the system map.
// A server component. The chosen flow travels in the URL (?flow=demo),
// the same way the intake answers do on the home page.
import type { Metadata } from "next";
import { flows, getFlow } from "@/content/architecture";
import { SystemMap } from "@/components/system-map";

export const metadata: Metadata = {
  title: "System map · AI Tool Lab",
  description: "Every part of the AI Tool Lab, what it does and why it exists.",
};

type SearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function Legend() {
  const item = "inline-flex items-center gap-2";
  const sw = "inline-block h-3 w-5 rounded-sm border";
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-zinc-600 dark:text-zinc-400">
      <span className={item}><i className={`${sw} border-zinc-800 dark:border-zinc-300`} />Live today</span>
      <span className={item}><i className={`${sw} border-dashed border-zinc-800 dark:border-zinc-300`} />Journey 2, not built yet</span>
      <span className={item}><i className={`${sw} border-emerald-600 bg-emerald-50 dark:bg-emerald-950`} />Schema (a contract)</span>
      <span className={item}><i className={`${sw} border-amber-700/60 bg-amber-50 dark:bg-amber-950`} />Document or config</span>
      <span className={item}>
        <span className="rounded bg-emerald-700 px-1.5 py-px font-mono text-[10px] text-white dark:bg-emerald-400 dark:text-zinc-950">Zod</span>
        Checks incoming data
      </span>
    </div>
  );
}

export default async function ArchitecturePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const flow = getFlow(one(params.flow));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">AI Tool Lab for PMs · System map</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">How every part fits together</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        Hover over or tab to any box to see what it does and why it exists. Pick a flow to follow a request through the
        system, step by step.
      </p>

      <nav aria-label="Flows" className="mt-8 flex flex-wrap items-center gap-2" id="map">
        <span className="mr-1 font-mono text-xs uppercase tracking-wider text-zinc-500">Follow a flow</span>
        {flows.map((f) => {
          const active = f.id === flow?.id;
          return (
            <a
              key={f.id}
              href={active ? "/architecture#map" : `/architecture?flow=${f.id}#map`}
              aria-current={active ? "true" : undefined}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-emerald-700 bg-emerald-700 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-zinc-950"
                  : "border-zinc-300 hover:border-emerald-600 dark:border-zinc-700 dark:hover:border-emerald-400"
              }`}
            >
              {f.title}
            </a>
          );
        })}
      </nav>

      <div className="mt-4">
        <SystemMap flow={flow} />
      </div>
      <div className="mt-4">
        <Legend />
      </div>

      <section className="mt-8 border-l-2 border-emerald-600 pl-5 dark:border-emerald-400">
        {flow ? (
          <>
            <h2 className="text-lg font-semibold">{flow.title}</h2>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">{flow.intro}</p>
            <ol className="mt-4 grid max-w-3xl gap-2.5">
              {flow.steps.map((s, i) => (
                <li key={s} className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-baseline gap-2 text-[15px]">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-700 font-mono text-xs font-semibold text-white dark:bg-emerald-400 dark:text-zinc-950">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">Pick a flow above</h2>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Each flow lights up the boxes and arrows it uses and lists the steps here.
            </p>
          </>
        )}
      </section>

      <p className="mt-10 text-sm text-zinc-500">
        <a href="/" className="underline underline-offset-4 hover:text-zinc-800 dark:hover:text-zinc-200">
          Back to Journey 1
        </a>
        {" · "}
        <a href="/demo" className="underline underline-offset-4 hover:text-zinc-800 dark:hover:text-zinc-200">
          Try the live demo
        </a>
      </p>
    </main>
  );
}
