import "server-only";
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { sqlitePath } from "./config";

/**
 * SQLite persistence (DECISIONS.md: raw better-sqlite3, no ORM — schema is
 * small, migrations are linear, and sqlite-vec/FTS5 escape hatches would not
 * model cleanly through Drizzle anyway).
 *
 * better-sqlite3 is sync and native; all access happens server-side under
 * runtime=nodejs. The schema is initialized idempotently on first open.
 * Tests inject an in-memory DB via _setDbForTesting; production uses a
 * lazy singleton with WAL + foreign keys.
 */
export type DB = Database.Database;

let prodDb: DB | null = null;
let testOverride: DB | null = null;

export function getDb(): DB {
  if (testOverride) return testOverride;
  if (prodDb) return prodDb;
  const file = sqlitePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  prodDb = new Database(file);
  prodDb.pragma("journal_mode = WAL");
  prodDb.pragma("foreign_keys = ON");
  initSchema(prodDb);
  return prodDb;
}

function initSchema(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS captures (
      id          TEXT PRIMARY KEY,
      text        TEXT NOT NULL,
      tags        TEXT NOT NULL,            -- JSON-encoded string[]
      captured_at INTEGER NOT NULL,
      status      TEXT NOT NULL CHECK(status IN ('inbox','archived','promoted'))
    );
    CREATE INDEX IF NOT EXISTS idx_captures_status_captured_at
      ON captures(status, captured_at DESC);

    CREATE TABLE IF NOT EXISTS reviews (
      date            TEXT PRIMARY KEY,     -- YYYY-MM-DD local
      one_thing_done  INTEGER,              -- 0 / 1 / NULL
      learned         TEXT NOT NULL DEFAULT '',
      blockers        TEXT NOT NULL DEFAULT '',
      updated_at      INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS learning_progress (
      id          TEXT PRIMARY KEY,         -- matches ReadingItem.id
      status      TEXT NOT NULL CHECK(status IN ('queued','reading','done')),
      takeaway    TEXT NOT NULL DEFAULT '',
      updated_at  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dream_runs (
      id      TEXT PRIMARY KEY,
      ran_at  INTEGER NOT NULL,
      source  TEXT NOT NULL CHECK(source IN ('live','mock')),
      payload TEXT NOT NULL                 -- JSON-encoded Dream
    );
  `);
}

/** Open a fresh in-memory DB with the same schema. Tests only. */
export function openMemoryDb(): DB {
  const m = new Database(":memory:");
  initSchema(m);
  return m;
}

/** Tests: swap the active DB. Pair with _clearDbForTesting in afterEach. */
export function _setDbForTesting(db: DB): void {
  testOverride = db;
}

export function _clearDbForTesting(): void {
  if (testOverride) {
    try {
      testOverride.close();
    } catch {
      // already closed
    }
    testOverride = null;
  }
}
