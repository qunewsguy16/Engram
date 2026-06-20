import { Scale, AlertCircle } from "lucide-react";
import { profile, habitStats } from "@/lib/profile";
import { completedTakeaways } from "@/lib/learningProgress";
import { listRecentReviews } from "@/lib/review";
import { buildGoalBalance } from "@/lib/goalWeighting";

export function GoalBalance() {
  // Habit adherence routed to each habit's goal (mapping lives on the habit).
  const contributions = profile.habits.map((h) => ({
    goalId: h.goalId,
    weight: habitStats(h).rate.done,
  }));

  // Learning output: completed takeaways are heavier (output, not intake).
  contributions.push({ goalId: "learn-ml", weight: completedTakeaways().length * 2 });

  // Shipping: days where the one thing actually got done.
  const shipped = listRecentReviews(7).filter((r) => r.oneThingDone === true).length;
  contributions.push({ goalId: "ship-side", weight: shipped });

  const balance = buildGoalBalance(profile.goals, contributions);
  const maxScore = Math.max(0, ...balance.activities.map((a) => a.score));
  const empty = maxScore === 0;

  return (
    <section className="card card-pad">
      <div className="section-title"><Scale size={12} /> Goal balance</div>

      {empty ? (
        <p className="text-sm text-muted mt-3">Not enough activity yet this week.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {balance.activities.map((a) => {
            const pct = maxScore ? Math.round((a.score / maxScore) * 100) : 0;
            const isUnder = balance.underserved?.goalId === a.goalId;
            return (
              <div key={a.goalId}>
                <div className="flex items-center justify-between text-sm">
                  <span className={isUnder ? "text-amber-700" : "text-ink/90"}>{a.label}</span>
                  <span className="text-[11px] font-mono text-muted">{a.score}</span>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-border overflow-hidden">
                  <div
                    className={`h-full ${isUnder ? "bg-amber-400" : "bg-ink/80"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}

          {balance.underserved && (
            <div className="rounded-lg border border-amber-400 bg-amber-50/60 p-2 text-[11px] text-amber-700 flex items-center gap-1.5">
              <AlertCircle size={12} className="flex-none" />
              {balance.underserved.label} is under-served this week.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
