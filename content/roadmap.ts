// The /roadmap page: what the lab teaches today, and what it doesn't yet.
// Words only; the layout lives in app/roadmap/page.tsx.
// Keep this honest: when a step or journey ships, change its status here.

export type Status = "covered" | "partly" | "not-yet";

export const journeys: { n: number; title: string; adds: string; status: "built" | "planned" | "upcoming" }[] = [
  { n: 1, title: "Build your first AI application", adds: "One model call, structured output, a check on every answer, a live URL.", status: "built" },
  { n: 2, title: "When should the model not decide?", adds: "Score a task with an LLM, then let plain code or a person make the call.", status: "planned" },
  { n: 3, title: "Is it good enough?", adds: "A set of real inputs with accepted answers, a script that scores your app, and the cost of each call.", status: "upcoming" },
  { n: 4, title: "Give it your data", adds: "Find the documents that matter and put them in the prompt (simple RAG).", status: "upcoming" },
  { n: 5, title: "Let it act", adds: "One tool the model can call, a loop, and a person approving before anything is saved.", status: "upcoming" },
];

// Why this order: each journey needs the one before. You can't tell whether your data (4)
// or an agent (5) made the app better without a way to measure it (3).
export const orderNote =
  "Each journey adds one capability to the same app, and needs the one before it. Measuring quality comes before adding data or agents: without it, you can't tell whether they helped.";

export const topics: {
  name: string;
  status: Status;
  now: { text: string; step?: number }[]; // what the lab teaches today, with the step that teaches it
  notYet?: string;
  journey?: number; // the journey planned to cover the rest
}[] = [
  {
    name: "How models work, just enough",
    status: "covered",
    now: [
      { text: "What an LLM and an API are", step: 2 },
      { text: "Why answers can be fluent and false (hallucination)", step: 2 },
      { text: "Your first model call, with a key", step: 5 },
      { text: "Temperature and why answers vary", step: 7 },
    ],
  },
  {
    name: "Shipping it: keys, server, Git, deploy",
    status: "covered",
    now: [
      { text: "Keep the key on the server", step: 6 },
      { text: "Version control with Git and GitHub", step: 9 },
      { text: "A live URL on Vercel", step: 10 },
    ],
  },
  {
    name: "Checking every answer",
    status: "covered",
    now: [
      { text: "Validate the shape with Zod, retry once, fail honestly", step: 8 },
      { text: "Catch a model that doesn't answer at all", step: 8 },
    ],
  },
  {
    name: "Prompting and structured output",
    status: "partly",
    now: [
      { text: "A prompt that asks for JSON in a fixed shape", step: 7 },
      { text: "A retry that tells the model what was wrong", step: 8 },
    ],
    notYet: "System instructions, token budgets, and routing tasks between models.",
    journey: 4,
  },
  {
    name: "Evals: measuring quality",
    status: "partly",
    now: [
      { text: "Decide what \"good enough\" means", step: 7 },
      { text: "Break it: see real failure modes on purpose", step: 5 },
      { text: "Log every failure with its reason", step: 8 },
    ],
    notYet: "A saved set of real inputs with accepted answers, and a script that scores your app against it.",
    journey: 3,
  },
  {
    name: "Cost and speed per call",
    status: "partly",
    now: [
      { text: "You pay per token; bigger models cost more", step: 1 },
      { text: "Model size trades quality for cost and speed", step: 2 },
      { text: "Every retry is another full call", step: 8 },
    ],
    notYet: "Measuring the tokens and cost of your own app's calls.",
    journey: 3,
  },
  {
    name: "When AI should, and shouldn't, decide",
    status: "partly",
    now: [{ text: "Where a person stays in the loop", step: 8 }],
    notYet: "A rubric for which decisions the model makes, and which plain code or a person makes.",
    journey: 2,
  },
  {
    name: "Context: giving the model your data (RAG)",
    status: "not-yet",
    now: [],
    notYet: "Finding the right documents and putting them in the prompt.",
    journey: 4,
  },
  {
    name: "Agents: letting the model act",
    status: "not-yet",
    now: [],
    notYet: "Tools the model can call, loops, and human approval before actions.",
    journey: 5,
  },
  {
    name: "Multi-agent systems",
    status: "not-yet",
    now: [],
    notYet: "Not planned yet. Added only if learners ask for it after Journey 5.",
  },
];
