// The /why page: why the lab exists, where it's going, and what PMs want next.
// Words only; the layout lives in app/why/page.tsx.

export const why = {
  title: "Why I built this",
  // His LinkedIn profile URL, e.g. "https://www.linkedin.com/in/your-name". The link stays hidden while empty.
  linkedin: "https://www.linkedin.com/in/a123mishra/",

  // His words (2 Oct, second version). Keep them his: edit wording only with him.
  story: {
    opening: [
      "I'm a product manager working on B2B SaaS and AI products. I built AI Tool Lab because I ran into a problem I couldn't solve by reading another AI strategy article.",
      "I knew how to think about AI products. I could write PRDs, define use cases, work with engineers, and evaluate whether an AI feature made sense.",
      "But I wanted to understand what was actually happening underneath.",
    ],
    questions: [
      "What does an AI application really look like?",
      "How does it call a model?",
      "How do you give it your own data?",
      "How do you measure whether it's actually working?",
      "When should the model decide, and when absolutely shouldn't it?",
    ],
    middle: [
      "So I started building.",
      "The first thing I built was a very basic AI app: the same one you'll build in Journey 1. Then I kept taking that same app further.",
      "That's what became AI Tool Lab.",
      "There's plenty out there teaching PMs AI strategy, prompting and use cases. What I found much harder to find was hands-on technical training that helps a PM understand how AI products actually work.",
      "That's the gap I'm trying to fill.",
    ],
    goal: {
      lead: "The goal isn't to turn PMs into ML engineers. It's to make them technically fluent enough to:",
      items: [
        "understand what their engineers are building",
        "make better AI product decisions",
        "prototype ideas themselves",
        "recognise what's technically difficult or easy",
        "work confidently on AI products, rather than treating the technology as a black box",
      ],
    },
  },

  future: {
    lead: "Journey 1 starts with a basic AI application. Each journey takes that same application further:",
    path: ["Build", "Add constraints", "Measure quality", "Use your own data", "Let AI take action"],
    evolve: "The lab will evolve based on what PMs actually need.",
  },

  form: {
    title: "Tell me what you need",
    invite: "If you're working on AI products, moving into AI product work, or simply curious about how AI applications really work, I'd love to know what you'd want to learn next.",
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
