import "server-only";
import { defineConnector } from "./define";

/** Live Notion connector. Lifecycle from defineConnector. */
export interface NotionSnapshot {
  editedPages: number;
}

export const notionConnector = defineConnector<NotionSnapshot>({
  meta: { id: "notion", name: "Notion", category: "notes" },
  errorCode: "notion_error",
  disabledDetail: "Set NOTION_TOKEN + FEATURE_REAL_CONNECTORS",
  async fetchSnapshot(token, f) {
    const res = await f("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filter: { property: "object", value: "page" }, page_size: 20 }),
    });
    if (!res.ok) throw new Error(`Notion ${res.status}`);
    const { results } = (await res.json()) as { results: unknown[] };
    return { editedPages: results.length };
  },
  detail: (s) => `${s.editedPages} pages`,
});
