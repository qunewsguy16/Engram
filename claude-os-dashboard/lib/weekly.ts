/**
 * Weekly digest — pure aggregation of the week's loop data.
 *
 * Kept dependency-free and side-effect-free (no React, no store calls): all
 * inputs are passed in, so the math is trivially unit-testable. The widget is
 * responsible for sourcing the data from the stores; this file just folds it.
 */

export interface WeeklyDigestData {
  daysReviewed: number;
  oneThingDoneCount: number;
  oneThingDoneRate: number;
  learnings: string[];
  concepts: string[];
  habitSummary: { label: string; done: number; window: number }[];
}

export function buildWeeklyDigest(
  reviews: { oneThingDone: boolean | null; learned: string }[],
  takeaways: { takeaway: string }[],
  habits: { label: string; log: boolean[] }[],
): WeeklyDigestData {
  const daysReviewed = reviews.length;
  const oneThingDoneCount = reviews.filter((r) => r.oneThingDone === true).length;
  const oneThingDoneRate = daysReviewed ? Math.round((100 * oneThingDoneCount) / daysReviewed) : 0;
  const learnings = reviews.map((r) => r.learned).filter(Boolean);
  const concepts = takeaways.map((t) => t.takeaway).filter(Boolean);
  const habitSummary = habits.map((h) => ({
    label: h.label,
    done: h.log.slice(0, 7).filter(Boolean).length,
    window: Math.min(7, h.log.length),
  }));

  return { daysReviewed, oneThingDoneCount, oneThingDoneRate, learnings, concepts, habitSummary };
}
