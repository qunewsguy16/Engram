import { describe, it, expect } from "vitest";
import { todoistConnector } from "./todoist";

function fakeFetch(tasks: unknown[], ok = true): typeof fetch {
  return (async () => {
    return { ok, status: ok ? 200 : 403, json: async () => tasks } as Response;
  }) as unknown as typeof fetch;
}

describe("todoistConnector", () => {
  it("is disconnected when disabled", async () => {
    const c = todoistConnector({ enabled: false, token: "x" });
    expect((await c.health()).status).toBe("disconnected");
    const r = await c.list();
    expect(r.ok).toBe(false);
  });

  it("is disconnected when enabled but tokenless", async () => {
    const c = todoistConnector({ enabled: true });
    expect((await c.health()).status).toBe("disconnected");
  });

  it("returns a live snapshot and counts overdue vs due today", async () => {
    const past = new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    const tasks = [
      { due: { date: past } },
      { due: { date: past } },
      { due: { date: today } },
    ];
    const c = todoistConnector({ enabled: true, token: "t", fetchImpl: fakeFetch(tasks) });
    const r = await c.list();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toBe("live");
      expect(r.data[0]).toEqual({ dueToday: 1, overdue: 2 });
    }
    expect((await c.health()).detail).toContain("due today");
  });

  it("degrades to fail (not throw) on API error", async () => {
    const c = todoistConnector({ enabled: true, token: "t", fetchImpl: fakeFetch([], false) });
    const r = await c.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("todoist_error");
    expect((await c.health()).status).toBe("error");
  });
});
