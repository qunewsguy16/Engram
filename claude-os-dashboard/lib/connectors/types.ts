export type ConnectorStatus = "connected" | "disconnected" | "error";

export interface ConnectorMeta {
  id: string;
  name: string;
  category: "code" | "memory" | "tasks" | "calendar" | "mail" | "notes";
  status: ConnectorStatus;
  lastSyncedAt?: string;
  summary?: string;
}

export interface Connector<TItem = unknown> {
  meta: ConnectorMeta;
  list(): Promise<TItem[]>;
}
