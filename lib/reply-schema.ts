// The shape each kind of app expects back from the model.
// Built from the learner's own answers, so a Classify app only accepts
// the categories they listed.
import { z } from "zod";
import type { Mvp } from "@/lib/build-mvp";

export function replySchema(mvp: Mvp) {
  const p = mvp.preview;
  switch (p.kind) {
    case "points":
      return z.object({ points: z.array(z.string().min(1)).length(p.count) });
    case "category":
      return z.object({ category: z.enum(p.categories as [string, ...string[]]) });
    case "fields":
      return z.object(
        Object.fromEntries(p.fields.map((f) => [f.key, z.string().nullable()])),
      ) as z.ZodType<Record<string, string | null>>;
    case "text":
      return z.object({ text: z.string().min(1) });
    case "answer":
      return z.object({ found: z.boolean(), answer: z.string().nullable() });
  }
}
