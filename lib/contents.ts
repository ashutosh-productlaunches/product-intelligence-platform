// What the Contents sheet lists: every built journey with its parts and steps, then
// the journeys still to come (from the roadmap), then the other pages.
import type { ContentsJourney } from "@/components/site-bar";
import { builtJourneys } from "@/content/journeys";
import { journeys as roadmap } from "@/content/roadmap";

export const PAGES = [
  { label: "Home", href: "/" },
  { label: "Live demo", href: "/demo" },
  { label: "System map", href: "/architecture" },
  { label: "What you'll learn", href: "/roadmap" },
  { label: "Why I built this", href: "/why" },
];

// q: the learner's answers as a query string ("" or "?pattern=…"), kept on every link.
export function contentsFor(q = ""): ContentsJourney[] {
  const built: ContentsJourney[] = builtJourneys.map(({ journey: j }) => ({
    n: j.number,
    title: j.name,
    href: `/journeys/${j.number}${q}`,
    finishHref: `/journeys/${j.number}/done${q}`,
    parts: j.phases.map((ph) => ({
      title: ph.title,
      steps: j.steps.slice(ph.steps[0] - 1, ph.steps[1]).map((s, k) => {
        const n = ph.steps[0] + k;
        return { n, title: s.title, href: `/journeys/${j.number}/${n}${q}` };
      }),
    })),
  }));
  const builtNumbers = new Set(built.map((b) => b.n));
  const later: ContentsJourney[] = roadmap
    .filter((r) => !builtNumbers.has(r.n))
    .map((r) => ({ n: r.n, title: r.title, status: r.status === "planned" ? "Planned" : "Upcoming" }));
  return [...built, ...later];
}
