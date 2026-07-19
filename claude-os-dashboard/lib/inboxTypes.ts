/**
 * Pure types + format helpers for the capture inbox. Safe to import in client
 * components; the SQLite-backed store is in lib/inbox.ts (server-only).
 */
export interface Capture {
  id: string;
  text: string;
  tags: string[];
  capturedAt: number;
  status: "inbox" | "archived" | "promoted";
}

/** Relative-time formatter for epoch millis. */
export function ago(epochMs: number): string {
  const s = Math.max(0, Math.round((Date.now() - epochMs) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}
