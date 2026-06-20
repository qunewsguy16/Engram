import { describe, it, expect, vi } from "vitest";
import { useTestDb } from "../../test/stubs/db";
import { generateDream } from "./dream";
import { capture } from "@/lib/inbox";
import { saveReview } from "@/lib/review";
import { latestDream, listRecentDreams } from "@/lib/dreamRuns";
import { DreamSchema } from "@/lib/ai/schema";

// next/cache's revalidatePath is a no-op outside a Next request.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

describe("generateDream action", () => {
  useTestDb();

  it("returns a schema-valid mock dream from an empty SQLite DB", async () => {
    const { dream, source } = await generateDream();
    expect(source).toBe("mock");
    expect(() => DreamSchema.parse(dream)).not.toThrow();
  });

  it("incorporates captures + review learnings from the DB and still validates", async () => {
    capture("look into RRF");
    capture("benchmark rerank");
    saveReview({ learned: "consolidation helps long-horizon recall" });
    const { dream } = await generateDream();
    expect(() => DreamSchema.parse(dream)).not.toThrow();
    expect(dream.oneThing.length).toBeGreaterThan(0);
  });

  it("persists every run into dream_runs", async () => {
    expect(latestDream()).toBeNull();
    await generateDream();
    await generateDream();
    const recent = listRecentDreams(10);
    expect(recent).toHaveLength(2);
    expect(recent[0].source).toBe("mock");
    expect(latestDream()?.id).toBe(recent[0].id);
  });
});
