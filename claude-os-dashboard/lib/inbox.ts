import "server-only";
import { getDb } from "./db";
import { parseCapture } from "./parseCapture";
import { uid } from "./uid";
import type { Capture } from "./inboxTypes";

export { parseCapture };
export { ago, type Capture } from "./inboxTypes";

/**
 * Quick-capture inbox, SQLite-backed. Pure parser stays for client use; all
 * I/O is server-only. Widgets call these from RSC; modals/buttons mutate via
 * server actions (app/actions/inbox.ts).
 */

interface CaptureRow {
  id: string;
  text: string;
  tags: string;
  captured_at: number;
  status: Capture["status"];
}

function rowToCapture(r: CaptureRow): Capture {
  return { id: r.id, text: r.text, tags: JSON.parse(r.tags), capturedAt: r.captured_at, status: r.status };
}

export function listInbox(): Capture[] {
  const rows = getDb()
    .prepare<[], CaptureRow>(
      `SELECT id, text, tags, captured_at, status FROM captures
       WHERE status = 'inbox' ORDER BY captured_at DESC, rowid DESC`,
    )
    .all();
  return rows.map(rowToCapture);
}

/** Recent capture texts (any status) for feeding into /dream. */
export function recentCaptureTexts(limit = 10): string[] {
  const rows = getDb()
    .prepare<[number], { text: string }>(
      `SELECT text FROM captures ORDER BY captured_at DESC, rowid DESC LIMIT ?`,
    )
    .all(limit);
  return rows.map((r) => r.text);
}

export function capture(raw: string): Capture | null {
  const { text, tags } = parseCapture(raw);
  if (!text) return null;
  const item: Capture = { id: uid(), text, tags, capturedAt: Date.now(), status: "inbox" };
  getDb()
    .prepare(`INSERT INTO captures (id, text, tags, captured_at, status) VALUES (?, ?, ?, ?, ?)`)
    .run(item.id, item.text, JSON.stringify(item.tags), item.capturedAt, item.status);
  return item;
}

export function setStatus(id: string, status: Capture["status"]): void {
  getDb().prepare(`UPDATE captures SET status = ? WHERE id = ?`).run(status, id);
}

