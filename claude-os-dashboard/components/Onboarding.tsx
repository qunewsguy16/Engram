"use client";

import { useEffect, useState } from "react";
import { Check, Circle, X, Rocket } from "lucide-react";
import { recentCaptureTexts, subscribeInbox } from "@/lib/inbox";
import { getReview, reviewStreak, subscribeReviews } from "@/lib/review";
import { completedTakeaways, subscribeLearning } from "@/lib/learningProgress";

const DISMISS_KEY = "engram-os:onboarding-dismissed:v1";

/**
 * First-run checklist that doubles as onboarding (Product audit #9): the first
 * impression on real (empty) data is the retention moment. Keyed to actual
 * progress in the local stores; auto-hides when complete or dismissed.
 */
export function Onboarding() {
  const [dismissed, setDismissed] = useState(true); // assume hidden until mounted (SSR-safe)
  const [, force] = useState(0);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    const rerender = () => force((n) => n + 1);
    const unsubs = [subscribeInbox(rerender), subscribeReviews(rerender), subscribeLearning(rerender)];
    return () => unsubs.forEach((u) => u());
  }, []);

  if (dismissed) return null;

  const steps = [
    { label: "Capture a thought with ⌘⇧N", done: recentCaptureTexts(1).length > 0 },
    { label: "Read a paper and write a takeaway", done: completedTakeaways().length > 0 },
    { label: "Do your first end-of-day review (⌘⇧R)", done: getReview() !== null || reviewStreak() > 0 },
  ];
  const allDone = steps.every((s) => s.done);
  if (allDone) return null;

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="card card-pad mb-4 border-accent/30 bg-accent/5">
      <div className="flex items-start justify-between">
        <div className="section-title text-accent"><Rocket size={12} /> Get started</div>
        <button onClick={dismiss} className="text-muted hover:text-ink" title="Dismiss">
          <X size={14} />
        </button>
      </div>
      <p className="text-sm text-muted mt-1">
        Three habits make this dashboard work. The loop matters more than the look.
      </p>
      <ul className="mt-3 space-y-1.5">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            {s.done ? <Check size={14} className="text-emerald-600" /> : <Circle size={14} className="text-muted" />}
            <span className={s.done ? "line-through text-muted" : ""}>{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
