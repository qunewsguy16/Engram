import { describe, it, expect } from "vitest";
import { getConnectorTiles, ago, connectorRegistry } from "./index";

describe("connector registry", () => {
  it("every connector list() returns a Result with provenance", async () => {
    for (const c of connectorRegistry) {
      const r = await c.list();
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.source).toBe("mock");
        expect(typeof r.fetchedAt).toBe("number");
      }
    }
  });

  it("getConnectorTiles summarizes health with epoch timestamps", async () => {
    const tiles = await getConnectorTiles();
    expect(tiles.length).toBe(connectorRegistry.length);
    expect(tiles.every((t) => typeof t.checkedAt === "number")).toBe(true);
    expect(tiles.some((t) => t.status === "connected")).toBe(true);
  });
});

describe("ago", () => {
  it("formats relative time from epoch millis", () => {
    const now = Date.now();
    expect(ago(now)).toBe("just now");
    expect(ago(now - 90_000)).toMatch(/m ago/);
    expect(ago(now - 3 * 3600_000)).toMatch(/h ago/);
  });
});
