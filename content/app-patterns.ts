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
  // Only the answer tool needs a question alongside the text.
  asksQuestion?: boolean;
  // Example answers: shown as placeholders, and used by "Use the example answers".
  example: { input: string; audience: string; detail: string };
  // Sample text shown in the preview screen, so a learner can see the shape of the app.
  sampleText: string;
  // How the result is shown on screen, in plain words.
  resultShownAs: string;
  // One-click examples under the input box, so nobody has to think of test data.
  samples: { label: string; text: string }[];
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
    samples: [
      { label: "Delivery delays", text: "Order #4471 arrived three days late.\nStill waiting on a refund for #4410.\nThe support chat was quick and helpful." },
      { label: "Mixed feedback", text: "Setup took ten minutes and the app is fast.\nBut the mobile view breaks on my phone.\nSupport replied within the hour, which was good." },
      { label: "Weekly digest", text: "Three customers asked for bulk export this week.\nTwo reported slow search.\nOne cancelled, citing price." },
    ],
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
    samples: [
      { label: "Double charge", text: "My card was charged twice for order #4471 and I need one of them back." },
      { label: "Late delivery", text: "It has been nine days and the parcel still has not arrived." },
      { label: "Praise", text: "Just wanted to say the new packaging is lovely, well done." },
    ],
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
    samples: [
      { label: "Damaged item", text: "Hi — order #4471 arrived damaged on Tuesday. I would like a replacement, not a refund." },
      { label: "Refund chase", text: "Following up on #4410 again. Returned it two weeks ago, still no refund. Please refund to the original card." },
      { label: "Wrong size", text: "The jacket in order 4502 is a medium but I ordered large. Happy to exchange." },
    ],
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
    samples: [
      { label: "Angry chaser", text: "this is the third time im writing about order 4471 and no one has replied. sort it out." },
      { label: "Blunt update", text: "Delayed. Warehouse issue. Nothing we can do until next week." },
      { label: "Jargon-heavy", text: "Per our SLA the RMA is pending QC disposition at the 3PL before credit memo issuance." },
    ],
  },
  {
    id: "answer",
    asksQuestion: true,
    name: "Answer from text",
    does: "Question + pasted text → an answer, or “not in the text”",
    examples: ["Policy Q&A", "Spec lookup", "Contract questions"],
    detail: null,
    example: { input: "returns policy", audience: "store staff", detail: "" },
    sampleText: "Items can be returned within 30 days if unused. Sale items are final. Refunds take 5 working days.",
    resultShownAs: "the answer, or a clear \u201cnot in the text\u201d",
    samples: [
      { label: "Returns policy", text: "Items can be returned within 30 days if unused. Sale items are final. Refunds take 5 working days." },
      { label: "Delivery terms", text: "Standard delivery is 3-5 working days. Express is next day if ordered before 2pm. We do not deliver on Sundays." },
      { label: "Warranty", text: "All devices carry a 12-month warranty covering manufacturing defects. Accidental damage is not covered." },
    ],
  },
];

export function getPattern(id: string | undefined): Pattern | undefined {
  return patterns.find((p) => p.id === id);
}
