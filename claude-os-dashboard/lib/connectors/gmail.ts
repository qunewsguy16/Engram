import "server-only";
import { defineConnector } from "./define";

/** Live Gmail connector. Lifecycle from defineConnector. */
export interface GmailSnapshot {
  unread: number;
}

export const gmailConnector = defineConnector<GmailSnapshot>({
  meta: { id: "gmail", name: "Gmail", category: "mail" },
  errorCode: "gmail_error",
  disabledDetail: "Set GMAIL_TOKEN + FEATURE_REAL_CONNECTORS",
  async fetchSnapshot(token, f) {
    const res = await f(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent("is:unread")}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Gmail ${res.status}`);
    const json = (await res.json()) as { resultSizeEstimate?: number };
    return { unread: json.resultSizeEstimate ?? 0 };
  },
  detail: (s) => `${s.unread} unread`,
});
