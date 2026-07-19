import { describe, it, expect } from "vitest";
import { useTestDb } from "../test/stubs/db";

import { recordDream, latestDream, listRecentDreams } from "./dreamRuns";
import { buildMockDream } from "./ai/dream";
import { reduceSignals } from "./ai/reduce";

const blob = reduceSignals({ commits: [{ sha: "a", message: "ship ablation section" }] });
const dream = buildMockDream(blob);

describe("dreamRuns store", () => {
  useTestDb();

  it("records a dream and reads it back via latestDream", () => {
    const run = recordDream(dream, "mock");
    const got = latestDream();
    expect(got?.id).toBe(run.id);
    expect(got?.source).toBe("mock");
    expect(got?.dream.oneThing).toBe(dream.oneThing);
  });

  it("returns null when there are no runs", () => {
    expect(latestDream()).toBeNull();
  });

  it("listRecentDreams returns newest first, limited", () => {
    const a = recordDream(dream, "mock");
    const b = recordDream({ ...dream, oneThing: "second" }, "mock");
    const c = recordDream({ ...dream, oneThing: "third" }, "live");
    const recent = listRecentDreams(2);
    expect(recent).toHaveLength(2);
    expect(recent[0].id).toBe(c.id);
    expect(recent[1].id).toBe(b.id);
    expect(recent[0].source).toBe("live");
    // a is the oldest and outside the limit
    expect(recent.find((r) => r.id === a.id)).toBeUndefined();
  });

  it("preserves nested Dream JSON shape through the round-trip", () => {
    const r = recordDream(dream, "mock");
    expect(latestDream()?.dream.suggestedActions).toEqual(r.dream.suggestedActions);
  });
});
