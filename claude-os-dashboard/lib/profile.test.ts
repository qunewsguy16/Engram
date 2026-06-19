import { describe, it, expect } from "vitest";
import { habitStats } from "./profile";

describe("habitStats", () => {
  it("reports rate as done/window from the recent log", () => {
    // 4 done out of 7 recent days.
    const s = habitStats({ id: "h", label: "x", log: [true, false, true, true, false, true, false] });
    expect(s.rate).toEqual({ done: 4, window: 7 });
  });

  it("computes display streak from the head of the log only", () => {
    const s = habitStats({ id: "h", label: "x", log: [true, true, true, false, true, true] });
    expect(s.streak).toBe(3);
  });

  it("treats a leading miss as streak 0 (no fake credit)", () => {
    const s = habitStats({ id: "h", label: "x", log: [false, true, true, true] });
    expect(s.streak).toBe(0);
  });

  it("flags atRisk only on two misses in a row at the head", () => {
    expect(habitStats({ id: "h", label: "x", log: [false, false, true, true] }).atRisk).toBe(true);
    expect(habitStats({ id: "h", label: "x", log: [false, true, false, true] }).atRisk).toBe(false);
    expect(habitStats({ id: "h", label: "x", log: [true, false, false] }).atRisk).toBe(false);
  });

  it("handles an empty log without throwing", () => {
    const s = habitStats({ id: "h", label: "x", log: [] });
    expect(s).toEqual({ rate: { done: 0, window: 0 }, streak: 0, atRisk: false });
  });
});
