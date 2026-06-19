import { describe, it, expect } from "vitest";
import { buildMockDream, runDream, extractJson } from "./dream";
import { reduceSignals } from "./reduce";
import { DreamSchema } from "./schema";

describe("dream contract", () => {
  const blob = reduceSignals({
    commits: [{ sha: "a", message: "draft ablation section" }],
    tasks: [{ content: "email advisor" }],
  });

  it("buildMockDream conforms to DreamSchema", () => {
    expect(() => DreamSchema.parse(buildMockDream(blob))).not.toThrow();
  });

  it("every thread and action is grounded in a signal id", () => {
    const d = buildMockDream(blob);
    for (const t of d.threads) expect(t.sourceIds.length).toBeGreaterThan(0);
    for (const a of d.suggestedActions) expect(a.sourceIds.length).toBeGreaterThan(0);
  });

  it("runDream falls back to a valid mock when the live flag is off", async () => {
    const { dream, source } = await runDream(blob);
    expect(source).toBe("mock");
    expect(() => DreamSchema.parse(dream)).not.toThrow();
  });
});

describe("extractJson (live-mode parsing robustness)", () => {
  it("parses a bare JSON object", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("parses a ```json fenced block", () => {
    expect(extractJson('```json\n{"a":2}\n```')).toEqual({ a: 2 });
  });

  it("parses a plain fenced block", () => {
    expect(extractJson('```\n{"a":3}\n```')).toEqual({ a: 3 });
  });

  it("strips surrounding prose before/after the object", () => {
    expect(extractJson('Sure! Here you go:\n{"a":4}\nHope that helps.')).toEqual({ a: 4 });
  });

  it("throws when there is no JSON object", () => {
    expect(() => extractJson("no json here")).toThrow();
  });
});
