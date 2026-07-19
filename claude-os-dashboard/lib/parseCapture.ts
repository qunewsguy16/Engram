/**
 * Pure capture text parser — no I/O, no server-only deps. Lives outside
 * lib/inbox.ts so it can be imported from anywhere (client widgets, tests)
 * without dragging the SQLite/server-only chain along.
 */
export function parseCapture(raw: string): { text: string; tags: string[] } {
  const tags: string[] = [];
  for (const m of raw.matchAll(/(?:^|\s)#([a-z0-9][\w-]{0,40})/gi)) tags.push(m[1].toLowerCase());
  const text = raw.replace(/(?:^|\s)#[a-z0-9][\w-]{0,40}/gi, "").trim().replace(/\s+/g, " ");
  return { text, tags: Array.from(new Set(tags)) };
}
