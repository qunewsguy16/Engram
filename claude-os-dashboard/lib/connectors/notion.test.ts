import { describe, it, expect } from "vitest";
import { notionConnector } from "./notion";

function fakeFetch(results: unknown[], ok = true): typeof fetch {
  return (async () => {
    return { ok, status: ok ? 200 : 401, json: async () => ({ results }) } as Response;
  }) as unknown as typeof fetch;
}

describe("notionConnector", () => {
  it("is disconnected when disabled", async () => {
    const c = notionConnector({ enabled: false, token: "x" });
    expect((await c.health()).status).toBe("disconnected");
    const r = await c.list();
    expect(r.ok).toBe(false);
  });

  it("is disconnected when enabled but tokenless", async () => {
    const c = notionConnector({ enabled: true });
    expect((await c.health()).status).toBe("disconnected");
  });

  it("returns a live snapshot and surfaces the edited page count", async () => {
    const results = [{}, {}, {}];
    const c = notionConnector({ enabled: true, token: "t", fetchImpl: fakeFetch(results) });
    const r = await c.list();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toBe("live");
      expect(r.data[0].editedPages).toBe(3);
    }
    expect((await c.health()).detail).toContain("3 pages");
  });

  it("degrades to fail (not throw) on API error", async () => {
    const c = notionConnector({ enabled: true, token: "t", fetchImpl: fakeFetch([], false) });
    const r = await c.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("notion_error");
    expect((await c.health()).status).toBe("error");
  });
});
