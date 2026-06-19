/**
 * Minimal localStorage + window shim for unit-testing the browser stores in
 * the node vitest environment (no jsdom dependency needed).
 */
class MemStorage {
  private m = new Map<string, string>();
  getItem(k: string) {
    return this.m.has(k) ? this.m.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, String(v));
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
  clear() {
    this.m.clear();
  }
}

export function installLocalStorageShim() {
  const g = globalThis as Record<string, unknown>;
  const listeners = new Set<(e: unknown) => void>();
  g.localStorage = new MemStorage();
  g.window = {
    localStorage: g.localStorage,
    addEventListener: (_t: string, fn: (e: unknown) => void) => listeners.add(fn),
    removeEventListener: (_t: string, fn: (e: unknown) => void) => listeners.delete(fn),
    dispatchEvent: (e: unknown) => {
      listeners.forEach((fn) => fn(e));
      return true;
    },
  };
  // CustomEvent shim (node has it in recent versions, but be safe).
  if (typeof (g as { CustomEvent?: unknown }).CustomEvent === "undefined") {
    g.CustomEvent = class<T> {
      type: string;
      detail: T;
      constructor(type: string, init?: { detail?: T }) {
        this.type = type;
        this.detail = (init?.detail as T) ?? (undefined as T);
      }
    };
  }
}

export function resetLocalStorage() {
  (globalThis as unknown as { localStorage?: MemStorage }).localStorage?.clear();
}
