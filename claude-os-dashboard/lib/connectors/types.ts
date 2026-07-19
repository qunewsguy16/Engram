export type Category = "code" | "memory" | "tasks" | "calendar" | "mail" | "notes";

export type ConnectorStatus = "connected" | "disconnected" | "error";

/**
 * Every connector read returns a Result. This models the live world the
 * dashboard needs from day one: success carries provenance (live vs mock) and
 * staleness; failure carries an error and an optional mock fallback so widgets
 * can degrade gracefully instead of throwing. Timestamps are epoch millis so
 * they can be aged/sorted; relative formatting happens in the component.
 */
export type Result<T> =
  | { ok: true; data: T; source: "live" | "mock"; stale: boolean; fetchedAt: number }
  | { ok: false; error: { code: string; message: string }; fallback?: T; source: "mock"; fetchedAt: number };

export interface Health {
  status: ConnectorStatus;
  latencyMs?: number;
  checkedAt: number;
  detail?: string;
}

export interface ConnectorMeta {
  id: string;
  name: string;
  category: Category;
}

export interface Connector<TItem = unknown> {
  meta: ConnectorMeta;
  list(): Promise<Result<TItem[]>>;
  health(): Promise<Health>;
}

export function ok<T>(data: T, source: "live" | "mock" = "live", stale = false): Result<T> {
  return { ok: true, data, source, stale, fetchedAt: Date.now() };
}

export function fail<T>(code: string, message: string, fallback?: T): Result<T> {
  return { ok: false, error: { code, message }, fallback, source: "mock", fetchedAt: Date.now() };
}
