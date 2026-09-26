// The system map at /architecture, as data.
// Every box, arrow and flow on that page comes from this file. To keep the map true,
// change the data here, never the drawing: when a Journey 2 step ships, flip its
// status from "next" to "live" and the box turns solid.
//
// Coordinates are pixels on a fixed 1100 × 735 canvas.

export type NodeStatus = "live" | "next" | "doc";

export type SystemNode = {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  w: number;
  h: number;
  status: NodeStatus;
  file?: string;
  step?: string;
  owner?: "you" | "assistant";
  mono?: boolean; // label is a file or function name
  contract?: boolean; // the box is a schema
  checks?: boolean; // validates incoming data with Zod
  what: string;
  why: string;
};

export type SystemEdge = {
  id: string;
  points: [number, number][];
  label?: string;
  labelAt?: [number, number];
  dashed?: boolean;
};

export type Flow = {
  id: string;
  title: string;
  intro: string;
  nodes: string[];
  edges: string[];
  steps: string[];
};

export const CANVAS = { width: 1100, height: 735 };

export const zones = [
  { label: "BROWSER", x: 10, y: 20, w: 230, h: 570 },
  { label: "NEXT.JS APP · VERCEL", x: 260, y: 20, w: 600, h: 570 },
  { label: "GOOGLE", x: 870, y: 20, w: 220, h: 570 },
  { label: "BUILD, TEST AND SHIP", x: 10, y: 605, w: 1080, h: 115 },
];

export const columns = [
  { label: "PAGES (SERVER)", x: 290 },
  { label: "LOGIC", x: 480 },
  { label: "CONTRACTS · DATA · CONFIG", x: 680 },
];

