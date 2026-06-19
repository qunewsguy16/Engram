import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Regression test for the flag-parsing bug: z.coerce.boolean() coerced ANY
 * non-empty string (incl. "false") to true, so FEATURE_*=false enabled the
 * feature. Flags must enable only on "true"/"1".
 */
describe("config feature-flag parsing", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.FEATURE_DREAM_LIVE;
    delete process.env.FEATURE_REAL_CONNECTORS;
    delete process.env.FEATURE_MEMORY_EMBEDDINGS;
  });

  it('treats "false" as false', async () => {
    process.env.FEATURE_DREAM_LIVE = "false";
    const { config } = await import("./config");
    expect(config().FEATURE_DREAM_LIVE).toBe(false);
  });

  it('treats "true" and "1" as true', async () => {
    process.env.FEATURE_DREAM_LIVE = "true";
    process.env.FEATURE_REAL_CONNECTORS = "1";
    const { config } = await import("./config");
    expect(config().FEATURE_DREAM_LIVE).toBe(true);
    expect(config().FEATURE_REAL_CONNECTORS).toBe(true);
  });

  it("defaults missing flags to false", async () => {
    const { config } = await import("./config");
    expect(config().FEATURE_MEMORY_EMBEDDINGS).toBe(false);
  });
});
