import "server-only";
import { getDb } from "./db";
import { uid } from "./uid";
import type { Dream } from "./ai/schema";

/**
 * Persistence for /dream output. Every run — live or mock — is recorded so the
 * loop has a queryable history (today's one thing, the daily reflection feed)
 * without re-running the model. The dream_runs table was provisioned with the
 * persistence migration; this is the writer + a couple of readers.
 */

export interface DreamRun {
  id: string;
  ranAt: number;
  source: "live" | "mock";
  dream: Dream;
}

interface DreamRow {
  id: string;
  ran_at: number;
  source: "live" | "mock";
  payload: string;
}

function rowToRun(r: DreamRow): DreamRun | null {
  try {
    return { id: r.id, ranAt: r.ran_at, source: r.source, dream: JSON.parse(r.payload) as Dream };
  } catch {
    // Corrupt payload — skip the row rather than crashing every render
    // (Today.tsx calls latestDream() on every page load).
    return null;
  }
}

export function recordDream(dream: Dream, source: "live" | "mock"): DreamRun {
  const run: DreamRun = { id: uid(), ranAt: Date.now(), source, dream };
  getDb()
    .prepare(`INSERT INTO dream_runs (id, ran_at, source, payload) VALUES (?, ?, ?, ?)`)
    .run(run.id, run.ranAt, run.source, JSON.stringify(run.dream));
  return run;
}

/** Latest dream run, or null if none exist. */
export function latestDream(): DreamRun | null {
  const row = getDb()
    .prepare<[], DreamRow>(`SELECT * FROM dream_runs ORDER BY ran_at DESC, rowid DESC LIMIT 1`)
    .get();
  return row ? rowToRun(row) : null;
}

export function listRecentDreams(limit = 7): DreamRun[] {
  return getDb()
    .prepare<[number], DreamRow>(`SELECT * FROM dream_runs ORDER BY ran_at DESC, rowid DESC LIMIT ?`)
    .all(limit)
    .map(rowToRun)
    .filter((r): r is DreamRun => r !== null);
}
