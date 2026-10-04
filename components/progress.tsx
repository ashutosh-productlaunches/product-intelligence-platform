"use client";
// Where a learner got to, remembered in this browser, one entry per journey.
// The journey rarely fits one sitting, so the overview and the home page offer
// the place back. Storage can be missing or blocked; then nothing is offered.
import { useEffect, useSyncExternalStore } from "react";

const key = (journey: number) => `buildailab:j${journey}`;
// Before journeys had their own pages, Journey 1's place was saved under this key.
const LEGACY = "buildailab:step";

// The last step visited: 1..total, total + 1 for the finish page, 0 for none.
export function savedStep(journey: number): number {
  try {
    const v = localStorage.getItem(key(journey)) ?? (journey === 1 ? localStorage.getItem(LEGACY) : null);
    return Number(v) || 0;
  } catch {
    return 0;
  }
}

// The saved step as React state; updates if another tab moves on. 0 on the server.
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}
export function useSavedStep(journey: number): number {
  return useSyncExternalStore(subscribe, () => savedStep(journey), () => 0);
}

// Put on every step page (and the finish page) to remember the visit.
export function RememberPlace({ journey, step }: { journey: number; step: number }) {
  useEffect(() => {
    try {
      localStorage.setItem(key(journey), String(step));
    } catch {}
  }, [journey, step]);
  return null;
}

// "Pick up where you left off", shown only when there's a place worth going back to.
// `places[i]` is step i + 1; the last entry is the finish page.
export function ResumeLink({ journey, places }: { journey: number; places: { title: string; href: string }[] }) {
  const at = useSavedStep(journey);
  if (at < 2 || at > places.length) return null;
  const place = places[at - 1];
  const finished = at === places.length;
  return (
    <a href={place.href} className="block rounded-[3px] bg-signal-soft px-4 py-3 text-[16px] leading-snug hover:bg-[#dbe8fc]">
      <span className="block font-semibold">Welcome back.</span>
      <span className="block">{finished ? "You finished this journey." : `You were on step ${at}: ${place.title}.`}</span>
      <span className="mt-1 block font-semibold text-signal">{finished ? "See what you built" : "Pick up where you left off"} →</span>
    </a>
  );
}

// Old links pointed into the single-page journey (/#step-6, /#done). Send them on.
export function LegacyStepRedirect({ total }: { total: number }) {
  useEffect(() => {
    const h = window.location.hash;
    const m = h.match(/^#step-(\d+)$/);
    if (h === "#done") window.location.replace("/journeys/1/done");
    else if (m) window.location.replace(`/journeys/1/${Math.min(Math.max(Number(m[1]), 1), total)}`);
  }, [total]);
  return null;
}

// The one button that starts a journey or picks it up again. Before any progress it reads
// "Start with step 1"; after it, "Continue: step N · title" and goes straight there.
// `places[i]` is step i + 1; the last entry is the finish page.
export function StartOrResume({
  journey,
  places,
  className,
  startLabel = "Start with step 1",
}: {
  journey: number;
  places: { title: string; href: string }[];
  className?: string;
  startLabel?: string;
}) {
  const at = useSavedStep(journey);
  const total = places.length - 1;
  const resume = at >= 2 && at <= places.length;
  const place = resume ? places[at - 1] : places[0];
  const label = !resume ? startLabel : at > total ? "See what you built" : `Continue: step ${at} · ${place.title}`;
  return (
    <a href={place.href} className={className}>
      {label}
    </a>
  );
}