export const nodes: SystemNode[] = [
  // Browser
  {
    id: "b-journey", label: "Journey page", sub: "12 steps + closing panel", x: 30, y: 70, w: 190, h: 52, status: "live", file: "/",
    what: "The learning path. Journey 1 has 12 steps, the last one giving the learner's app a look of their choice. Each one runs problem, idea, do, see, why, with the real snags, exact commands and full code.",
    why: "A PM learns AI engineering fastest by building one real tool, so the page teaches through the learner's own app, not a generic example.",
  },
  {
    id: "b-intake", label: "Intake", sub: "5 patterns, 3 questions", x: 30, y: 140, w: 190, h: 52, status: "live", file: "components/intake.tsx",
    what: "The learner picks summarise, classify, extract, rewrite or answer-from-text, then answers three questions.",
    why: "Gives every learner an MVP of their own. Steps 1, 7, 8 and 11 then show that learner's prompt and schema.",
  },
  {
    id: "b-url", label: "URL state", sub: "answers live in the link", x: 30, y: 210, w: 190, h: 52, status: "live",
    what: "The intake answers and the demo's tool and text travel in the page URL. Forms reload the page with them.",
    why: "No database and no browser storage, so there's nothing to host, secure or pay for, and every state can be bookmarked or shared.",
  },
  {
    id: "b-demo", label: "/demo", sub: "paste text, press Run", x: 30, y: 300, w: 190, h: 52, status: "live", file: "/demo",
    what: "The live tool, in the Transmutation look. Pick a tool, paste text, press Run, and get a checked answer with its run time and token count. Behind it, words from your text flow into a ring and out as data: the one piece of JavaScript the site sends to the browser.",
    why: "Shows the finished result first, so a learner sees what they'll build before step 1. It's also the cheapest thing to put in front of a real PM.",
  },
  {
    id: "b-classify", label: "Classifier screen", sub: "step 1.8", x: 30, y: 420, w: 190, h: 52, status: "next", step: "1.8", owner: "assistant",
    what: "Where a user describes one capability, sets three gate toggles and sees the verdict: the class, whether a person must approve each output, the six scores with justifications, and any warnings.",
    why: "Makes the rubric usable by someone who has never read it, and shows assumed scores as assumptions.",
  },
  // Pages (server components)
  {
    id: "r-journey", label: "app/page.tsx", sub: "server component", x: 290, y: 70, w: 150, h: 52, status: "live", mono: true, checks: true, file: "app/page.tsx",
    what: "Runs on the server. Checks the intake answers from the URL, passes them to build-mvp, and renders the steps from content/ as plain HTML.",
    why: "No JavaScript runs in the browser for this page. Content lives in data files, so a new journey means new content, not new UI.",
  },
  {
    id: "r-demo", label: "app/demo/page.tsx", sub: "server component", x: 290, y: 300, w: 150, h: 52, status: "live", mono: true, checks: true, file: "app/demo/page.tsx",
    what: "Runs on the server. Reads the tool and text from the URL, rebuilds the MVP and prompt, calls run-demo, and renders the result.",
    why: "The browser never sends a prompt. If it could, anyone could use your Gemini key as a free chatbot or slip in their own instructions.",
  },
  {
    id: "r-classify", label: "/api/classify", sub: "step 1.7", x: 290, y: 420, w: 150, h: 52, status: "next", mono: true, checks: true, step: "1.7", owner: "assistant", file: "app/api/classify/route.ts",
    what: "Checks the gates, asks the provider for scores, merges scores and gates into a Capability, calls classify() and returns the verdict.",
    why: "The only place the two halves meet. The model's half and the user's half stay apart until here, so the model can never see the gates.",
  },
  // Logic
  {
    id: "l-build", label: "build-mvp.ts", sub: "answers → MVP", x: 480, y: 140, w: 160, h: 52, status: "live", mono: true, checks: true, file: "lib/build-mvp.ts",
    what: "Checks the answers with IntakeSchema, then turns them into an MVP: name, prompt, output shape and Zod schema.",
    why: "Plain code, no LLM. It gives the same answer every time, costs nothing and is covered by tests. It's the rubric's AI Necessity principle, applied to your own site.",
  },
  {
    id: "l-run", label: "run-demo.ts", sub: "calls Gemini", x: 480, y: 300, w: 160, h: 52, status: "live", mono: true, checks: true, file: "lib/run-demo.ts",
    what: "Limits the text to 2,000 characters, sends the prompt to Gemini with the server-side key, and checks the reply against the reply schema. If the check fails it retries once; if that fails too, it stops.",
    why: "One place owns the model call. A bad reply shows as 'Fixed on retry' or 'Stopped', never as a made-up answer.",
  },
  {
    id: "l-provider", label: "Provider", sub: "step 1.6 · typed call", x: 480, y: 420, w: 160, h: 52, status: "next", checks: true, step: "1.6", owner: "assistant", file: "file name decided in step 1.6",
    what: "Sends the description plus rubric sections 1–2 to Gemini and returns six scores that passed the RubricDimensions schema.",
    why: "Keeps the vendor in one place. Switching to another model changes one file, and nothing downstream ever handles raw model text.",
  },
  {
    id: "l-classify", label: "classify()", sub: "step 1.4 · rubric rules", x: 480, y: 510, w: 160, h: 52, status: "next", mono: true, step: "1.4", owner: "you",
    what: "A pure function: Capability in, SuitabilityVerdict out. Applies the six mapping rules in order (first match wins), then the human-in-the-loop overlay and the warnings.",
    why: "Rules in code are repeatable, auditable and testable without an API key. The model scores; it never decides the class.",
  },
  // Contracts, data, config
  {
    id: "c-content", label: "content/", sub: "journey text as data", x: 680, y: 70, w: 160, h: 52, status: "doc", mono: true, file: "content/journey-01.ts · content/app-patterns.ts",
    what: "Journey step text, commands and code, plus the five app patterns, stored as data.",
    why: "Easy to edit and review without touching page code.",
  },
  {
    id: "c-key", label: "Gemini API key", sub: ".env.local + Vercel", x: 680, y: 140, w: 160, h: 52, status: "doc", file: ".env.local · Vercel environment variable",
    what: "The Gemini API key: .env.local on your laptop, an environment variable on Vercel.",
    why: "Server-side only. It never reaches the browser, so no visitor can read it.",
  },
  {
    id: "c-reply", label: "reply-schema.ts", sub: "shape a reply must fit", x: 680, y: 220, w: 160, h: 52, status: "live", mono: true, contract: true, file: "lib/reply-schema.ts",
    what: "Builds the Zod schema a reply must match, from the learner's MVP. A Classify app only accepts the categories the learner listed.",
    why: "Model output is probabilistic. A reply of the wrong shape becomes an error, never a fake answer on screen.",
  },
  {
    id: "c-capability", label: "capability.ts", sub: "step 1.3 · input contract", x: 680, y: 345, w: 160, h: 52, status: "next", mono: true, contract: true, step: "1.3", owner: "you", file: "schemas/capability.ts",
    what: "Dimension, RubricDimensions (six scores), Gates (three booleans) and Capability, each with its TypeScript type.",
    why: "Rejects scores outside 1–5, scores sent as text, missing dimensions and empty justifications before any rule runs.",
  },
  {
    id: "c-verdict", label: "verdict.ts", sub: "step 1.3 · output contract", x: 680, y: 510, w: 160, h: 52, status: "next", mono: true, contract: true, step: "1.3", owner: "you", file: "schemas/verdict.ts",
    what: "SuitabilityClass (5 values), Warning (3 values) and SuitabilityVerdict.",
    why: "Your rule code can't return a class that doesn't exist, and the screen knows exactly what it will receive.",
  },
  // External
  {
    id: "x-gemini", label: "Gemini", sub: "gemini-3.6-flash · free tier", x: 890, y: 290, w: 180, h: 180, status: "live", file: "@google/genai",
    what: "Google's model. Called by the demo today, and by the classifier from step 1.6.",
    why: "The only probabilistic part of the system and the only thing outside your code. That's why every reply from it ends at a schema check.",
  },
  // Build, test and ship
  {
    id: "d-github", label: "GitHub repo", sub: "public", x: 30, y: 640, w: 170, h: 52, status: "live", owner: "you", file: "ashutosh-productlaunches/product-intelligence-platform",
    what: "The public repo. You commit from your own machine.",
    why: "Public history is portfolio evidence: each commit records a decision and the reason for it.",
  },
  {
    id: "d-vercel", label: "Vercel", sub: "hosting", x: 230, y: 640, w: 170, h: 52, status: "live", file: "product-intelligence-platform-kohl.vercel.app",
    what: "Hosts the live site from the GitHub repo, with the API key as an environment variable.",
    why: "Free hosting, no servers to run, and a live link to share after every step.",
  },
  {
    id: "d-vitest", label: "Vitest", sub: "npm test", x: 430, y: 640, w: 170, h: 52, status: "live", owner: "you", file: "tests/",
    what: "Unit tests for pure functions: build-mvp today, classify() next. You run them on Windows.",
    why: "Tests need no network and no API key, so the rules are proven before any model is involved.",
  },
  {
    id: "d-fixtures", label: "15 fixtures", sub: "step 1.5 · hand-scored", x: 630, y: 640, w: 170, h: 52, status: "next", step: "1.5", owner: "you",
    what: "Fifteen capabilities you score by hand, each with the class you expect.",
    why: "Written separately from the rubric, so the tests check the rubric instead of restating it. Your judgement is the ground truth.",
  },
  {
    id: "d-rubric", label: "Rubric v1.0", sub: "source of truth", x: 850, y: 640, w: 220, h: 52, status: "doc", owner: "you", file: "docs/ai-suitability-rubric.md",
    what: "Six dimensions, three gates, five classes, the mapping rules, the overlay and the warnings.",
    why: "classify() implements section 5. The prompt uses sections 1–2 only, so the model can't score backwards from a class.",
  },
];

