/**
 * Generic localStorage-backed collection, SSR-safe and reactive.
 *
 * Both the inbox and the daily review use this so their persistence logic
 * can't diverge. When SQLite lands (DECISIONS.md), swapping the backing here
 * updates every consumer at once. Reactivity: a key-scoped CustomEvent for
 * same-tab updates plus the native `storage` event for cross-tab.
 */

export interface LocalStore<T> {
  all(): T[];
  set(items: T[]): void;
  subscribe(fn: () => void): () => void;
}

const EVENT = "localstore:changed";

export function createLocalStore<T>(key: string): LocalStore<T> {
  function all(): T[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  }

  function set(items: T[]): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { key } }));
  }

  function subscribe(fn: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    const onLocal = (e: Event) => {
      if ((e as CustomEvent).detail?.key === key) fn();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) fn();
    };
    window.addEventListener(EVENT, onLocal);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, onLocal);
      window.removeEventListener("storage", onStorage);
    };
  }

  return { all, set, subscribe };
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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
