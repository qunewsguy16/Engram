import { describe, it, expect } from "vitest";
import { buildGoalBalance } from "./goalWeighting";

const goals = [
  { id: "learn-ml", label: "Learn AI/ML deeper" },
  { id: "ship-side", label: "Build & launch side projects" },
  { id: "daily-focus", label: "Daily focus / habits" },
];

describe("buildGoalBalance", () => {
  it("handles empty inputs: all scores 0, underserved null", () => {
    const b = buildGoalBalance(goals, []);
    expect(b.activities.map((a) => a.score)).toEqual([0, 0, 0]);
    expect(b.underserved).toBeNull();
  });

  it("handles fully empty goal list", () => {
    const b = buildGoalBalance([], []);
    expect(b.activities).toEqual([]);
    expect(b.underserved).toBeNull();
  });

  it("sums contributions per goal and preserves goals order", () => {
    const b = buildGoalBalance(goals, [
      { goalId: "learn-ml", weight: 3 },
      { goalId: "learn-ml", weight: 2 },
      { goalId: "ship-side", weight: 4 },
      { goalId: "daily-focus", weight: 4 },
    ]);
    expect(b.activities.map((a) => a.goalId)).toEqual(["learn-ml", "ship-side", "daily-focus"]);
    expect(b.activities.map((a) => a.score)).toEqual([5, 4, 4]);
    // 4 is not < 50% of 5, so balanced enough -> no flag.
    expect(b.underserved).toBeNull();
  });

  it("flags underserved when min < 50% of max", () => {
    const b = buildGoalBalance(goals, [
      { goalId: "learn-ml", weight: 10 },
      { goalId: "ship-side", weight: 8 },
      { goalId: "daily-focus", weight: 4 }, // 4 < 0.5 * 10
    ]);
    expect(b.underserved).not.toBeNull();
    expect(b.underserved?.goalId).toBe("daily-focus");
    expect(b.underserved?.score).toBe(4);
  });

  it("does NOT flag when balanced (min >= 50% of max)", () => {
    const b = buildGoalBalance(goals, [
      { goalId: "learn-ml", weight: 10 },
      { goalId: "ship-side", weight: 7 },
      { goalId: "daily-focus", weight: 6 }, // 6 >= 0.5 * 10
    ]);
    expect(b.underserved).toBeNull();
  });

  it("does NOT flag when all scores are equal (incl. all zero)", () => {
    const equal = buildGoalBalance(goals, [
      { goalId: "learn-ml", weight: 5 },
      { goalId: "ship-side", weight: 5 },
      { goalId: "daily-focus", weight: 5 },
    ]);
    expect(equal.underserved).toBeNull();

    const allZero = buildGoalBalance(goals, []);
    expect(allZero.underserved).toBeNull();
  });

  it("gives a goal with no contributions score 0 and flags it when others are active", () => {
    const b = buildGoalBalance(goals, [
      { goalId: "learn-ml", weight: 6 },
      { goalId: "ship-side", weight: 5 },
      // daily-focus has nothing
    ]);
    const focus = b.activities.find((a) => a.goalId === "daily-focus");
    expect(focus?.score).toBe(0);
    expect(b.underserved?.goalId).toBe("daily-focus");
  });
});
