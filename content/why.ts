// The /why page: why the lab exists, where it's going, and what PMs want next.
// Words only; the layout lives in app/why/page.tsx.

export const why = {
  title: "Why I built this",
  intro: "Built by a product manager, for product managers.",

  // In his words (2 Oct). Keep it true to what he said: learning AI to build, not just to interview;
  // a basic app that matures each journey; hands-on technical training, not AI strategy.
  story: [
    "I wanted to learn AI properly. Not just enough to get through an AI interview, but enough to understand the tech, so I could build something myself without getting stuck the moment I hit something I didn't understand.",
    "So I started with a very basic AI app: the one you build in Journey 1. Each journey takes the same app further, and the lab grows with it.",
    "There's plenty out there on AI strategy, so this lab doesn't teach it. What PMs rarely get is hands-on, technical AI training. That's the gap it fills.",
    "The goal: PMs who are AI fluent, who can get into AI product work and perform well once they're there.",
  ],

  future: {
    lead: "Journey 1 is the basic app. Each journey matures it: next, when the model shouldn't decide; then measuring quality, using your own data, and letting AI act.",
    ask: "What gets built depends on what PMs actually need. That's what the form below is for.",
  },

  form: {
    title: "Tell me what you need",
    privacy: "Goes to a private sheet only I read. Email is optional, and only used to reply to you.",
    roles: [
      { value: "shipping", label: "I'm a PM on a team shipping AI features" },
      { value: "moving", label: "I'm preparing to move into AI product work" },
      { value: "curious", label: "I'm curious how AI apps work" },
      { value: "other", label: "Something else" },
    ],
    next: [
      { value: "j2-decide", label: "When AI should and shouldn't decide (Journey 2)" },
      { value: "j3-evals", label: "Measuring quality: evals (Journey 3)" },
      { value: "j4-data", label: "Using your own data: RAG (Journey 4)" },
      { value: "j5-act", label: "Letting AI act: tools and agents (Journey 5)" },
      { value: "other", label: "Something else" },
    ],
    messageLabel: "What would make the lab more useful to you?",
    messageHint: "Something missing, confusing, or worth adding. Be blunt.",
    thanks: "Thank you. I read every answer.",
  },
} as const;
