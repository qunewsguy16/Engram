/**
 * "Today's one thing" — the single forcing function above the fold.
 *
 * v1: a local constant the user edits. The intended flow (per the resequenced
 * roadmap in DECISIONS.md) is that the morning /dream populates this and the
 * 9pm review records whether it actually got done — closing the loop that makes
 * the dashboard useful instead of decorative.
 */
export interface TodayPlan {
  oneThing: string;
  focusBlock: { start: string; end: string };
  /** Source of the one-thing: what last set it. */
  source: "you" | "dream";
}

export const today: TodayPlan = {
  oneThing: "Ship the Engram paper's ablation section.",
  focusBlock: { start: "09:00", end: "10:30" },
  source: "you",
};
