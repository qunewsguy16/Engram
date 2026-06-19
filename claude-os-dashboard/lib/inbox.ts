/**
 * Quick-capture inbox: ephemeral browser-side store.
 *
 * Persistence is intentionally localStorage for v1 (the DECISIONS.md call to
 * defer SQLite). The Capture shape and parse helpers are stable; when SQLite
 * lands the storage swap is one file.
 */

export interface Capture {
  id: string;
  text: string;
  tags: string[];
  capturedAt: number; // epoch ms
  status: "inbox" | "archived" | "promoted";
}

const KEY = "engram-os:inbox:v1";

/** Pull #tags out of the raw text and return both. */
export function parseCapture(raw: string): { text: string; tags: string[] } {
  const tags: string[] = [];
  for (const m of raw.matchAll(/(?:^|\s)#([a-z0-9][\w-]{0,40})/gi)) tags.push(m[1].toLowerCase());
  const text = raw.replace(/(?:^|\s)#[a-z0-9][\w-]{0,40}/gi, "").trim().replace(/\s+/g, " ");
  return { text, tags: Array.from(new Set(tags)) };
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function read(): Capture[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Capture[]) : [];
  } catch {
    return [];
  }
}

function write(items: Capture[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("inbox:changed"));
}

export function listInbox(): Capture[] {
  return read()
    .filter((c) => c.status === "inbox")
    .sort((a, b) => b.capturedAt - a.capturedAt);
}

export function capture(raw: string): Capture | null {
  const { text, tags } = parseCapture(raw);
  if (!text) return null;
  const item: Capture = { id: uid(), text, tags, capturedAt: Date.now(), status: "inbox" };
  write([item, ...read()]);
  return item;
}

export function setStatus(id: string, status: Capture["status"]) {
  write(read().map((c) => (c.id === id ? { ...c, status } : c)));
}

export function ago(epochMs: number): string {
  const s = Math.max(0, Math.round((Date.now() - epochMs) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}
