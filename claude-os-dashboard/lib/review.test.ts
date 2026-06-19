import { describe, it, expect, beforeEach } from "vitest";
import { installLocalStorageShim, resetLocalStorage } from "../test/stubs/localstorage";

installLocalStorageShim();

import { saveReview, getReview, reviewStreak, listRecentReviews, todayKey } from "./review";

beforeEach(() => resetLocalStorage());

describe("review store", () => {
  it("upserts one entry per day (no duplicates)", () => {
    saveReview({ oneThingDone: false, learned: "first" });
    saveReview({ oneThingDone: true, learned: "amended" });
    const all = listRecentReviews(10);
    expect(all).toHaveLength(1);
    expect(all[0].oneThingDone).toBe(true);
    expect(all[0].learned).toBe("amended");
  });

  it("merges partial patches, preserving untouched fields", () => {
    saveReview({ learned: "kept" });
    saveReview({ oneThingDone: true });
    const r = getReview()!;
    expect(r.learned).toBe("kept");
    expect(r.oneThingDone).toBe(true);
  });

  it("counts a consecutive streak ending today", () => {
    const day = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      return todayKey(d);
    };
    saveReview({ learned: "d0" }, day(0));
    saveReview({ learned: "d1" }, day(1));
    saveReview({ learned: "d2" }, day(2));
    expect(reviewStreak()).toBe(3);
  });

  it("does not break the streak when today is still pending", () => {
    const day = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      return todayKey(d);
    };
    // Reviewed yesterday + day before, but not yet today.
    saveReview({ learned: "d1" }, day(1));
    saveReview({ learned: "d2" }, day(2));
    expect(reviewStreak()).toBe(2);
  });

  it("breaks the streak across a gap", () => {
    const day = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      return todayKey(d);
    };
    saveReview({ learned: "today" }, day(0));
    // gap at day(1)
    saveReview({ learned: "older" }, day(2));
    expect(reviewStreak()).toBe(1);
  });
});
