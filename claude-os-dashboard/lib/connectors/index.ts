import type { Category, Connector, ConnectorMeta, Health, Result } from "./types";
import { ok } from "./types";

/**
 * Mock connector registry. Each connector implements the live interface
 * (list returns a Result, plus health) so the degradation path is exercised
 * now — Phase 1 swaps the mock bodies for MCP-backed reads without touching
 * widgets. `summary` is a per-connector one-liner for the status tiles.
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

export const connectorRegistry: Connector<MockItem>[] = [
  mockConnector({ id: "github", name: "GitHub", category: "code" }, "connected", "3 open PRs - 1 needs review", 2 * MIN),
  mockConnector({ id: "gcal", name: "Google Calendar", category: "calendar" }, "connected", "Next: 1:1 in 45m", 1 * MIN),
  mockConnector({ id: "todoist", name: "Todoist", category: "tasks" }, "connected", "7 due today - 2 overdue", 30_000),
  mockConnector({ id: "gmail", name: "Gmail", category: "mail" }, "connected", "12 unread - 2 flagged", 5 * MIN),
  mockConnector({ id: "engram-rag", name: "Engram RAG", category: "memory" }, "connected", "428 notes indexed", 0),
  mockConnector({ id: "gdrive", name: "Google Drive", category: "notes" }, "disconnected", "Click to connect", 0),
];

export interface ConnectorTile {
  id: string;
  name: string;
  category: Category;
  status: Health["status"];
  summary?: string;
  checkedAt: number;
}

/** Health summaries for the Connectors widget. */
export async function getConnectorTiles(): Promise<ConnectorTile[]> {
  return Promise.all(
    connectorRegistry.map(async (c) => {
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
