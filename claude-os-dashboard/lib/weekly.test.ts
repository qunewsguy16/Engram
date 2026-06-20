import { describe, it, expect } from "vitest";
import { buildWeeklyDigest } from "./weekly";

describe("buildWeeklyDigest", () => {
  it("handles empty inputs", () => {
    const d = buildWeeklyDigest([], [], []);
    expect(d.daysReviewed).toBe(0);
    expect(d.oneThingDoneCount).toBe(0);
    expect(d.oneThingDoneRate).toBe(0);
    expect(d.learnings).toEqual([]);
    expect(d.concepts).toEqual([]);
    expect(d.habitSummary).toEqual([]);
  });

  it("aggregates mixed reviews and drops empty learnings", () => {
    const d = buildWeeklyDigest(
      [
        { oneThingDone: true, learned: "shipped the parser" },
        { oneThingDone: false, learned: "" },
        { oneThingDone: true, learned: "RAG needs eval gates" },
      ],
      [],
      [],
    );
    expect(d.daysReviewed).toBe(3);
    expect(d.oneThingDoneCount).toBe(2);
    expect(d.oneThingDoneRate).toBe(67);
    expect(d.learnings).toEqual(["shipped the parser", "RAG needs eval gates"]);
  });

  it("computes habit done/window over the last 7 of the log", () => {
    const log14 = [
      true, true, false, true, true, false, true, // first 7: 5 done
      false, false, false, false, false, false, false,
    ];
    const d = buildWeeklyDigest([], [], [{ label: "Deep work", log: log14 }]);
    expect(d.habitSummary).toEqual([{ label: "Deep work", done: 5, window: 7 }]);
  });

  it("uses log length as window when shorter than 7", () => {
    const d = buildWeeklyDigest([], [], [{ label: "Short", log: [true, false, true] }]);
    expect(d.habitSummary).toEqual([{ label: "Short", done: 2, window: 3 }]);
  });

  it("filters empty takeaways from concepts", () => {
    const d = buildWeeklyDigest(
      [],
      [{ takeaway: "attention is routing" }, { takeaway: "" }, { takeaway: "diffusion = denoising" }],
      [],
    );
    expect(d.concepts).toEqual(["attention is routing", "diffusion = denoising"]);
  });
});
