// Runs the live demo: one Gemini call, checked before anything reaches the screen.
//
// Two rules this file exists to enforce:
//  1. The prompt is built here, on the server, from answers we have validated.
//     The browser never sends a prompt, so nobody can turn this into a free AI service.
//  2. Nothing is shown to the user until Zod says the reply has the right shape.
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { buildMvp, type Intake } from "@/lib/build-mvp";
import { replySchema } from "@/lib/reply-schema";

export const MAX_TEXT = 2000;

export const TextSchema = z
  .string({ error: "Paste some text first" })
  .trim()
  .min(10, { error: "Paste a little more text — at least 10 characters" })
  .max(MAX_TEXT, { error: `Keep it under ${MAX_TEXT} characters for the demo` });

// What the run cost and how long it took — shown in the demo's footer,
// because cost and latency are part of designing an AI product.
export type RunMeta = { ms: number; calls: number; inputTokens: number; outputTokens: number; model: string };

export type DemoResult =
  | { ok: true; data: Record<string, unknown>; repaired: boolean; meta: RunMeta }
  | { ok: false; kind: "input" | "shape" | "quota" | "offline"; message: string; meta?: RunMeta };

// Models sometimes wrap JSON in ```json fences or a sentence. Strip the obvious cases.
function toJson(raw: string): unknown | undefined {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return undefined;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return undefined;
  }
}

export async function runDemo(intake: Intake, rawText: string, question?: string): Promise<DemoResult> {
  const text = TextSchema.safeParse(rawText);
  if (!text.success) return { ok: false, kind: "input", message: text.error.issues[0].message };

  const mvp = buildMvp(intake);
  const schema = replySchema(mvp);
  const ai = new GoogleGenAI({});
  const model = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

  const started = Date.now();
  const meta: RunMeta = { ms: 0, calls: 0, inputTokens: 0, outputTokens: 0, model };

  // The answer tool needs a question as well as the text.
  const askedQuestion = (question ?? "").trim().slice(0, 200);
  const questionLine = askedQuestion ? `Question: ${askedQuestion}` : "";

  const ask = async (correction?: string) => {
    const response = await ai.models.generateContent({
      model,
      contents: [mvp.prompt, questionLine, "---", text.data, correction ?? ""].filter(Boolean).join("\n\n"),
      config: { responseMimeType: "application/json", temperature: 0 },
    });
    meta.calls += 1;
    meta.inputTokens += response.usageMetadata?.promptTokenCount ?? 0;
    meta.outputTokens += response.usageMetadata?.candidatesTokenCount ?? 0;
    meta.ms = Date.now() - started;
    return response.text ?? "";
  };

  const check = (raw: string) => {
    const json = toJson(raw);
    if (json === undefined) return { ok: false as const, problem: "that was not valid JSON" };
    const parsed = schema.safeParse(json);
    if (parsed.success) return { ok: true as const, data: parsed.data as Record<string, unknown> };
    return {
      ok: false as const,
      problem: parsed.error.issues.map((i) => `${i.path.join(".") || "reply"}: ${i.message}`).join("; "),
    };
  };

  try {
    const first = check(await ask());
    if (first.ok) return { ok: true, data: first.data, repaired: false, meta };

    // One repair attempt, and the model is told exactly what was wrong.
    const second = check(
      await ask(
        `Your previous reply could not be used (${first.problem}). Reply again with JSON only, in exactly the shape asked for.`,
      ),
    );
    if (second.ok) return { ok: true, data: second.data, repaired: true, meta };

    return {
      ok: false,
      kind: "shape",
      message:
        "The model replied in the wrong shape twice. The check caught it, so nothing unreliable was shown — which is the whole point of step 8.",
      meta,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Print the real reason in the terminal running `npm run dev`, and show it on
    // screen while developing. Users in production get a plain message instead.
    console.error("[demo] model call failed:", message);
    if (process.env.NODE_ENV !== "production") {
      return { ok: false, kind: "offline", message: `Model call failed: ${message}`, meta };
    }
    if (/quota|rate limit|429|RESOURCE_EXHAUSTED/i.test(message)) {
      return {
        ok: false,
        kind: "quota",
        message: "Today's free quota is used up. Try again tomorrow — the shape below is what a result looks like.",
      };
    }
    return { ok: false, kind: "offline", message: "Couldn't reach the model just now. Try again in a moment." };
  }
}
