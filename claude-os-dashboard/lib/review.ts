/**
 * End-of-day review — the half of the loop that makes the dashboard useful
 * rather than decorative (Product audit #2). It records whether the day's one
 * thing got done and one sentence of what was learned; those entries feed back
 * into the next /dream. One entry per day, upserted by date.
 */
import { createLocalStore } from "./localStore";

export interface ReviewEntry {
  date: string; // YYYY-MM-DD (local)
  oneThingDone: boolean | null;
  learned: string;
  blockers: string;
  updatedAt: number;
}

const store = createLocalStore<ReviewEntry>("engram-os:review:v1");

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getReview(date = todayKey()): ReviewEntry | null {
  return store.all().find((r) => r.date === date) ?? null;
}

export function saveReview(patch: Partial<Omit<ReviewEntry, "date" | "updatedAt">>, date = todayKey()): ReviewEntry {
  const existing = getReview(date);
  const entry: ReviewEntry = {
    date,
    oneThingDone: patch.oneThingDone ?? existing?.oneThingDone ?? null,
    learned: patch.learned ?? existing?.learned ?? "",
    blockers: patch.blockers ?? existing?.blockers ?? "",
    updatedAt: Date.now(),
  };
  const rest = store.all().filter((r) => r.date !== date);
  store.set([entry, ...rest]);
  return entry;
}

export function listRecentReviews(limit = 7): ReviewEntry[] {
  return store
    .all()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);
}

/** Consecutive days reviewed ending today (or yesterday if today isn't done yet). */
export function reviewStreak(now = new Date()): number {
  const done = new Set(store.all().map((r) => r.date));
  let streak = 0;
  const cursor = new Date(now);
  // Allow today to be pending without breaking the streak.
  if (!done.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (done.has(todayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function subscribeReviews(fn: () => void): () => void {
  return store.subscribe(fn);
}
