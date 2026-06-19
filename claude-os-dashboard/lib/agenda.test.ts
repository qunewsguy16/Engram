import { describe, it, expect } from "vitest";
import { toMinutes, buildAgenda, nextEvent, untilLabel, type TimedEvent } from "./agenda";

const evs: TimedEvent[] = [
  { id: "a", title: "Standup", start: "09:00", end: "09:30" },
  { id: "b", title: "Deep work", start: "10:00", end: "11:30" },
  { id: "c", title: "Lunch", start: "12:30", end: "13:15" },
];

describe("toMinutes", () => {
  it("parses HH:MM", () => {
    expect(toMinutes("09:30")).toBe(570);
    expect(toMinutes("00:00")).toBe(0);
    expect(toMinutes("23:59")).toBe(1439);
  });
  it("returns NaN for malformed or out-of-range", () => {
    expect(toMinutes("9am")).toBeNaN();
    expect(toMinutes("25:00")).toBeNaN();
    expect(toMinutes("10:75")).toBeNaN();
  });
});

describe("buildAgenda", () => {
  it("classifies past/now/upcoming and sorts by start", () => {
    const a = buildAgenda(evs, toMinutes("10:15"));
    expect(a.map((e) => e.state)).toEqual(["past", "now", "upcoming"]);
    expect(a.map((e) => e.id)).toEqual(["a", "b", "c"]);
  });
});

describe("nextEvent", () => {
  it("returns the in-progress event when one is happening", () => {
    expect(nextEvent(evs, toMinutes("10:15"))?.id).toBe("b");
  });
  it("returns the next upcoming when between events", () => {
    expect(nextEvent(evs, toMinutes("09:45"))?.id).toBe("b");
  });
  it("returns null when the day is over", () => {
    expect(nextEvent(evs, toMinutes("14:00"))).toBeNull();
  });
});

describe("untilLabel", () => {
  it("formats minutes and hours", () => {
    expect(untilLabel(600, 585)).toBe("in 15m");
    expect(untilLabel(600, 480)).toBe("in 2h");
    expect(untilLabel(600, 495)).toBe("in 1h 45m");
  });
  it("says now when due or passed", () => {
    expect(untilLabel(600, 600)).toBe("now");
    expect(untilLabel(600, 620)).toBe("now");
  });
});
