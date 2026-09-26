// What the lab is, in its own words. Shown at the top of the home page.
// Edit the wording here; app/page.tsx only decides the layout.

export const site = {
  eyebrow: "For product managers who want to go beyond prompting",
  headline: "Learn how AI applications are actually built.",
  promise: "Build a real AI app from an empty folder. You get the code; every step explains what's happening underneath.",
  // The rolling word under the headline, one layer at a time.
  layers: ["LLM", "API", "server", "secret key", "structured output", "validation", "Git", "deployment"],
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
  understand: [
    "What an LLM does inside an application",
    "How an app talks to a model through an API",
    "Why keys and logic live on the server",
    "What Node.js and Next.js actually do",
    "How to get structured output, and why to validate it",
    "What happens when the AI fails",
    "How Git, GitHub and deployment fit together",
    "How all the layers connect",
  ],
  outcomeLine: "You won't become a software engineer. You'll understand AI apps well enough to reason about them.",

  // What's underneath every app in the journey. The "what you see" side comes from the app you pick.
  underneath: ["Browser", "Next.js page", "Server", "AI API", "LLM", "Structured output", "Validation", "Screen"],

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