export const edges: SystemEdge[] = [
  { id: "e1", points: [[220, 96], [288, 96]], label: "open", labelAt: [232, 90] },
  { id: "e2", points: [[440, 96], [678, 96]], label: "reads steps", labelAt: [530, 90] },
  { id: "e3", points: [[125, 192], [125, 208]] },
  { id: "e4", points: [[220, 236], [262, 236], [262, 112], [288, 112]], label: "answers", labelAt: [224, 252] },
  { id: "e5", points: [[440, 112], [460, 112], [460, 166], [478, 166]] },
  { id: "e6", points: [[640, 166], [660, 166], [660, 246], [678, 246]] },
  { id: "e7", points: [[220, 312], [288, 312]], label: "tool + text", labelAt: [225, 306] },
  { id: "e8", points: [[288, 338], [222, 338]], label: "answer", labelAt: [236, 352] },
  { id: "e9", points: [[440, 326], [478, 326]] },
  { id: "e10", points: [[640, 312], [888, 312]], label: "prompt", labelAt: [700, 306] },
  { id: "e11", points: [[888, 336], [642, 336]], label: "JSON reply", labelAt: [700, 331] },
  { id: "e12", points: [[620, 300], [620, 258], [678, 258]], label: "check", labelAt: [584, 286] },
  { id: "e13", points: [[220, 432], [288, 432]], label: "text + gates", labelAt: [224, 426] },
  { id: "e14", points: [[288, 458], [222, 458]], label: "verdict", labelAt: [236, 472] },
  { id: "e15", points: [[440, 446], [478, 446]] },
  { id: "e16", points: [[640, 432], [888, 432]], label: "description only", labelAt: [700, 426] },
  { id: "e17", points: [[888, 456], [642, 456]], label: "6 scores", labelAt: [700, 470] },
  { id: "e18", points: [[620, 420], [620, 371], [678, 371]], label: "check", labelAt: [584, 404] },
  { id: "e19", points: [[365, 472], [365, 536], [478, 536]], label: "Capability", labelAt: [374, 530] },
  { id: "e20", points: [[640, 536], [678, 536]] },
  { id: "e21", points: [[200, 666], [228, 666]] },
  { id: "e22", points: [[630, 666], [602, 666]] },
  { id: "e23", points: [[850, 666], [802, 666]] },
  { id: "e24", points: [[560, 640], [560, 564]], dashed: true, label: "tests", labelAt: [566, 604] },
  { id: "e25", points: [[400, 300], [400, 180], [478, 180]], label: "same MVP", labelAt: [406, 196] },
];

