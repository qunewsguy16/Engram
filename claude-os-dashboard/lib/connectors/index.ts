import "server-only";
import type { Category, Connector, ConnectorMeta, Health, Result } from "./types";
import { ok } from "./types";
import { githubConnector, type GithubSnapshot } from "./github";
import { gcalConnector } from "./gcal";
import { todoistConnector } from "./todoist";
import { gmailConnector } from "./gmail";
import { notionConnector } from "./notion";
import { driveConnector } from "./drive";
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

// Engram RAG stays mock until a feature needs it (no public API to hit).
const mocks: Connector<unknown>[] = [
  mockConnector({ id: "engram-rag", name: "Engram RAG", category: "memory" }, "connected", "428 notes indexed", 0),
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
  const enabled = flag("FEATURE_REAL_CONNECTORS");
  const live = [
    [gcalConnector, process.env.GOOGLE_CALENDAR_TOKEN],
    [todoistConnector, process.env.TODOIST_TOKEN],
    [gmailConnector, process.env.GMAIL_TOKEN],
    [notionConnector, process.env.NOTION_TOKEN],
    [driveConnector, process.env.GOOGLE_DRIVE_TOKEN],
  ] as const;
  return [
    makeGithub(),
    ...live.map(([make, token]) => make({ enabled, token })),
    ...mocks,
  ] as Connector<unknown>[];
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
