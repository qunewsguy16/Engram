import "server-only";
import { dayKey } from "../date";

/**
 * Soft daily spend guard for /dream (security review #1: DREAM_DAILY_BUDGET_USD
 * was defined but never enforced). In-memory per-process counter — adequate for
 * a single-user local app — that resets at local-date rollover. Estimates cost
 * per call rather than metering exact tokens; enough to stop runaway spend on a
 * public server action when live mode is on.
 */
const EST_USD_PER_DREAM = 0.15;

let day = "";
let calls = 0;

function budgetUsd(): number {
  const v = Number(process.env.DREAM_DAILY_BUDGET_USD);
  return Number.isFinite(v) && v > 0 ? v : 1;
}

function rollover() {
  // Local-midnight rollover, consistent with the rest of the app (dayKey).
  const today = dayKey();
  if (today !== day) {
    day = today;
    calls = 0;
  }
}

/** True if another live /dream call fits within today's budget. */
export function canSpend(): boolean {
  rollover();
  return (calls + 1) * EST_USD_PER_DREAM <= budgetUsd();
}

export function recordSpend() {
  rollover();
  calls += 1;
}

/** Test-only: reset the in-memory counter. */
export function __resetBudget() {
  day = "";
  calls = 0;
}
