import { Check, Circle, Rocket } from "lucide-react";
import { recentCaptureTexts } from "@/lib/inbox";
import { getReview, reviewStreak } from "@/lib/review";
import { completedTakeaways } from "@/lib/learningProgress";
import { OnboardingDismiss } from "./OnboardingDismiss";

/**
 * First-run checklist that doubles as onboarding (Product audit #9). Server
 * component reads progress from SQLite; the dismiss flag stays in localStorage
 * (a UI preference, not domain data) via the thin OnboardingDismiss client.
 */
export function Onboarding() {
  const steps = [
    { label: "Capture a thought with ⌘⇧N", done: recentCaptureTexts(1).length > 0 },
    { label: "Read a paper and write a takeaway", done: completedTakeaways().length > 0 },
    { label: "Do your first end-of-day review (⌘⇧R)", done: getReview() !== null || reviewStreak() > 0 },
  ];
  if (steps.every((s) => s.done)) return null;

  return (
    <OnboardingDismiss>
      <div className="card card-pad mb-4 border-accent/30 bg-accent/5">
        <div className="flex items-start justify-between">
          <div className="section-title text-accent"><Rocket size={12} /> Get started</div>
          {/* X button rendered by OnboardingDismiss wrapper */}
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
    </OnboardingDismiss>
  );
}
