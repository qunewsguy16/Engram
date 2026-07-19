import { describe, it, expect } from "vitest";
import { driveConnector } from "./drive";

function fakeFetch(files: unknown[], ok = true): typeof fetch {
  return (async () => {
    return { ok, status: ok ? 200 : 401, json: async () => ({ files }) } as Response;
  }) as unknown as typeof fetch;
}

describe("driveConnector", () => {
  it("is disconnected when disabled", async () => {
    const c = driveConnector({ enabled: false, token: "x" });
    expect((await c.health()).status).toBe("disconnected");
    const r = await c.list();
    expect(r.ok).toBe(false);
  });

  it("is disconnected when enabled but tokenless", async () => {
    const c = driveConnector({ enabled: true });
    expect((await c.health()).status).toBe("disconnected");
  });

  it("returns a live snapshot and surfaces the latest file", async () => {
    const files = [{ name: "notes.md" }, { name: "x" }];
    const c = driveConnector({ enabled: true, token: "t", fetchImpl: fakeFetch(files) });
    const r = await c.list();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toBe("live");
      expect(r.data[0].recentFiles).toBe(2);
      expect(r.data[0].latestName).toBe("notes.md");
    }
    expect((await c.health()).detail).toContain("Latest: notes.md");
  });

  it("degrades to fail (not throw) on API error", async () => {
    const c = driveConnector({ enabled: true, token: "t", fetchImpl: fakeFetch([], false) });
    const r = await c.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("drive_error");
    expect((await c.health()).status).toBe("error");
  });
});
