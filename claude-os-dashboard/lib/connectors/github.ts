import "server-only";
import type { Connector, Health, Result } from "./types";
import { ok, fail } from "./types";

// owner/repo only — prevents path/SSRF injection if `repo` ever becomes
// user-supplied rather than operator env.
const REPO_RE = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;

/**
 * Reference live connector. The other six follow this exact shape:
 *  - gated by FEATURE_REAL_CONNECTORS + a credential
 *  - list() returns Result (live on success, fail+fallback on error)
 *  - health() never throws — it reports status
 * fetch is injectable so the parsing + degradation paths are unit-tested
 * without network.
 */

export interface GithubSnapshot {
  openPRs: number;
  needsReview: number;
  recentCommits: number;
}

export interface GithubDeps {
  enabled?: boolean;
  token?: string;
  repo?: string; // "owner/repo"
  fetchImpl?: typeof fetch;
}

interface PR {
  draft: boolean;
  requested_reviewers?: unknown[];
}

export function githubConnector(deps: GithubDeps = {}): Connector<GithubSnapshot> {
  const enabled = deps.enabled ?? false;
  const repo = deps.repo ?? "qunewsguy16/Engram";
  const f = deps.fetchImpl ?? fetch;
  const meta = { id: "github", name: "GitHub", category: "code" as const };

  async function snapshot(): Promise<GithubSnapshot> {
    if (!deps.token) throw new Error("missing GITHUB_TOKEN");
    if (!REPO_RE.test(repo)) throw new Error("invalid repo");
    const headers = { Authorization: `Bearer ${deps.token}`, Accept: "application/vnd.github+json" };
    // Independent reads — fire together rather than serially.
    const [prRes, cRes] = await Promise.all([
      f(`https://api.github.com/repos/${repo}/pulls?state=open&per_page=100`, { headers }),
      f(`https://api.github.com/repos/${repo}/commits?per_page=20`, { headers }),
    ]);
    if (!prRes.ok) throw new Error(`GitHub PRs ${prRes.status}`);
    const prs = (await prRes.json()) as PR[];
    const recentCommits = cRes.ok ? ((await cRes.json()) as unknown[]).length : 0;
    return {
      openPRs: prs.length,
      needsReview: prs.filter((p) => (p.requested_reviewers?.length ?? 0) > 0).length,
      recentCommits,
    };
  }

  return {
    meta,
    async list(): Promise<Result<GithubSnapshot[]>> {
      if (!enabled || !deps.token) return fail("disabled", "GitHub live reads are off", []);
      try {
        return ok([await snapshot()], "live");
      } catch (e) {
        return fail("github_error", (e as Error).message, []);
      }
    },
    async health(): Promise<Health> {
      if (!enabled || !deps.token) {
        return { status: "disconnected", checkedAt: Date.now(), detail: "Set GITHUB_TOKEN + FEATURE_REAL_CONNECTORS" };
      }
      try {
        const s = await snapshot();
        return { status: "connected", checkedAt: Date.now(), detail: `${s.openPRs} open PRs - ${s.needsReview} need review` };
      } catch (e) {
        return { status: "error", checkedAt: Date.now(), detail: (e as Error).message };
      }
    },
  };
}
