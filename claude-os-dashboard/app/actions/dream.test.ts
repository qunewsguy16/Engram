import { describe, it, expect } from "vitest";
import { useTestDb } from "../../test/stubs/db";
import { generateDream } from "./dream";
import { capture } from "@/lib/inbox";
import { saveReview } from "@/lib/review";
import { DreamSchema } from "@/lib/ai/schema";

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
});
