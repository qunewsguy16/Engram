import { describe, it, expect } from "vitest";
import { githubConnector } from "./github";

function fakeFetch(prs: unknown[], commits: unknown[], prOk = true): typeof fetch {
  return (async (url: string) => {
    const body = String(url).includes("/pulls") ? prs : commits;
    const okFlag = String(url).includes("/pulls") ? prOk : true;
    return { ok: okFlag, status: okFlag ? 200 : 403, json: async () => body } as Response;
  }) as unknown as typeof fetch;
}

describe("githubConnector", () => {
  it("is disconnected when disabled", async () => {
    const c = githubConnector({ enabled: false, token: "x" });
    expect((await c.health()).status).toBe("disconnected");
    const r = await c.list();
    expect(r.ok).toBe(false);
  });

  it("is disconnected when enabled but tokenless", async () => {
    const c = githubConnector({ enabled: true });
    expect((await c.health()).status).toBe("disconnected");
  });

  it("returns a live snapshot and counts review-requested PRs", async () => {
    const prs = [
      { draft: false, requested_reviewers: [{}] },
      { draft: true, requested_reviewers: [] },
      { draft: false },
    ];
    const c = githubConnector({ enabled: true, token: "t", fetchImpl: fakeFetch(prs, [1, 2, 3, 4]) });
    const r = await c.list();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toBe("live");
      expect(r.data[0]).toEqual({ openPRs: 3, needsReview: 1, recentCommits: 4 });
    }
    expect((await c.health()).detail).toContain("3 open PRs");
  });

  it("degrades to fail (not throw) on API error", async () => {
    const c = githubConnector({ enabled: true, token: "t", fetchImpl: fakeFetch([], [], false) });
    const r = await c.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("github_error");
    expect((await c.health()).status).toBe("error");
  });
});
