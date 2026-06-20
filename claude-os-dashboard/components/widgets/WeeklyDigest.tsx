"use client";

import { useEffect, useReducer } from "react";
import { CalendarRange, CheckCircle2, Sparkles } from "lucide-react";
import { listRecentReviews, subscribeReviews } from "@/lib/review";
import { completedTakeaways, subscribeLearning } from "@/lib/learningProgress";
import { profile } from "@/lib/profile";
import { buildWeeklyDigest } from "@/lib/weekly";

function compute() {
  return buildWeeklyDigest(
    listRecentReviews(7),
    completedTakeaways(),
    profile.habits.map((h) => ({ label: h.label, log: h.log })),
  );
}

export function WeeklyDigest() {
  // Inputs are synchronous store reads; just re-render on store changes.
  const [, refresh] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    const unsubReviews = subscribeReviews(refresh);
    const unsubLearning = subscribeLearning(refresh);
    return () => {
      unsubReviews();
      unsubLearning();
    };
  }, []);

  const digest = compute();
  const empty = digest.daysReviewed === 0;

  return (
    <section className="card card-pad">
      <div className="section-title"><CalendarRange size={12} /> This week</div>

      {empty ? (
        <p className="text-sm text-muted mt-3">No review data yet this week.</p>
      ) : (
        <div className="mt-3 space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span className="text-ink">{digest.daysReviewed} days reviewed</span>
            <span className="text-muted">·</span>
            <span className="text-muted">
              one thing done {digest.oneThingDoneRate}% ({digest.oneThingDoneCount}/{digest.daysReviewed})
            </span>
          </div>

          {digest.habitSummary.length > 0 && (
            <div>
              <div className="text-xs text-muted mb-1.5">Habits</div>
              <div className="space-y-1">
                {digest.habitSummary.map((h) => (
                  <div key={h.label} className="flex items-center justify-between text-sm">
                    <span className="text-ink/90">{h.label}</span>
                    <span className="text-[11px] font-mono text-muted">
                      {h.done}/{h.window}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {digest.learnings.length > 0 && (
            <div>
              <div className="text-xs text-muted mb-1.5">Recent learnings</div>
              <ul className="space-y-1.5">
                {digest.learnings.slice(0, 5).map((l, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-border p-2 text-xs text-ink/80 border-l-2 border-l-emerald-300"
                  >
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {digest.concepts.length > 0 && (
            <div>
              <div className="text-xs text-muted mb-1.5 flex items-center gap-1">
                <Sparkles size={11} /> Concepts
              </div>
              <div className="flex flex-wrap gap-1.5">
                {digest.concepts.map((c, i) => (
                  <span key={i} className="chip" title={c}>
                    {c.length > 40 ? c.slice(0, 40) + "..." : c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
