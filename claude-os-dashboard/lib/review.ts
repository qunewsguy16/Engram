import "server-only";
import { getDb } from "./db";
import { dayKey } from "./date";
import type { ReviewEntry } from "./reviewTypes";

export { type ReviewEntry } from "./reviewTypes";

/**
 * End-of-day review, SQLite-backed. One upserted row per local date. The
 * `learned` line feeds the next /dream; the streak rewards consistency
 * without breaking when today is still pending.
 */

interface ReviewRow {
  date: string;
  one_thing_done: 0 | 1 | null;
  learned: string;
  blockers: string;
  updated_at: number;
}

function rowToReview(r: ReviewRow): ReviewEntry {
  return {
    date: r.date,
    oneThingDone: r.one_thing_done === null ? null : Boolean(r.one_thing_done),
    learned: r.learned,
    blockers: r.blockers,
    updatedAt: r.updated_at,
  };
}

export const todayKey = dayKey;

export function getReview(date: string = dayKey()): ReviewEntry | null {
  const row = getDb()
    .prepare<[string], ReviewRow>(`SELECT * FROM reviews WHERE date = ?`)
    .get(date);
  return row ? rowToReview(row) : null;
}

export function saveReview(
  patch: Partial<Omit<ReviewEntry, "date" | "updatedAt">>,
  date: string = dayKey(),
): ReviewEntry {
  const existing = getReview(date);
  const entry: ReviewEntry = {
    date,
    oneThingDone: patch.oneThingDone ?? existing?.oneThingDone ?? null,
    learned: patch.learned ?? existing?.learned ?? "",
    blockers: patch.blockers ?? existing?.blockers ?? "",
    updatedAt: Date.now(),
  };
  const oneThingDoneCell = entry.oneThingDone === null ? null : entry.oneThingDone ? 1 : 0;
  getDb()
    .prepare(
      `INSERT INTO reviews (date, one_thing_done, learned, blockers, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET
         one_thing_done = excluded.one_thing_done,
         learned        = excluded.learned,
         blockers       = excluded.blockers,
         updated_at     = excluded.updated_at`,
    )
    .run(entry.date, oneThingDoneCell, entry.learned, entry.blockers, entry.updatedAt);
  return entry;
}

export function listRecentReviews(limit = 7): ReviewEntry[] {
  const rows = getDb()
    .prepare<[number], ReviewRow>(`SELECT * FROM reviews ORDER BY date DESC LIMIT ?`)
    .all(limit);
  return rows.map(rowToReview);
}

/** Consecutive days reviewed ending today (or yesterday if today isn't done yet). */
export function reviewStreak(now: Date = new Date()): number {
  const rows = getDb().prepare<[], { date: string }>(`SELECT date FROM reviews`).all();
  const done = new Set(rows.map((r) => r.date));
  let streak = 0;
  const cursor = new Date(now);
  if (!done.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (done.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
