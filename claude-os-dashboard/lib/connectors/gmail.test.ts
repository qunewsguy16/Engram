import { describe, it, expect } from "vitest";
import { gmailConnector } from "./gmail";

function fakeFetch(body: unknown, ok = true): typeof fetch {
  return (async () => {
    return { ok, status: ok ? 200 : 401, json: async () => body } as Response;
  }) as unknown as typeof fetch;
}

describe("gmailConnector", () => {
  it("is disconnected when disabled", async () => {
    const c = gmailConnector({ enabled: false, token: "x" });
    expect((await c.health()).status).toBe("disconnected");
    const r = await c.list();
    expect(r.ok).toBe(false);
  });

  it("is disconnected when enabled but tokenless", async () => {
    const c = gmailConnector({ enabled: true });
    expect((await c.health()).status).toBe("disconnected");
  });

  it("returns a live snapshot with unread count", async () => {
    const c = gmailConnector({ enabled: true, token: "t", fetchImpl: fakeFetch({ resultSizeEstimate: 12 }) });
    const r = await c.list();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toBe("live");
      expect(r.data[0].unread).toBe(12);
    }
    expect((await c.health()).detail).toContain("12 unread");
  });

  it("defaults unread to 0 when resultSizeEstimate is missing", async () => {
    const c = gmailConnector({ enabled: true, token: "t", fetchImpl: fakeFetch({}) });
    const r = await c.list();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data[0].unread).toBe(0);
  });

  it("degrades to fail (not throw) on API error", async () => {
    const c = gmailConnector({ enabled: true, token: "t", fetchImpl: fakeFetch({}, false) });
    const r = await c.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("gmail_error");
    expect((await c.health()).status).toBe("error");
  });
});
