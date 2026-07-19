/**
 * Agenda helpers: turn "HH:MM" event times into a live "what's next" view.
 * Pure + testable; the widget supplies the current time.
 */

export interface TimedEvent {
  id: string;
  title: string;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

/** Minutes since midnight for a "HH:MM" string; NaN if malformed. */
export function toMinutes(hm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm.trim());
  if (!m) return NaN;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return NaN;
  return h * 60 + min;
}

export type AgendaItem = TimedEvent & {
  startMin: number;
  endMin: number;
  state: "past" | "now" | "upcoming";
};

export function buildAgenda(events: TimedEvent[], nowMin: number): AgendaItem[] {
  return events
    .map((e) => {
      const startMin = toMinutes(e.start);
      const endMin = toMinutes(e.end);
      const state: AgendaItem["state"] =
        nowMin >= startMin && nowMin < endMin ? "now" : nowMin >= endMin ? "past" : "upcoming";
      return { ...e, startMin, endMin, state };
    })
    .sort((a, b) => a.startMin - b.startMin);
}

/** The event happening now, else the next upcoming one, else null (day done). */
export function nextEvent(events: TimedEvent[], nowMin: number): AgendaItem | null {
  const agenda = buildAgenda(events, nowMin);
  return agenda.find((e) => e.state === "now") ?? agenda.find((e) => e.state === "upcoming") ?? null;
}

/** Human countdown to a start time from now (same day). */
export function untilLabel(startMin: number, nowMin: number): string {
  const diff = startMin - nowMin;
  if (diff <= 0) return "now";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `in ${m}m`;
  return m === 0 ? `in ${h}h` : `in ${h}h ${m}m`;
}
