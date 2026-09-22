// Smoke test: proves the test runner itself works before we rely on it.
// Delete this file once the real classifier tests exist.
import { describe, expect, it } from "vitest";

describe("test harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
