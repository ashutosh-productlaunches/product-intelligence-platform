// The menu of apps a learner can build in Journey 1.
// Each pattern is one model call with a structured answer — exactly what Journey 1 teaches.
// To change what the menu offers, edit the text below. No code changes needed.

export const PATTERN_IDS = ["summarise", "classify", "extract", "rewrite", "answer"] as const;
export type PatternId = (typeof PATTERN_IDS)[number];

export type Pattern = {
  id: PatternId;
  name: string;
  does: string;
  examples: string[];
  // Question 3 changes with the pattern. null means this pattern doesn't need it.
  detail: { label: string; hint: string } | null;
  // Example answers: shown as placeholders, and used by "Use the example answers".
  example: { input: string; audience: string; detail: string };
  // Sample text shown in the preview screen, so a learner can see the shape of the app.
  sampleText: string;
  // How the result is shown on screen, in plain words.
  resultShownAs: string;
};

export const patterns: Pattern[] = [
  {
    id: "summarise",
    name: "Summarise",
    does: "Long text → the key points",
    examples: ["Complaint digest", "Meeting notes", "Review roundup"],
    detail: { label: "How many key points?", hint: "A number from 1 to 10" },
    example: { input: "customer complaints", audience: "the support lead", detail: "3" },
    sampleText: "Order #4471 arrived three days late.\nStill waiting on a refund for #4410.\nThe support chat was quick and helpful.",
    resultShownAs: "a short list of key points",
  },
  {
    id: "classify",
    name: "Classify",
    does: "Text → one of your categories",
    examples: ["Ticket routing", "Feedback tagging", "Lead triage"],
    detail: { label: "What are your categories?", hint: "Separate them with commas — at least two" },
    example: {
      input: "support tickets",
      audience: "the support team",
      detail: "billing, delivery, product, other",
    },
    sampleText: "My card was charged twice for order #4471 and I need one of them back.",
    resultShownAs: "the chosen category, highlighted",
  },
  {
    id: "extract",
    name: "Extract",
    does: "Messy text → specific fields",
    examples: ["Order details from emails", "Fields from a purchase order", "Contacts from notes"],
    detail: { label: "Which fields should it pull out?", hint: "Separate them with commas" },
    example: {
      input: "customer emails",
      audience: "the operations team",
      detail: "order number, issue, requested action",
    },
    sampleText: "Hi — order #4471 arrived damaged on Tuesday. I would like a replacement, not a refund.",
    resultShownAs: "a small table of fields",
  },
  {
    id: "rewrite",
    name: "Rewrite",
    does: "Text + a goal → new text",
    examples: ["Reply drafts", "Release notes", "Tone fixes"],
    detail: { label: "What should the rewrite achieve?", hint: "e.g. a polite reply, plain English" },
    example: { input: "customer complaints", audience: "the customer", detail: "a polite, helpful reply" },
    sampleText: "this is the third time im writing about order 4471 and no one has replied. sort it out.",
    resultShownAs: "the rewritten text, ready to copy",
  },
  {
    id: "answer",
    name: "Answer from text",
    does: "Question + pasted text → an answer, or “not in the text”",
    examples: ["Policy Q&A", "Spec lookup", "Contract questions"],
    detail: null,
    example: { input: "returns policy", audience: "store staff", detail: "" },
    sampleText: "Items can be returned within 30 days if unused. Sale items are final. Refunds take 5 working days.",
    resultShownAs: "the answer, or a clear \u201cnot in the text\u201d",
  },
];

export function getPattern(id: string | undefined): Pattern | undefined {
  return patterns.find((p) => p.id === id);
}
