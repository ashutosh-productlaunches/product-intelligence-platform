// The result area of the demo app, in two forms:
//   ResultPlaceholder — grey bars, shown before anyone presses Run
//   ResultView        — the real answer, after it has passed the Zod check
import type { Mvp } from "@/lib/build-mvp";

// These views live on the dark demo screen and use its tokens (--text, --accent…).
const bar = "block h-2 rounded bg-white/10";

export function ResultPlaceholder({ mvp }: { mvp: Mvp }) {
  const p = mvp.preview;
  if (p.kind === "points") {
    return (
      <ol className="grid gap-3">
        {Array.from({ length: p.count }, (_, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-1 font-mono text-xs text-(--muted)/60">{i + 1}</span>
            <span className="grid flex-1 gap-1.5 pt-1.5">
              <span className={`${bar} w-full`} />
              <span className={`${bar} w-4/5`} />
            </span>
          </li>
        ))}
      </ol>
    );
  }
  if (p.kind === "category") {
    return (
      <div className="flex flex-wrap gap-2">
        {p.categories.map((c) => (
          <span key={c} className="rounded-lg border border-(--border) px-2.5 py-1 text-sm text-(--muted)">
            {c}
          </span>
        ))}
      </div>
    );
  }
  if (p.kind === "fields") {
    return (
      <dl className="grid gap-px overflow-hidden rounded-xl bg-(--border)">
        {p.fields.map((f) => (
          <div key={f.key} className="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-4 bg-(--bg)/70 px-4 py-3.5">
            <dt className="truncate text-[13px] text-(--muted)">{f.label}</dt>
            <dd className={`${bar} w-2/3`} />
          </div>
        ))}
      </dl>
    );
  }
  return (
    <div className="grid gap-2">
      <span className={`${bar} w-full`} />
      <span className={`${bar} w-full`} />
      <span className={`${bar} w-1/2`} />
    </div>
  );
}

export function ResultView({ mvp, data }: { mvp: Mvp; data: Record<string, unknown> }) {
  const p = mvp.preview;

  if (p.kind === "points") {
    const points = (data.points as string[]) ?? [];
    return (
      <ol className="grid gap-3">
        {points.map((point, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-(--text)">
            <span className="mt-1 font-mono text-xs text-(--accent) tabular-nums">{i + 1}</span>
            <span>{point}</span>
          </li>
        ))}
      </ol>
    );
  }

  if (p.kind === "category") {
    const chosen = String(data.category ?? "");
    return (
      <div className="flex flex-wrap gap-2">
        {p.categories.map((c) => (
          <span
            key={c}
            className={
              c === chosen
                ? "rounded-lg bg-gradient-to-r from-(--accent) to-(--accent-2) px-3 py-1.5 text-sm font-semibold text-(--bg) shadow-lg shadow-(--accent-2)/30"
                : "rounded-lg border border-(--border) px-3 py-1.5 text-sm text-(--muted)"
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
      <dl className="grid gap-px overflow-hidden rounded-xl bg-(--border)">
        {p.fields.map((f) => {
          const value = data[f.key];
          return (
            <div key={f.key} className="grid grid-cols-[9rem_minmax(0,1fr)] gap-4 bg-(--bg)/70 px-4 py-3.5">
              <dt className="truncate text-[13px] text-(--muted)">{f.label}</dt>
              <dd className={value ? "text-[15px] text-(--text)" : "text-[15px] text-(--muted)/60 italic"}>
                {value ? String(value) : "not in the text"}
              </dd>
            </div>
          );
        })}
      </dl>
    );
  }

  if (p.kind === "answer") {
    const found = Boolean(data.found);
    if (!found) {
      return (
        <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-[15px] text-amber-200">
          Not in the text. The app says so instead of guessing.
        </p>
      );
    }
    return <p className="text-[15px] leading-relaxed text-(--text)">{String(data.answer ?? "")}</p>;
  }

  return <p className="text-[15px] leading-relaxed whitespace-pre-line text-(--text)">{String(data.text ?? "")}</p>;
}
