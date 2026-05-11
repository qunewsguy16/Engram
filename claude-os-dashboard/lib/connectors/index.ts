import type { ConnectorMeta } from "./types";

export const connectors: ConnectorMeta[] = [
  {
    id: "github",
    name: "GitHub",
    category: "code",
    status: "connected",
    lastSyncedAt: "2m ago",
    summary: "3 open PRs - 1 needs review",
  },
  {
    id: "gmail",
    name: "Gmail",
    category: "mail",
    status: "connected",
    lastSyncedAt: "5m ago",
    summary: "12 unread - 2 flagged",
  },
  {
    id: "gcal",
    name: "Google Calendar",
    category: "calendar",
    status: "connected",
    lastSyncedAt: "1m ago",
    summary: "Next: 1:1 in 45m",
  },
  {
    id: "notion",
    name: "Notion",
    category: "notes",
    status: "connected",
    lastSyncedAt: "1h ago",
    summary: "4 pages edited today",
  },
  {
    id: "todoist",
    name: "Todoist",
    category: "tasks",
    status: "connected",
    lastSyncedAt: "just now",
    summary: "7 due today - 2 overdue",
  },
  {
    id: "engram-rag",
    name: "Engram RAG",
    category: "memory",
    status: "connected",
    lastSyncedAt: "live",
    summary: "428 notes indexed",
  },
  {
    id: "gdrive",
    name: "Google Drive",
    category: "notes",
    status: "disconnected",
    summary: "Click to connect",
  },
];
