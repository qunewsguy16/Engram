import { describe, it, expect } from "vitest";
import { getConnectors, getConnectorTiles, ago } from "./index";

describe("connector registry", () => {
  it("every connector list() returns a well-formed Result", async () => {
    for (const c of getConnectors()) {
      const r = await c.list();
      expect(typeof r.ok).toBe("boolean");
      expect(typeof r.fetchedAt).toBe("number");
      if (r.ok) expect(["live", "mock"]).toContain(r.source);
      else expect(r.error.code).toBeTruthy();
    }
  });

  it("getConnectorTiles summarizes health with epoch timestamps", async () => {
    const tiles = await getConnectorTiles();
    expect(tiles.length).toBe(getConnectors().length);
    expect(tiles.every((t) => typeof t.checkedAt === "number")).toBe(true);
    expect(tiles.some((t) => t.id === "github")).toBe(true);
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
