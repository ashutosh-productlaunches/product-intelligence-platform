// /architecture — the system map.
// A server component. The chosen flow travels in the URL (?flow=demo),
// the same way the intake answers do on the home page.
import type { Metadata } from "next";
import { flows, getFlow } from "@/content/architecture";
import { SystemMap } from "@/components/system-map";
import { SiteBar } from "@/components/site-bar";
import { Hero } from "@/components/scroll-page";
import { contentsFor, PAGES } from "@/lib/contents";

export const metadata: Metadata = {
  title: "System map · BuildAI Lab",
  description: "Every part of BuildAI Lab, what it does and why it exists.",
};

type SearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function Legend() {
  const item = "inline-flex items-center gap-2";
  const sw = "inline-block h-3 w-5 rounded-sm border";
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-graphite">
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
    <div className="w-full">
      <SiteBar where="System map" journeys={contentsFor()} links={PAGES} />
      <Hero
        crumbs={[{ label: "Home", href: "/" }, { label: "System map" }]}
        eyebrow="System map"
        title="How every part fits together"
        lede="Hover over or tab to any box to see what it does and why it exists. Pick a flow to follow a request through the system, step by step."
      />

      <main className="mx-auto w-full max-w-[76rem] px-4 pt-10 pb-24 sm:px-6 lg:px-10">
        <nav aria-label="Flows" className="flex scroll-mt-20 flex-wrap items-center gap-2" id="map">
          <span className="mr-1 font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">Follow a flow</span>
          {flows.map((f) => {
            const active = f.id === flow?.id;
            return (
              <a
                key={f.id}
                href={active ? "/architecture#map" : `/architecture?flow=${f.id}#map`}
                aria-current={active ? "true" : undefined}
                className={`rounded-full border px-4 py-1.5 text-[15px] font-semibold transition-colors ${
                  active ? "border-signal bg-signal text-white" : "border-rule hover:border-signal hover:text-signal"
                }`}
              >
                {f.title}
              </a>
            );
          })}
        </nav>

        <div className="mt-5 grid gap-6">
          <div className="min-w-0">
            <SystemMap flow={flow} />
            <div className="mt-4">
              <Legend />
            </div>
          </div>

          <section className="rounded-[3px] border border-rule bg-paper-2 p-5 sm:p-6">
            {flow ? (
              <>
                <p className="font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">The flow</p>
                <h2 className="mt-1 text-[20px] leading-snug font-semibold">{flow.title}</h2>
                <p className="mt-1 text-[15px] leading-relaxed text-graphite">{flow.intro}</p>
                <ol className="mt-4 grid gap-x-10 gap-y-2.5 md:grid-cols-2">
                  {flow.steps.map((st, i) => (
                    <li key={st} className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-baseline gap-2 text-[15px] leading-snug">
                      <span className="text-[15px] font-semibold text-signal tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <>
                <p className="font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">The flow</p>
                <h2 className="mt-1 text-[20px] font-semibold">Pick a flow above</h2>
                <p className="mt-1 text-[15px] leading-relaxed text-graphite">
                  Each flow lights up the boxes and arrows it uses and lists the steps here.
                </p>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
