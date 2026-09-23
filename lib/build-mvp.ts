// Turns a learner's choices into their MVP.
// Pure code, no model call: the same answers always produce the same MVP.
// Tested in tests/build-mvp.test.ts — no API key needed.
import { z } from "zod";
import { PATTERN_IDS, getPattern, type PatternId } from "@/content/app-patterns";

// The answers arrive in the page URL, so they are untrusted input.
// Zod checks them exactly the way it checks a model's reply.
const answer = (max: number) =>
  z
    .string({ error: "Please fill this in" })
    .trim()
    .min(2, { error: "Please write at least two characters" })
    .max(max, { error: `Please keep it under ${max} characters` });

export const IntakeSchema = z.object({
  pattern: z.enum(PATTERN_IDS, { error: "Pick an app type" }),
  input: answer(60),
  audience: answer(60),
  detail: z.string().trim().max(120, { error: "Please keep it under 120 characters" }).default(""),
});
export type Intake = z.infer<typeof IntakeSchema>;

// How the learner's screen should show the result.
export type Preview =
  | { kind: "points"; count: number }
  | { kind: "category"; categories: string[] }
  | { kind: "fields"; fields: { label: string; key: string }[] }
  | { kind: "text" }
  | { kind: "answer" };

export type Mvp = {
  pattern: PatternId;
  patternName: string;
  name: string;
  input: string;
  audience: string;
  prompt: string; // what the learner's app will send to the model
  outputExample: string; // the JSON shape it expects back
  schemaCode: string; // the Zod check the learner will write in step 8
  validationNote: string; // what that check protects against
  preview: Preview; // how the screen shows the result
  sampleText: string; // sample input shown on the preview screen
  resultShownAs: string; // the result, described in plain words
  demoHref: string; // the live demo, set up as this app
};

export type IntakeResult = { ok: true; intake: Intake } | { ok: false; message: string };

const FIELD_NAMES: Record<string, string> = {
  pattern: "App type",
  input: "What people put in",
  audience: "Who uses the result",
  detail: "Details",
};

// "billing, delivery ,, other" → ["billing", "delivery", "other"]  (max 8, no duplicates)
export function splitList(text: string): string[] {
  const items = text.split(",").map((t) => t.trim()).filter(Boolean);
  return [...new Set(items)].slice(0, 8);
}

// "Order number" → "order_number"
function toKey(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function fieldKeys(text: string): string[] {
  return [...new Set(splitList(text).map(toKey).filter(Boolean))];
}

function titleCase(text: string): string {
  return text
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function clampInt(text: string, min: number, max: number, fallback: number): number {
  const n = Number.parseInt(text, 10);
  return Number.isNaN(n) ? fallback : Math.min(max, Math.max(min, n));
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// Reads the raw values from the URL and checks them, including pattern-specific rules.
export function parseIntake(raw: Record<string, string | string[] | undefined>): IntakeResult {
  const parsed = IntakeSchema.safeParse({
    pattern: first(raw.pattern),
    input: first(raw.input),
    audience: first(raw.audience),
    detail: first(raw.detail) ?? "",
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: `${FIELD_NAMES[String(issue.path[0])] ?? "Answer"}: ${issue.message}` };
  }
  const intake = parsed.data;
  if (intake.pattern === "classify" && splitList(intake.detail).length < 2) {
    return { ok: false, message: "Details: list at least two categories, separated by commas." };
  }
  if (intake.pattern === "extract" && fieldKeys(intake.detail).length < 1) {
    return { ok: false, message: "Details: list at least one field to pull out." };
  }
  return { ok: true, intake };
}

export function buildMvp(intake: Intake): Mvp {
  const pattern = getPattern(intake.pattern)!; // safe: parseIntake already checked it
  const { input, audience } = intake;
  const title = titleCase(input);
  const base = {
    pattern: pattern.id,
    patternName: pattern.name,
    input,
    audience,
    sampleText: pattern.sampleText,
    resultShownAs: pattern.resultShownAs,
    demoHref: `/demo?${new URLSearchParams({
      pattern: pattern.id,
      input,
      audience,
      detail: intake.detail,
    }).toString()}`,
  };

  switch (intake.pattern) {
    case "summarise": {
      const n = clampInt(intake.detail, 1, 10, 3);
      return {
        ...base,
        name: `${title} Digest`,
        prompt: `Summarise the following ${input} into ${n} key points for ${audience}. Reply only with JSON: {"points": [${n} short strings]}.`,
        outputExample: JSON.stringify({ points: Array.from({ length: n }, (_, i) => `Key point ${i + 1}`) }),
        schemaCode: `z.object({ points: z.array(z.string()).length(${n}) })`,
        validationNote: `If Gemini returns more or fewer than ${n} points, Zod rejects the reply.`,
        preview: { kind: "points", count: n },
      };
    }
    case "classify": {
      const categories = splitList(intake.detail);
      return {
        ...base,
        name: `${title} Sorter`,
        prompt: `Read the following ${input} and choose exactly one category from: ${categories.join(", ")}. The result is for ${audience}. Reply only with JSON: {"category": "<one of the categories>"}.`,
        outputExample: JSON.stringify({ category: categories[0] }),
        schemaCode: `z.object({ category: z.enum([${categories.map((c) => JSON.stringify(c)).join(", ")}]) })`,
        validationNote: "If Gemini invents a category that isn't on your list, Zod rejects the reply.",
        preview: { kind: "category", categories },
      };
    }
    case "extract": {
      const labels = splitList(intake.detail);
      const keys = fieldKeys(intake.detail);
      return {
        ...base,
        name: `${title} Extractor`,
        prompt: `From the following ${input}, extract: ${labels.join(", ")}. The result is for ${audience}. Use null for any field that isn't present. Reply only with JSON using these keys: ${keys.join(", ")}.`,
        outputExample: JSON.stringify(Object.fromEntries(keys.map((k) => [k, "..."]))),
        schemaCode: `z.object({ ${keys.map((k) => `${k}: z.string().nullable()`).join(", ")} })`,
        validationNote: "A field that isn't in the text comes back as null instead of being made up.",
        preview: { kind: "fields", fields: labels.map((label, i) => ({ label, key: keys[i] ?? label })) },
      };
    }
    case "rewrite": {
      const goal = intake.detail || "a clearer version";
      return {
        ...base,
        name: `${title} Rewriter`,
        prompt: `Rewrite the following ${input} as ${goal}, for ${audience}. Reply only with JSON: {"text": "<the rewritten text>"}.`,
        outputExample: JSON.stringify({ text: "Your rewritten text..." }),
        schemaCode: "z.object({ text: z.string().min(1) })",
        validationNote: "An empty rewrite is rejected instead of being shown to the user.",
        preview: { kind: "text" },
      };
    }
    case "answer": {
      return {
        ...base,
        name: `${title} Q&A`,
        prompt: `Using only the ${input} below, answer the question for ${audience}. If the answer is not in the text, set "found" to false. Reply only with JSON: {"found": true or false, "answer": "<the answer>" or null}.`,
        outputExample: JSON.stringify({ found: true, answer: "..." }),
        schemaCode: "z.object({ found: z.boolean(), answer: z.string().nullable() })",
        validationNote:
          'When the answer isn\'t in the text, your app says so — "found": false — instead of guessing.',
        preview: { kind: "answer" },
      };
    }
  }
}

// A link that fills in a pattern's example answers.
export function exampleHref(patternId: PatternId): string {
  const p = getPattern(patternId)!;
  const q = new URLSearchParams({ pattern: p.id, ...p.example });
  return `/?${q.toString()}`;
}
