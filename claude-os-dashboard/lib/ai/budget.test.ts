import { describe, it, expect, beforeEach } from "vitest";
import { canSpend, recordSpend, __resetBudget } from "./budget";

beforeEach(() => {
  __resetBudget();
  delete process.env.DREAM_DAILY_BUDGET_USD;
});

describe("daily budget guard", () => {
  it("allows calls until the estimated spend exceeds the budget", () => {
    process.env.DREAM_DAILY_BUDGET_USD = "0.30"; // ~2 calls at $0.15 est
    expect(canSpend()).toBe(true);
    recordSpend();
    expect(canSpend()).toBe(true);
    recordSpend();
    expect(canSpend()).toBe(false);
  });

  it("defaults to a $1 budget when unset/invalid (6 calls/day at ~$0.15)", () => {
    expect(canSpend()).toBe(true);
    for (let i = 0; i < 5; i++) recordSpend();
    expect(canSpend()).toBe(true); // next call: 6 * 0.15 = 0.90 <= 1
    recordSpend();
    expect(canSpend()).toBe(false); // next call: 7 * 0.15 = 1.05 > 1
  });
});
