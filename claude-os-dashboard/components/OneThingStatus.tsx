import { Check, Circle } from "lucide-react";
import { getReview } from "@/lib/review";

/**
 * Reflects whether today's one thing was marked done in the review. Server
 * component reading SQLite; re-renders on revalidatePath after save.
 */
export function OneThingStatus() {
  const done = getReview()?.oneThingDone ?? null;

  if (done === true) {
    return (
      <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
        <Check size={12} /> Marked done today
      </span>
    );
  }
  if (done === false) {
    return (
      <span className="text-xs text-amber-700 flex items-center gap-1 mt-1">
        <Circle size={12} /> Logged as not done yet
      </span>
    );
  }
  return null;
}
