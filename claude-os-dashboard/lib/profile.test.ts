import { describe, it, expect } from "vitest";
import { habitStats } from "./profile";

// habitStats only reads `log`; the rest of Habit is fixture noise.
const stats = (log: boolean[]) => habitStats({ id: "h", label: "x", goalId: "g", log });

describe("habitStats", () => {
  it("reports rate as done/window from the recent log", () => {
    expect(stats([true, false, true, true, false, true, false]).rate).toEqual({ done: 4, window: 7 });
  });

  it("computes display streak from the head of the log only", () => {
    expect(stats([true, true, true, false, true, true]).streak).toBe(3);
  });

  it("treats a leading miss as streak 0 (no fake credit)", () => {
    expect(stats([false, true, true, true]).streak).toBe(0);
  });

  it("flags atRisk only on two misses in a row at the head", () => {
    expect(stats([false, false, true, true]).atRisk).toBe(true);
    expect(stats([false, true, false, true]).atRisk).toBe(false);
    expect(stats([true, false, false]).atRisk).toBe(false);
  });

  it("handles an empty log without throwing", () => {
    expect(stats([])).toEqual({ rate: { done: 0, window: 0 }, streak: 0, atRisk: false });
  });
});
