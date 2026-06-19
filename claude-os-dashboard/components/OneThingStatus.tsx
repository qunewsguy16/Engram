"use client";

import { useEffect, useState } from "react";
import { Check, Circle } from "lucide-react";
import { getReview, subscribeReviews } from "@/lib/review";

/**
 * Client island inside the (server-rendered) Today widget: reflects whether
 * today's one thing was marked done in the review. Makes the loop visible on
 * the main screen — the dashboard records an outcome, not just a plan.
 */
export function OneThingStatus() {
  const [done, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setDone(getReview()?.oneThingDone ?? null);
    sync();
    return subscribeReviews(sync);
  }, []);

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
