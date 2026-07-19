/**
 * Pure types + gating that are safe to import from client components. The
 * server-side store (with SQLite I/O) lives in lib/learningProgress.ts.
 */
export type ReadStatus = "queued" | "reading" | "done";

/** Minimum bar for an own-words takeaway to count as understanding. */
export const MIN_TAKEAWAY = 12;

export function canComplete(takeaway: string): boolean {
  return takeaway.trim().length >= MIN_TAKEAWAY;
}
