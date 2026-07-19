import type { DreamSignal, MemoryBlob } from "./schema";

/**
 * Pure-TS signal reduction — no model call. For one person's day the raw
 * signal is well under the synthesis model's context window, so an LLM reduce
 * pass would be wasted cost (AI audit #9). This is deterministic, free, and
 * unit-testable: it drops noise, dedupes, caps each category, and assigns the
 * stable IDs that the dream output cites for grounding.
 */

export interface RawSignals {
  commits?: { sha: string; message: string; at?: string }[];
  tasks?: { content: string; at?: string }[];
  notes?: { title: string; at?: string }[];
  calendar?: { title: string; at?: string }[];
  reading?: { title: string; at?: string }[];
}

const CAPS = { commit: 15, task: 25, note: 15, calendar: 10, reading: 10 } as const;

// Commit messages that carry no planning signal.
const NOISE = /^(merge|revert|wip|bump|chore\(deps\)|ci:|fixup!)/i;

function norm(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

export function reduceSignals(raw: RawSignals, date = new Date().toISOString().slice(0, 10)): MemoryBlob {
  const signals: DreamSignal[] = [];
  const seen = new Set<string>();
  const push = (kind: DreamSignal["kind"], prefix: string, text: string, at?: string, cap = 9999) => {
    const key = `${kind}:${norm(text)}`;
    if (!text.trim() || seen.has(key)) return;
    const countOfKind = signals.filter((s) => s.kind === kind).length;
    if (countOfKind >= cap) return;
    seen.add(key);
    signals.push({ id: `${prefix}${countOfKind + 1}`, kind, text: text.trim(), at });
  };

  for (const c of raw.commits ?? []) {
    if (NOISE.test(c.message)) continue;
    push("commit", "c", c.message, c.at, CAPS.commit);
  }
  for (const t of raw.tasks ?? []) push("task", "t", t.content, t.at, CAPS.task);
  for (const n of raw.notes ?? []) push("note", "n", n.title, n.at, CAPS.note);
  for (const e of raw.calendar ?? []) push("calendar", "e", e.title, e.at, CAPS.calendar);
  for (const r of raw.reading ?? []) push("reading", "r", r.title, r.at, CAPS.reading);

  return { date, signals };
}

/** Render the blob as the numbered, ID'd text the model grounds against. */
export function renderBlob(blob: MemoryBlob): string {
  if (blob.signals.length === 0) return `Date: ${blob.date}\n(no signals)`;
  const lines = blob.signals.map((s) => `[${s.id}] (${s.kind}) ${s.text}`);
  return `Date: ${blob.date}\nSignals:\n${lines.join("\n")}`;
}
