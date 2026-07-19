import { describe, it, expect } from "vitest";
import { gcalConnector } from "./gcal";

function fakeFetch(items: unknown[], ok = true): typeof fetch {
  return (async () => {
    return { ok, status: ok ? 200 : 401, json: async () => ({ items }) } as Response;
  }) as unknown as typeof fetch;
}

describe("gcalConnector", () => {
  it("is disconnected when disabled", async () => {
    const c = gcalConnector({ enabled: false, token: "x" });
    expect((await c.health()).status).toBe("disconnected");
    const r = await c.list();
    expect(r.ok).toBe(false);
  });

  it("is disconnected when enabled but tokenless", async () => {
    const c = gcalConnector({ enabled: true });
    expect((await c.health()).status).toBe("disconnected");
  });

  it("returns a live snapshot and surfaces the next event", async () => {
    const items = [
      { summary: "1:1", start: { dateTime: "2026-06-20T11:00:00Z" } },
      { summary: "Lunch" },
    ];
    const c = gcalConnector({ enabled: true, token: "t", fetchImpl: fakeFetch(items) });
    const r = await c.list();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toBe("live");
      expect(r.data[0].todayCount).toBe(2);
      expect(r.data[0].nextTitle).toBe("1:1");
    }
    expect((await c.health()).detail).toContain("Next: 1:1");
  });

  it("degrades to fail (not throw) on API error", async () => {
    const c = gcalConnector({ enabled: true, token: "t", fetchImpl: fakeFetch([], false) });
    const r = await c.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("gcal_error");
    expect((await c.health()).status).toBe("error");
  });
});
