/**
 * Pure types for the daily review. Safe to import in client components; the
 * SQLite-backed store is in lib/review.ts (server-only).
 */
export interface ReviewEntry {
  date: string; // YYYY-MM-DD (local)
  oneThingDone: boolean | null;
  learned: string;
  blockers: string;
  updatedAt: number;
}
