import type { Category, Connector, ConnectorMeta, Health, Result } from "./types";
import { ok } from "./types";
import { githubConnector, type GithubSnapshot } from "./github";
import { flag } from "../flags";

/**
 * Connector registry. The GitHub entry is a real live connector (gated);
 * the rest are mocks implementing the same interface so the degradation path
 * is exercised now — Phase 1 swaps each mock body for an MCP/API-backed read
 * without touching widgets. `summary` is the per-connector status-tile line.
 */
interface MockItem {
  summary: string;
}

function mockConnector(
  meta: ConnectorMeta,
  status: Health["status"],
  summary: string,
  ageMs: number,
): Connector<MockItem> {
  return {
    meta,
    async list(): Promise<Result<MockItem[]>> {
      const r = ok([{ summary }], "mock");
      return { ...r, fetchedAt: Date.now() - ageMs };
    },
    async health(): Promise<Health> {
      return { status, checkedAt: Date.now() - ageMs, detail: summary };
    },
  };
}

const MIN = 60_000;

const mocks: Connector<unknown>[] = [
  mockConnector({ id: "gcal", name: "Google Calendar", category: "calendar" }, "connected", "Next: 1:1 in 45m", 1 * MIN),
  mockConnector({ id: "todoist", name: "Todoist", category: "tasks" }, "connected", "7 due today - 2 overdue", 30_000),
  mockConnector({ id: "gmail", name: "Gmail", category: "mail" }, "connected", "12 unread - 2 flagged", 5 * MIN),
  mockConnector({ id: "engram-rag", name: "Engram RAG", category: "memory" }, "connected", "428 notes indexed", 0),
  mockConnector({ id: "gdrive", name: "Google Drive", category: "notes" }, "disconnected", "Click to connect", 0),
];

function makeGithub() {
  return githubConnector({
    enabled: flag("FEATURE_REAL_CONNECTORS"),
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO,
  });
}

/** Build the live registry, reading env at call time (not import). */
export function getConnectors(): Connector<unknown>[] {
  return [makeGithub() as Connector<unknown>, ...mocks];
}

/** Typed accessor for widgets that want live GitHub data; null when off/erroring. */
export async function githubSnapshot(): Promise<GithubSnapshot | null> {
  const r = await makeGithub().list();
  return r.ok && r.data[0] ? r.data[0] : null;
}

export interface ConnectorTile {
  id: string;
  name: string;
  category: Category;
  status: Health["status"];
  summary?: string;
  checkedAt: number;
}

/** Health summaries for the Connectors footer. */
export async function getConnectorTiles(): Promise<ConnectorTile[]> {
  return Promise.all(
    getConnectors().map(async (c) => {
      const h = await c.health();
      return {
        id: c.meta.id,
        name: c.meta.name,
        category: c.meta.category,
        status: h.status,
        summary: h.detail,
        checkedAt: h.checkedAt,
      };
    }),
  );
}

/** Relative-time formatter for epoch millis (e.g. "2m ago", "just now"). */
export function ago(epochMs: number): string {
  const s = Math.max(0, Math.round((Date.now() - epochMs) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return `${h}h ago`;
}
