/**
 * Quick-capture inbox. Persistence + reactivity come from the shared
 * localStore (DB deferred per DECISIONS.md). The Capture shape and parse
 * helpers are stable; swapping the backing store is one line.
 */
import { createLocalStore, uid, ago } from "./localStore";

export { ago };

export interface Capture {
  id: string;
  text: string;
  tags: string[];
  capturedAt: number; // epoch ms
  status: "inbox" | "archived" | "promoted";
}

const store = createLocalStore<Capture>("engram-os:inbox:v1");

/** Pull #tags out of the raw text and return both. */
export function parseCapture(raw: string): { text: string; tags: string[] } {
  const tags: string[] = [];
  for (const m of raw.matchAll(/(?:^|\s)#([a-z0-9][\w-]{0,40})/gi)) tags.push(m[1].toLowerCase());
  const text = raw.replace(/(?:^|\s)#[a-z0-9][\w-]{0,40}/gi, "").trim().replace(/\s+/g, " ");
  return { text, tags: Array.from(new Set(tags)) };
}

export function listInbox(): Capture[] {
  return store
    .all()
    .filter((c) => c.status === "inbox")
    .sort((a, b) => b.capturedAt - a.capturedAt);
}

/** Recent capture texts (any status) for feeding into /dream. */
export function recentCaptureTexts(limit = 10): string[] {
  return store
    .all()
    .sort((a, b) => b.capturedAt - a.capturedAt)
    .slice(0, limit)
    .map((c) => c.text);
}

export function capture(raw: string): Capture | null {
  const { text, tags } = parseCapture(raw);
  if (!text) return null;
  const item: Capture = { id: uid(), text, tags, capturedAt: Date.now(), status: "inbox" };
  store.set([item, ...store.all()]);
  return item;
}

export function setStatus(id: string, status: Capture["status"]) {
  store.set(store.all().map((c) => (c.id === id ? { ...c, status } : c)));
}

export function subscribeInbox(fn: () => void): () => void {
  return store.subscribe(fn);
}
