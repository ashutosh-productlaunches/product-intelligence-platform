// The system map: boxes, arrows and hover cards drawn from content/architecture.ts.
// A server component, like the rest of the site: no JavaScript runs in the browser.
// Hover cards open with CSS (hover, or keyboard/tap focus). The chosen flow travels
// in the URL (?flow=demo), so the server decides what to highlight.
import { CANVAS, columns, edges, nodes, zones, type Flow, type SystemNode } from "@/content/architecture";

const CARD_W = 320;

function statusChip(n: SystemNode) {
  if (n.status === "live") return { text: "Live", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" };
  if (n.status === "next") return { text: `Planned${n.step ? ` · step ${n.step}` : ""}`, cls: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300" };
  return { text: "Doc / config", cls: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300" };
}

function boxClass(n: SystemNode) {
  if (n.contract) return "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/60";
  if (n.status === "doc") return "border-amber-700/60 bg-amber-50 dark:border-amber-400/60 dark:bg-amber-950/40";
  return "border-zinc-800 bg-white dark:border-zinc-300 dark:bg-zinc-950";
}

// Open the card on whichever side has room, and upward for the bottom row.
function cardPosition(n: SystemNode): React.CSSProperties {
  const side = n.x + n.w + 12 + CARD_W <= CANVAS.width ? { left: n.w + 12 } : { right: n.w + 12 };
  const vertical = n.y > 450 ? { bottom: 0 } : { top: 0 };
  return { ...side, ...vertical, width: CARD_W };
}

function Node({ n, dimmed }: { n: SystemNode; dimmed: boolean }) {
  const chip = statusChip(n);
  const big = n.h > 100;
  return (
    <div
      tabIndex={0}
      aria-describedby={`card-${n.id}`}
      className={`group absolute cursor-default outline-none transition-opacity hover:z-30 focus:z-30 ${dimmed ? "opacity-25 hover:opacity-100 focus:opacity-100" : ""}`}
      style={{ left: n.x, top: n.y, width: n.w, height: n.h }}
    >
      <div
        className={`h-full rounded-md border px-3 py-2 transition-[border-width] group-hover:border-2 group-focus:border-2 group-focus:ring-2 group-focus:ring-emerald-500/50 ${n.status === "next" ? "border-dashed" : ""} ${boxClass(n)}`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className={`${big ? "text-base" : "text-[13.5px]"} font-semibold leading-tight ${n.mono ? "font-mono" : ""}`}>{n.label}</p>
          {n.checks && (
            <span className="shrink-0 rounded bg-emerald-700 px-1.5 py-px font-mono text-[9.5px] font-medium text-white dark:bg-emerald-400 dark:text-zinc-950">
              Zod
            </span>
          )}
        </div>
        <p className="mt-1 text-[11.5px] leading-tight text-zinc-500 dark:text-zinc-400">{n.sub}</p>
      </div>

      <div
        id={`card-${n.id}`}
        role="tooltip"
        className="invisible absolute z-40 flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-sm leading-relaxed opacity-0 shadow-xl shadow-zinc-900/15 transition-opacity group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/50"
        style={cardPosition(n)}
      >
        <p className="text-base font-semibold">{n.label}</p>
        <div className="flex flex-wrap gap-1.5">
          <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${chip.cls}`}>{chip.text}</span>
          {n.owner && (
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {n.owner === "you" ? "you write it" : "assistant writes it"}
            </span>
          )}
          {n.checks && (
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              checks input
            </span>
          )}
        </div>
        {n.file && <p className="break-all font-mono text-xs text-zinc-500">{n.file}</p>}
        <dl className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-2.5 gap-y-1.5">
          <dt className="pt-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">What</dt>
          <dd className="text-zinc-700 dark:text-zinc-300">{n.what}</dd>
          <dt className="pt-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Why</dt>
          <dd className="text-zinc-700 dark:text-zinc-300">{n.why}</dd>
        </dl>
      </div>
    </div>
  );
}

export function SystemMap({ flow }: { flow?: Flow }) {
  const onNodes = new Set(flow?.nodes);
  const onEdges = new Set(flow?.edges);

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="relative" style={{ width: CANVAS.width, height: CANVAS.height }}>
        <svg
          width={CANVAS.width}
          height={CANVAS.height}
          viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
          className="absolute inset-0"
          role="img"
          aria-label="System map of the AI Tool Lab: browser pages, the Next.js app on Vercel, Gemini, and the build, test and ship loop."
        >
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" className="fill-zinc-500 dark:fill-zinc-400" />
            </marker>
            <marker id="arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" className="fill-emerald-600 dark:fill-emerald-400" />
            </marker>
          </defs>

          {zones.map((z) => (
            <g key={z.label}>
              <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={6} className="fill-zinc-100 dark:fill-zinc-900" />
              <text x={z.x + 14} y={z.y + 22} className="fill-zinc-500 font-mono text-[11px] tracking-wider">
                {z.label}
              </text>
            </g>
          ))}
          {columns.map((c) => (
            <text key={c.label} x={c.x} y={60} className="fill-zinc-500 font-mono text-[9.5px] tracking-wide">
              {c.label}
            </text>
          ))}

          {edges.map((e) => {
            const on = onEdges.has(e.id);
            const dim = flow && !on;
            return (
              <g key={e.id} className={`transition-opacity ${dim ? "opacity-20" : ""}`}>
                <path
                  d={"M" + e.points.map((p) => p.join(",")).join(" L")}
                  fill="none"
                  strokeWidth={on ? 2.2 : 1.3}
                  strokeDasharray={e.dashed ? "4 4" : undefined}
                  markerEnd={on ? "url(#arrow-on)" : "url(#arrow)"}
                  className={on ? "stroke-emerald-600 dark:stroke-emerald-400" : "stroke-zinc-500 dark:stroke-zinc-400"}
                />
                {e.label && e.labelAt && (
                  <text x={e.labelAt[0]} y={e.labelAt[1]} className="fill-zinc-500 text-[10.5px] dark:fill-zinc-400">
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {nodes.map((n) => (
          <Node key={n.id} n={n} dimmed={!!flow && !onNodes.has(n.id)} />
        ))}
      </div>
    </div>
  );
}
