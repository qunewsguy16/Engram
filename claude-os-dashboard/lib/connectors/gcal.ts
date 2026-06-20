import "server-only";
import { defineConnector } from "./define";

/** Live Google Calendar connector. Lifecycle from defineConnector. */
export interface GcalSnapshot {
  todayCount: number;
  nextTitle?: string;
  nextStart?: string;
}

interface Event {
  summary?: string;
  start?: { dateTime?: string; date?: string };
}

export const gcalConnector = defineConnector<GcalSnapshot>({
  meta: { id: "gcal", name: "Google Calendar", category: "calendar" },
  errorCode: "gcal_error",
  disabledDetail: "Set the calendar token + FEATURE_REAL_CONNECTORS",
  async fetchSnapshot(token, f) {
    const res = await f(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=10",
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error(`Google Calendar ${res.status}`);
    const { items } = (await res.json()) as { items: Event[] };
    return {
      todayCount: items.length,
      nextTitle: items[0]?.summary,
      nextStart: items[0]?.start?.dateTime ?? items[0]?.start?.date,
    };
  },
  detail: (s) => (s.nextTitle ? `Next: ${s.nextTitle}` : `${s.todayCount} events`),
});
