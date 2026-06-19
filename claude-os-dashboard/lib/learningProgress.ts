/**
 * Per-item learning progress, layered over the mock reading list.
 *
 * The loop fix (Product audit #5): reading is intake; learning happens on
 * output. A paper cannot be marked "done" without an own-words takeaway, and
 * that takeaway — not an auto-summary — is what becomes a concept to revisit.
 * Stored locally (DB deferred); overrides merge onto lib/data/learning.ts.
 */
import { createLocalStore } from "./localStore";

export type ReadStatus = "queued" | "reading" | "done";

export interface Progress {
  id: string;
  status: ReadStatus;
  takeaway: string;
  updatedAt: number;
}

const store = createLocalStore<Progress>("engram-os:learning:v1");

/** Minimum bar for an own-words takeaway to count as understanding. */
export const MIN_TAKEAWAY = 12;

export function canComplete(takeaway: string): boolean {
  return takeaway.trim().length >= MIN_TAKEAWAY;
}

export function getProgress(id: string): Progress | null {
  return store.all().find((p) => p.id === id) ?? null;
}

function upsert(id: string, patch: Partial<Omit<Progress, "id" | "updatedAt">>): Progress {
  const existing = getProgress(id);
  const next: Progress = {
    id,
    status: patch.status ?? existing?.status ?? "queued",
    takeaway: patch.takeaway ?? existing?.takeaway ?? "",
    updatedAt: Date.now(),
  };
  store.set([next, ...store.all().filter((p) => p.id !== id)]);
  return next;
}

export function setStatus(id: string, status: ReadStatus): Progress {
  return upsert(id, { status });
}

export function saveTakeaway(id: string, takeaway: string): Progress {
  return upsert(id, { takeaway });
}

/**
 * Mark done — gated. Returns null (no state change) when the takeaway is too
 * thin, so the caller can keep the editor open.
 */
export function markDone(id: string, takeaway: string): Progress | null {
  if (!canComplete(takeaway)) return null;
  return upsert(id, { status: "done", takeaway: takeaway.trim() });
}

/** Takeaways from completed items become concepts to revisit / dream fuel. */
export function completedTakeaways(): { id: string; takeaway: string }[] {
  return store
    .all()
    .filter((p) => p.status === "done" && p.takeaway)
    .map((p) => ({ id: p.id, takeaway: p.takeaway }));
}

export function subscribeLearning(fn: () => void): () => void {
  return store.subscribe(fn);
}
