import "server-only";
import { getDb } from "./db";
import { canComplete, type ReadStatus } from "./learningTypes";

export { MIN_TAKEAWAY, canComplete, type ReadStatus } from "./learningTypes";

/**
 * Per-paper learning progress, SQLite-backed. A paper isn't "done" until you
 * write your own takeaway (Product audit #5: anti-graveyard); completed
 * takeaways surface as concepts to revisit.
 */

export interface Progress {
  id: string;
  status: ReadStatus;
  takeaway: string;
  updatedAt: number;
}

interface ProgressRow {
  id: string;
  status: ReadStatus;
  takeaway: string;
  updated_at: number;
}

function rowToProgress(r: ProgressRow): Progress {
  return { id: r.id, status: r.status, takeaway: r.takeaway, updatedAt: r.updated_at };
}

export function getProgress(id: string): Progress | null {
  const row = getDb()
    .prepare<[string], ProgressRow>(`SELECT * FROM learning_progress WHERE id = ?`)
    .get(id);
  return row ? rowToProgress(row) : null;
}

function upsert(id: string, patch: Partial<Omit<Progress, "id" | "updatedAt">>): Progress {
  const existing = getProgress(id);
  const next: Progress = {
    id,
    status: patch.status ?? existing?.status ?? "queued",
    takeaway: patch.takeaway ?? existing?.takeaway ?? "",
    updatedAt: Date.now(),
  };
  getDb()
    .prepare(
      `INSERT INTO learning_progress (id, status, takeaway, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         status     = excluded.status,
         takeaway   = excluded.takeaway,
         updated_at = excluded.updated_at`,
    )
    .run(next.id, next.status, next.takeaway, next.updatedAt);
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
  const rows = getDb()
    .prepare<[], { id: string; takeaway: string }>(
      `SELECT id, takeaway FROM learning_progress WHERE status = 'done' AND takeaway != '' ORDER BY updated_at DESC`,
    )
    .all();
  return rows;
}
