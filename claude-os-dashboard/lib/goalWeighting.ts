/**
 * Goal balance — pure aggregation that surfaces which goal is under-served.
 *
 * The product audit's top behavioral idea (#1): three stated goals, but
 * attention silently concentrates on one or two. This folds weighted activity
 * signals per goal and flags the laggard — but only when there's *real*
 * imbalance, so a quiet week (or a perfectly even one) stays silent rather
 * than nagging.
 *
 * Dependency-free and side-effect-free: all inputs are passed in, so the math
 * is trivially unit-testable. The widget sources the signals from the stores.
 */

export interface GoalActivity {
  goalId: string;
  label: string;
  score: number;
}

export interface GoalBalance {
  activities: GoalActivity[];
  underserved: GoalActivity | null;
}

/** Below this fraction of the max score, a goal counts as under-served. */
const IMBALANCE_THRESHOLD = 0.5;

export function buildGoalBalance(
  goals: { id: string; label: string }[],
  contributions: { goalId: string; weight: number }[],
): GoalBalance {
  const scores = new Map<string, number>();
  for (const c of contributions) {
    scores.set(c.goalId, (scores.get(c.goalId) ?? 0) + c.weight);
  }

  const activities: GoalActivity[] = goals.map((g) => ({
    goalId: g.id,
    label: g.label,
    score: scores.get(g.id) ?? 0,
  }));

  if (activities.length === 0) {
    return { activities, underserved: null };
  }

  const max = Math.max(...activities.map((a) => a.score));
  const min = Math.min(...activities.map((a) => a.score));

  // Flag only on real imbalance: someone is active AND the laggard trails badly.
  const hasActivity = max > 0;
  const imbalanced = hasActivity && min < max * IMBALANCE_THRESHOLD;

  let underserved: GoalActivity | null = null;
  if (imbalanced) {
    // Lowest score; preserve goals order on ties via the first match.
    underserved = activities.reduce((lowest, a) => (a.score < lowest.score ? a : lowest));
  }

  return { activities, underserved };
}
