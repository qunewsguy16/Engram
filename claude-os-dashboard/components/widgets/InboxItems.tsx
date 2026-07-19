"use client";

import { useTransition } from "react";
import { Archive, Pin } from "lucide-react";
import { ago, type Capture } from "@/lib/inboxTypes";
import { setCaptureStatusAction } from "@/app/actions/inbox";

export function InboxItems({ items }: { items: Capture[] }) {
  const [pending, start] = useTransition();
  const triage = (id: string, status: Capture["status"]) =>
    start(async () => {
      await setCaptureStatusAction(id, status);
    });

  return (
    <ul className="mt-3 space-y-2 max-h-72 overflow-auto" aria-busy={pending}>
      {items.map((c) => (
        <li
          key={c.id}
          className="rounded-lg border border-border p-3 group hover:bg-bg/40 transition-colors"
        >
          <div className="text-sm">{c.text}</div>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            {c.tags.map((t) => (
              <span key={t} className="chip text-[10px]">#{t}</span>
            ))}
            <span className="text-[11px] text-muted">{ago(c.capturedAt)}</span>
            <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => triage(c.id, "promoted")}
                disabled={pending}
                title="Keep as memory"
                className="p-1 rounded hover:bg-bg border border-border"
              >
                <Pin size={12} />
              </button>
              <button
                onClick={() => triage(c.id, "archived")}
                disabled={pending}
                title="Archive"
                className="p-1 rounded hover:bg-bg border border-border"
              >
                <Archive size={12} />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
