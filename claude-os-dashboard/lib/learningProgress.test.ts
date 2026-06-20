import { describe, it, expect } from "vitest";
import { useTestDb } from "../test/stubs/db";

import { canComplete, markDone, getProgress, setStatus, saveTakeaway, completedTakeaways, MIN_TAKEAWAY } from "./learningProgress";

describe("takeaway gating (pure)", () => {
  it("rejects takeaways below the minimum length", () => {
    expect(canComplete("too short")).toBe(false);
    expect(canComplete("x".repeat(MIN_TAKEAWAY))).toBe(true);
  });
});

describe("learning progress store", () => {
  useTestDb();

  it("markDone is a no-op when the takeaway is too thin", () => {
    expect(markDone("p1", "nope")).toBeNull();
    expect(getProgress("p1")).toBeNull();
  });

  it("markDone sets done + trims takeaway when sufficient", () => {
    const r = markDone("p1", "  consolidation improves long-horizon recall  ");
    expect(r?.status).toBe("done");
    expect(r?.takeaway).toBe("consolidation improves long-horizon recall");
  });

  it("advances status without losing an existing takeaway", () => {
    saveTakeaway("p2", "selective state spaces scale linearly");
    setStatus("p2", "reading");
    const p = getProgress("p2")!;
    expect(p.status).toBe("reading");
    expect(p.takeaway).toBe("selective state spaces scale linearly");
  });

  it("surfaces completed takeaways as concepts", () => {
    markDone("p3", "rerank beats naive top-k on internal eval");
    setStatus("p4", "reading"); // not done -> excluded
    const concepts = completedTakeaways();
    expect(concepts).toHaveLength(1);
    expect(concepts[0].id).toBe("p3");
  });
});
