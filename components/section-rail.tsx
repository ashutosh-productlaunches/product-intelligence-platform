"use client";
// The side panel on a step page: where you are in the journey, the sections of this
// page (the one you're reading is highlighted), and the one way forward: Next.
// It stays on screen on wide screens. Without JavaScript it's the same, minus the highlight.
import { useEffect, useState, type ReactNode } from "react";
import { RailCard } from "@/components/scroll-page";
import { button } from "@/components/style";

const pad = (n: number) => String(n).padStart(2, "0");

function useCurrentSection(ids: string[]) {
  const [current, setCurrent] = useState(ids[0]);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // The current section is the last one whose top has passed a line a third of the way down.
      const line = window.innerHeight / 3;
      let now = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) now = id;
      }
      // At the very bottom, the last section counts even if it's short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) now = ids[ids.length - 1];
      setCurrent(now);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ids]);
  return current;
}

export function SectionRail({
  progress,
  sections,
  next,
  back,
  children,
}: {
  progress?: { step: number; total: number; label: string };
  sections: { id: string; label: string }[];
  next: { href: string; label: string; sub?: string };
  back?: { href: string; label: string };
  children?: ReactNode;
}) {
  const ids = sections.map((s) => s.id);
  const current = useCurrentSection(ids);
  const at = ids.indexOf(current);

  return (
    <RailCard>
      {progress && (
        <div>
          <p className="flex items-baseline justify-between font-label text-[13px]">
            <span className="font-semibold">
              Step {progress.step} of {progress.total}
            </span>
            <span className="text-graphite">{progress.label}</span>
          </p>
          <div className="mt-2 flex gap-0.5" aria-hidden>
            {Array.from({ length: progress.total }, (_, i) => (
              <span key={i} className={`h-1.5 flex-1 rounded-[1px] ${i + 1 < progress.step ? "bg-signal/45" : i + 1 === progress.step ? "bg-signal" : "bg-rule"}`} />
            ))}
          </div>
        </div>
      )}

      <nav aria-label="On this page" className={progress ? "mt-5 border-t border-rule pt-4" : ""}>
        <p className="font-label text-[11px] font-bold tracking-[0.08em] text-graphite uppercase">On this page</p>
        <ol className="mt-2 grid">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={i === at ? "location" : undefined}
                className={`-ml-3 flex items-baseline gap-2.5 border-l-2 py-1 pl-3 text-[15px] ${
                  i === at ? "border-signal font-semibold text-signal" : i < at ? "border-transparent text-ink" : "border-transparent text-graphite hover:text-ink"
                }`}
              >
                <span className="w-5 font-label text-[12px] tabular-nums opacity-70">{pad(i + 1)}</span>
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {children}

      <div className="mt-5 border-t border-rule pt-5">
        <a href={next.href} className={`${button} w-full text-center`}>
          {next.label}
        </a>
        {next.sub && <p className="mt-2 text-center text-[13px] leading-snug text-graphite">{next.sub}</p>}
        {back && (
          <a href={back.href} className="mt-3 block text-center text-[14px] font-medium text-graphite hover:text-ink">
            ← {back.label}
          </a>
        )}
      </div>
    </RailCard>
  );
}
