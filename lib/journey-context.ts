// What every journey page needs from the address: the learner's app (if they made one)
// and the steps personalised to it. The learner's answers travel in the query string
// (?pattern=…&input=…), so every link inside a journey carries them along.
import { getPattern, patterns } from "@/content/app-patterns";
import type { BuiltJourney } from "@/content/journeys";
import { buildMvp, parseIntake } from "@/lib/build-mvp";

export type SearchParams = Record<string, string | string[] | undefined>;
export const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const KEEP = ["pattern", "input", "audience", "detail"] as const;

export function journeyContext(bj: BuiltJourney, params: SearchParams) {
  const pattern = getPattern(one(params.pattern)) ?? patterns[0];
  const parsed = one(params.input) !== undefined ? parseIntake(params) : null;
  const personal = parsed?.ok === true;
  const mvp = buildMvp(personal ? parsed.intake : { pattern: pattern.id, ...pattern.example });
  const steps = bj.stepsFor(personal ? mvp : undefined);

  // The learner's answers, to append to every journey link. Empty when there are none.
  const kept = new URLSearchParams();
  if (personal) for (const k of KEEP) { const v = one(params[k]); if (v) kept.set(k, v); }
  const q = kept.size ? `?${kept.toString()}` : "";

  const n = bj.journey.number;
  const stepHref = (s: number | "done") => `/journeys/${n}/${s}${q}`;
  const phaseOf = (i: number) => bj.journey.phases.find((ph) => i + 1 >= ph.steps[0] && i + 1 <= ph.steps[1])!;

  return { mvp, steps, personal, q, stepHref, phaseOf, overviewHref: `/journeys/${n}${q}` };
}
