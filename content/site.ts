// What the lab is, in its own words. Shown at the top of the home page.
// Edit the wording here; app/page.tsx only decides the layout.

export const site = {
  eyebrow: "For product managers who want to go beyond prompting",
  headline: "Understand how AI apps actually work, by building one.",
  // The rolling line under the headline: questions PMs meet in real AI work, in plain words.
  // Each one is answered in Journey 1 (steps 2, 7, 2, 1–2, 8, 8). Keep six: app/globals.css times the loop for six.
  tickerLead: "You'll know",
  ticker: [
    "why it makes things up",
    "why answers vary",
    "what a bigger model buys",
    "why it takes seconds",
    "what to do when it fails",
    "when to trust the output",
  ],
  promise: "Not to become an engineer. To make better AI product calls, and hold real conversations with your engineers.",
  philosophy: "AI can write the code. You should still understand it.",

  // Different tools for different goals. A comparison, not a criticism.
  compare: {
    builders: { label: "AI app builders", examples: "Lovable, Replit, Bolt, v0, Cursor" },
    lab: { label: "This lab" },
    rows: [
      { label: "Built for", builders: "Getting an app built quickly", lab: "Understanding how AI apps are built" },
      { label: "What you do", builders: "Describe what you want; the tool writes and runs the code", lab: "Build step by step with real tools; every step explains the code" },
      { label: "You leave with", builders: "A working app", lab: "A working app, and knowing how it works underneath" },
      { label: "When something breaks", builders: "Ask the tool to fix it", lab: "Know where to look, and why it broke" },
    ],
  },
  format: {
    course: ["Watch", "learn", "maybe build later"],
    lab: ["See", "build", "understand", "get stuck", "debug", "ship"],
  },

  // What the learner leaves with. The app is the vehicle; this is the value.
  // Grouped by what a PM does with it. Each term is followed by what it means, not just its name.
  // Claim only what Journey 1 teaches; anything else goes in `notYet` and on /roadmap.
  understand: [
    {
      group: "How an AI app works",
      items: [
        { term: "The request path", meaning: "every hop from a user's input to the answer on screen" },
        { term: "LLMs and prompts", meaning: "why models predict, vary, and can be confidently wrong" },
        { term: "Structured output", meaning: "getting data your product can use, not just prose" },
      ],
    },
    {
      group: "How to make it trustworthy",
      items: [
        { term: "Validation and guardrails", meaning: "catch malformed answers before anyone sees them" },
        { term: "Failure handling", meaning: "when to retry, fall back, or tell the user" },
        { term: "Quality bars", meaning: "define \"good enough\" on real inputs, the first step to evals" },
      ],
    },
    {
      group: "How to make the product call",
      items: [
        { term: "Model, cost and latency", meaning: "what a bigger model buys, in money and waiting time" },
        { term: "What runs where", meaning: "why keys and logic stay on the server" },
        { term: "Human in the loop", meaning: "which outputs need a person before they save, send or charge" },
      ],
    },
  ],
  outcomeLine: "You won't become an engineer. You'll follow what your AI engineers are talking about, and ask the questions that change the decision.",
  stackLine: "Built with the real stack: Gemini, Node.js, Next.js, Git, GitHub, Vercel.",
  notYet: "Not in Journey 1: context windows, RAG, embeddings, tool calling and agents.",

  // What's underneath every app in the journey. The "what you see" side comes from the app you pick.
  underneath: ["Browser", "Next.js page", "Server", "AI API", "LLM", "Structured output", "Validation", "Back to the browser"],

  // Shown above the journey: what to have ready, and an honest word on time.
  // Replace with a measured time once the first testers have finished.
  before: {
    need: [
      "A laptop where you can install software (a locked-down work laptop may block it)",
      "A personal Google account, for the free Gemini key",
      "A free GitHub account, and later a free Vercel account",
    ],
    time: "Plan for more than one sitting. Setup (steps 3–5) takes longest the first time. Your place is remembered in this browser.",
  },

  providerNote: "We use Gemini because it's free to start. Everything here applies to OpenAI, Claude and others.",
};
