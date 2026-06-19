"use client";

import { useEffect, useState } from "react";
import { Moon, Check, X, Flame } from "lucide-react";
import { getReview, saveReview, reviewStreak, subscribeReviews } from "@/lib/review";
import { today } from "@/lib/today";

/**
 * End-of-day review modal. Header button or ⌘⇧R. Three fast prompts; the
 * "learned" line is the one that feeds tomorrow's /dream. Saving is upsert —
 * reopen to amend the same day's entry.
 */
export function DailyReview() {
  const [open, setOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [doneToday, setDoneToday] = useState(false);

  const [oneThingDone, setOneThingDone] = useState<boolean | null>(null);
  const [learned, setLearned] = useState("");
  const [blockers, setBlockers] = useState("");

  useEffect(() => {
    const sync = () => {
      setStreak(reviewStreak());
      setDoneToday(getReview() !== null);
    };
    sync();
    return subscribeReviews(sync);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Prefill from any existing entry when opening.
  useEffect(() => {
    if (!open) return;
    const r = getReview();
    setOneThingDone(r?.oneThingDone ?? null);
    setLearned(r?.learned ?? "");
    setBlockers(r?.blockers ?? "");
  }, [open]);

  function save() {
    saveReview({ oneThingDone, learned: learned.trim(), blockers: blockers.trim() });
    setOpen(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn" title="End-of-day review (⌘⇧R)">
        <Moon size={14} /> Review
        {streak > 0 && (
          <span className="inline-flex items-center gap-0.5 text-orange-500">
            <Flame size={12} /> {streak}
          </span>
        )}
        {doneToday && <Check size={12} className="text-emerald-600" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-sm grid place-items-start pt-[12vh] px-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="End-of-day review"
            className="card card-pad w-full max-w-lg space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="section-title"><Moon size={12} /> End-of-day review</div>

            <div>
              <div className="text-sm font-medium">Did you do the one thing?</div>
              <div className="text-xs text-muted mt-0.5">{today.oneThing}</div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setOneThingDone(true)}
                  className={`btn ${oneThingDone === true ? "border-emerald-500 bg-emerald-50 text-emerald-700" : ""}`}
                >
                  <Check size={14} /> Yes
                </button>
                <button
                  onClick={() => setOneThingDone(false)}
                  className={`btn ${oneThingDone === false ? "border-red-400 bg-red-50 text-red-600" : ""}`}
                >
                  <X size={14} /> Not today
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">One thing you learned</label>
              <textarea
                value={learned}
                onChange={(e) => setLearned(e.target.value)}
                placeholder="The sentence that feeds tomorrow's /dream..."
                className="mt-1 w-full rounded-lg border border-border bg-bg/50 p-3 text-sm outline-none resize-none min-h-[72px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Blockers <span className="text-muted font-normal">(optional)</span></label>
              <input
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="What's in the way?"
                className="mt-1 w-full rounded-lg border border-border bg-bg/50 px-3 py-2 text-sm outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted">Saves to today · reopen to amend</span>
              <button onClick={save} className="btn-primary">Save review</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
