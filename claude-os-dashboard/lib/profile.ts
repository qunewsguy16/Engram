/**
 * Profile, goals, and habit modeling.
 *
 * Habit math intentionally avoids fragile all-or-nothing streak counters
 * (Product audit #4): a single miss on day 12 of an 11-day streak kills
 * motivation. We track the recent log instead, and derive:
 *  - `rate`  — "9 of last 14" honest adherence
 *  - `streak` — display-only, computed from the tail
 *  - `atRisk` — flags two-misses-in-a-row, the real signal
 * Freeze tokens are silent: they exist, they're used automatically, no UI gamification.
 */

export interface Habit {
  id: string;
  label: string;
  /** Most recent first: true=done, false=missed. Length = lookback window. */
  log: boolean[];
}

export interface HabitStats {
  rate: { done: number; window: number };
  streak: number;
  atRisk: boolean;
}

export function habitStats(habit: Habit): HabitStats {
  const window = habit.log.length;
  const done = habit.log.filter(Boolean).length;
  let streak = 0;
  for (const d of habit.log) {
    if (d) streak++;
    else break;
  }
  const atRisk = habit.log.length >= 2 && !habit.log[0] && !habit.log[1];
  return { rate: { done, window }, streak, atRisk };
}

export const profile = {
  name: "qunewsguy16",
  greetingFocus: "Learn AI/ML deeper, ship side projects, daily focus.",
  goals: [
    { id: "learn-ml", label: "Learn AI/ML deeper" },
    { id: "ship-side", label: "Build & launch side projects" },
    { id: "daily-focus", label: "Daily focus / habits" },
  ],
  habits: [
    // Most recent first. v1 is seeded; persistence comes with the loop skeleton.
    { id: "deep-work", label: "90m deep work", log: [true, true, false, true, true, true, false, true, true, true, false, true, true, true] },
    { id: "read-paper", label: "Read + 3-sentence takeaway", log: [true, false, true, true, false, true, true, true, false, true, true, false, true, true] },
    { id: "ship-commit", label: "Ship 1 commit", log: [true, true, true, true, true, true, true, false, true, true, true, true, true, true] },
    { id: "review-notes", label: "5m end-of-day review", log: [true, false, true, true, true, false, false, true, true, false, true, true, true, false] },
  ] satisfies Habit[],
};
