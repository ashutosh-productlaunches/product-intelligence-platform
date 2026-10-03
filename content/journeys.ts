// Every journey the site can show, in one place. To add a journey: write its content
// (steps, checks, experiments) like journey-01, then add it here. Pages, navigation and
// saved progress all read from this list; nothing else needs to change.
// Journeys that aren't built yet live in content/roadmap.ts.
import { journey01, stepsFor as stepsFor01, type Journey, type Step } from "@/content/journey-01";
import { checks01, type Question } from "@/content/checks-01";
import { experiments01, type Experiment } from "@/content/experiments-01";
import type { Mvp } from "@/lib/build-mvp";

export type BuiltJourney = {
  journey: Journey;
  // Steps as the learner sees them; with an MVP, personalised to their app.
  stepsFor: (mvp?: Mvp) => Array<Step & { personalised: boolean }>;
  checks: (Question[] | undefined)[]; // by step index
  experiments: (Experiment | undefined)[]; // by step index
  // Steps before this one only show the shape of the app; building starts here.
  firstBuildStep: number;
};

export const builtJourneys: BuiltJourney[] = [
  { journey: journey01, stepsFor: stepsFor01, checks: checks01, experiments: experiments01, firstBuildStep: 3 },
];

export function getJourney(n: string | number | undefined): BuiltJourney | undefined {
  return builtJourneys.find((j) => String(j.journey.number) === String(n));
}

// The sections of every step page, in order: a short label (side panel, eyebrow) and a heading.
export const stepSections = {
  why: { label: "Why", heading: "Why this step" },
  do: { label: "Do it", heading: "What to do" },
  see: { label: "See it work", heading: "What you should see" },
  break: { label: "Break it", heading: "Break it on purpose" },
  understand: { label: "Understand", heading: "What just happened" },
  quiz: { label: "Check yourself", heading: "Questions for review" },
} as const;

// The sections of the page after the last step.
export const finishSections = {
  built: { label: "What you built", heading: "What your app now does" },
  anatomy: { label: "The anatomy", heading: "How the pieces connect" },
  pattern: { label: "Reuse the pattern", heading: "The same shape fits other features" },
  questions: { label: "Questions", heading: "Questions you can now answer" },
  next: { label: "What's next", heading: "Before you stop, and after" },
} as const;
