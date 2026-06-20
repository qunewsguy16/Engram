import { describe, it, expect } from "vitest";
import { defineConnector } from "./define";

const make = defineConnector<{ n: number }>({
  meta: { id: "t", name: "Test", category: "code" },
  errorCode: "t_error",
  disabledDetail: "off",
  fetchSnapshot: async () => ({ n: 7 }),
  detail: (s) => `n=${s.n}`,
});

const makeBoom = defineConnector<{ n: number }>({
  meta: { id: "t", name: "Test", category: "code" },
  errorCode: "t_error",
  disabledDetail: "off",
  fetchSnapshot: async () => {
    throw new Error("boom");
  },
  detail: (s) => `n=${s.n}`,
});

describe("defineConnector lifecycle", () => {
  it("disabled (no token): list ok:false, health disconnected/off", async () => {
    const c = make({ enabled: false, token: "x" });
    const r = await c.list();
    expect(r.ok).toBe(false);
    const h = await c.health();
    expect(h.status).toBe("disconnected");
    expect(h.detail).toBe("off");
  });

  it("enabled but tokenless: health disconnected", async () => {
    const c = make({ enabled: true });
    const h = await c.health();
    expect(h.status).toBe("disconnected");
  });

  it("live: list ok:true/live with data, health connected with detail", async () => {
    const c = make({ enabled: true, token: "t" });
    const r = await c.list();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toBe("live");
      expect(r.data[0].n).toBe(7);
    }
    const h = await c.health();
    expect(h.status).toBe("connected");
    expect(h.detail).toBe("n=7");
  });

  it("error: list ok:false with errorCode, health error with message", async () => {
    const c = makeBoom({ enabled: true, token: "t" });
    const r = await c.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("t_error");
    const h = await c.health();
    expect(h.status).toBe("error");
    expect(h.detail).toBe("boom");
  });
});