export const flows: Flow[] = [
  {
    id: "learn",
    title: "Learn: Journey 1",
    intro: "How a learner goes from five choices to a page that shows their own prompt and schema. No model is called.",
    nodes: ["b-intake", "b-url", "b-journey", "r-journey", "c-content", "l-build", "c-reply"],
    edges: ["e3", "e4", "e1", "e2", "e5", "e6"],
    steps: [
      "The learner picks a pattern and answers three questions in the intake.",
      "The form reloads the page with the answers in the URL. No database.",
      "app/page.tsx checks the answers and renders the steps from content/.",
      "build-mvp.ts turns the answers into the learner's MVP: name, prompt and output shape.",
      "The same answers define the reply schema. Steps 1, 7, 8 and 11 show this prompt and schema.",
    ],
  },
  {
    id: "demo",
    title: "Demo run",
    intro: "What happens between pressing Run and seeing an answer.",
    nodes: ["b-demo", "r-demo", "l-build", "l-run", "x-gemini", "c-reply", "c-key"],
    edges: ["e7", "e25", "e9", "e10", "e11", "e12", "e8"],
    steps: [
      "The form sends only the chosen tool and the pasted text, in the URL. Never a prompt.",
      "app/demo/page.tsx runs on the server and rebuilds the MVP and prompt with build-mvp.",
      "run-demo.ts checks the text length and calls Gemini with the key held on the server.",
      "Gemini returns JSON.",
      "The reply is checked against the reply schema. If it fails, run-demo retries once, then stops.",
      "The page renders the answer, run time and token count as plain HTML.",
    ],
  },
  {
    id: "classify",
    title: "Classify: Journey 2 (planned)",
    intro: "The path your schemas protect. The model scores; code decides.",
    nodes: ["b-classify", "r-classify", "l-provider", "x-gemini", "c-capability", "l-classify", "c-verdict"],
    edges: ["e13", "e15", "e16", "e17", "e18", "e19", "e20", "e14"],
    steps: [
      "The user describes one capability and sets three gates.",
      "/api/classify checks the gates against the Gates schema.",
      "The provider sends only the description and rubric sections 1–2 to Gemini. Never the gates or the rules.",
      "Gemini returns six scores, and RubricDimensions checks them.",
      "The route merges scores and gates into a Capability.",
      "classify() applies the section 5 rules (first match wins), then the overlay and the warnings.",
      "The SuitabilityVerdict goes back to the screen.",
    ],
  },
  {
    id: "ship",
    title: "Build and ship",
    intro: "How a change gets proven and goes live.",
    nodes: ["d-rubric", "d-fixtures", "d-vitest", "l-classify", "d-github", "d-vercel"],
    edges: ["e23", "e22", "e24", "e21"],
    steps: [
      "The rubric defines the rules.",
      "You hand-score 15 fixtures with the class you expect.",
      "Vitest runs classify() against every fixture. No API key needed.",
      "You commit to GitHub.",
      "Vercel serves the new version at the live link.",
    ],
  },
];

export const getFlow = (id: string | undefined) => flows.find((f) => f.id === id);
