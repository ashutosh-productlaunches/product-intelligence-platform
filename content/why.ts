// The /why page: why the lab exists, where it's going, and what PMs want next.
// Words only; the layout lives in app/why/page.tsx.
//
// DRAFT: `story` is a placeholder written by the assistant. Replace it with your
// own words before this page goes live. It must be true and sound like you.

export const why = {
  title: "Why I built this",
  intro: "Built by a product manager, for product managers.",

  story: [
    "AI features were landing on product roadmaps faster than most PMs could reason about them. I could use the words, but I couldn't always answer the questions that decide a launch: why the same input gives a different answer, what a bigger model actually buys, what should happen when the model is wrong.",
    "Courses gave me vocabulary. Building gave me understanding. So I built an AI app myself, one layer at a time, and turned that path into this lab.",
    "The goal isn't to turn PMs into engineers. It's to understand AI apps well enough to make better product calls, and to hold real conversations with the engineers who build them.",
  ],

  future: {
    lead: "Journey 1 is live. Next comes Journey 2: when the model shouldn't decide. After that, measuring quality, using your own data, and letting AI act, in that order.",
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
