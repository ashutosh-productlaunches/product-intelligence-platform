// What the lab is, in its own words. Shown at the top of the home page.
// Edit the wording here; app/page.tsx only decides the layout.

export const site = {
  eyebrow: "For product managers who want to go beyond prompting",
  headline: "Learn how AI applications are actually built.",
  promise: "Build a real AI application from an empty folder, and understand every layer underneath it.",
  audience:
    "For PMs who already use ChatGPT or Claude, work closely with engineers, and want to know what's happening underneath. You don't need a software engineering background, just curiosity and a willingness to build.",
  philosophy: "AI can write the code. You should still understand it.",

  // Different tools for different goals. No criticism of either.
  goals: [
    { goal: "get an app built quickly", answer: "AI app builders such as Lovable, Replit, Bolt, v0 or Cursor are excellent at this." },
    { goal: "understand how AI applications are built", answer: "That's what this lab is for. You build with real tools, and every step explains what's happening." },
  ],
  format: {
    course: ["Watch", "learn", "maybe build later"],
    lab: ["See", "build", "understand", "get stuck", "debug", "ship"],
  },

  // What the learner leaves with. The app is the vehicle; this is the value.
  understand: [
    "What an LLM does inside an application",
    "How an application talks to an AI model",
    "What an API actually is",
    "Why server-side logic exists",
    "Why API keys must stay secret",
    "What Node.js and Next.js provide",
    "How to get structured output from an AI",
    "Why AI responses need validation",
    "What happens when the AI fails",
    "How Git and GitHub fit into development",
    "How deployment works",
    "How all the layers fit together",
  ],
  outcomeLine: "You won't become a software engineer. You'll become a PM who understands AI applications well enough to reason about them.",

  // The demo as a hook: what you see, then what's underneath.
  demo: {
    sees: ["Customer complaints", "AI", "Key points"],
    underneath: ["Browser", "Next.js page", "Server", "AI API", "LLM", "Structured output", "Validation", "Screen"],
  },

  providerNote: "We use Gemini because it's free to start. Everything here applies to OpenAI, Claude and others.",
};
