// Tests for buildMvp: pure code, so no API key and no network.
import { describe, expect, it } from "vitest";
import { buildMvp, parseIntake } from "@/lib/build-mvp";

function mvpFrom(raw: Record<string, string>) {
  const result = parseIntake(raw);
  if (!result.ok) throw new Error(result.message);
  return buildMvp(result.intake);
}

describe("parseIntake", () => {
  it("accepts a complete answer", () => {
    expect(parseIntake({ pattern: "summarise", input: "customer complaints", audience: "the support lead", detail: "3" }).ok).toBe(true);
  });

  it("rejects an unknown app type", () => {
    expect(parseIntake({ pattern: "teleport", input: "x x", audience: "y y" }).ok).toBe(false);
  });

  it("rejects a missing answer", () => {
    expect(parseIntake({ pattern: "summarise", input: "customer complaints" }).ok).toBe(false);
  });

  it("rejects an over-long answer", () => {
    expect(parseIntake({ pattern: "summarise", input: "a".repeat(61), audience: "the support lead" }).ok).toBe(false);
  });

  it("needs at least two categories to classify", () => {
    expect(parseIntake({ pattern: "classify", input: "tickets", audience: "support", detail: "billing" }).ok).toBe(false);
  });
});

describe("buildMvp", () => {
  it("gives the same MVP for the same answers", () => {
    const raw = { pattern: "summarise", input: "customer complaints", audience: "the support lead", detail: "3" };
    expect(mvpFrom(raw)).toEqual(mvpFrom(raw));
  });

  it("uses the number of points the learner chose, capped at 10", () => {
    expect(mvpFrom({ pattern: "summarise", input: "notes", audience: "the team", detail: "5" }).schemaCode).toContain(".length(5)");
    expect(mvpFrom({ pattern: "summarise", input: "notes", audience: "the team", detail: "50" }).schemaCode).toContain(".length(10)");
  });

  it("limits a classifier to the learner's own categories", () => {
    const mvp = mvpFrom({ pattern: "classify", input: "support tickets", audience: "support", detail: "billing, delivery, other" });
    expect(mvp.schemaCode).toBe('z.object({ category: z.enum(["billing", "delivery", "other"]) })');
  });

  it("turns field names into safe JSON keys", () => {
    const mvp = mvpFrom({ pattern: "extract", input: "emails", audience: "ops", detail: "Order number, Issue!" });
    expect(mvp.outputExample).toBe('{"order_number":"...","issue":"..."}');
  });

  it("lets the answer-from-text app say the answer isn't there", () => {
    const mvp = mvpFrom({ pattern: "answer", input: "returns policy", audience: "store staff" });
    expect(mvp.schemaCode).toContain("found: z.boolean()");
  });
});
