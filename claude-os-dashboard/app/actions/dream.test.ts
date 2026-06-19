import { describe, it, expect } from "vitest";
import { generateDream } from "./dream";
import { DreamSchema } from "@/lib/ai/schema";

describe("generateDream action", () => {
  it("returns a schema-valid mock dream with no client signals", async () => {
    const { dream, source } = await generateDream();
    expect(source).toBe("mock");
    expect(() => DreamSchema.parse(dream)).not.toThrow();
  });

  it("accepts client captures + learnings and still validates", async () => {
    const { dream } = await generateDream({
      captures: ["look into RRF", "benchmark rerank"],
      learnings: ["consolidation helps long-horizon recall"],
    });
    expect(() => DreamSchema.parse(dream)).not.toThrow();
    expect(dream.oneThing.length).toBeGreaterThan(0);
  });
});
