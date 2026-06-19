"use client";

import { useEffect, useState } from "react";
import { Inbox as InboxIcon, Archive, Pin } from "lucide-react";
import { listInbox, setStatus, subscribeInbox, ago, type Capture } from "@/lib/inbox";

export function Inbox() {
  const [items, setItems] = useState<Capture[]>([]);

  useEffect(() => {
    const sync = () => setItems(listInbox());
    sync();
    // Re-render when another tab/component captures or triages.
    return subscribeInbox(sync);
  }, []);

  return (
    <section className="card card-pad">
      <div className="flex items-center justify-between">
        <div className="section-title"><InboxIcon size={12} /> Inbox</div>
        <span className="chip">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted mt-3">
          Empty. Press <span className="kbd">⌘⇧N</span> anywhere to capture a thought.
        </p>
      ) : (
        <ul className="mt-3 space-y-2 max-h-72 overflow-auto">
          {items.map((c) => (
            <li key={c.id} className="rounded-lg border border-border p-3 group hover:bg-bg/40 transition-colors">
              <div className="text-sm">{c.text}</div>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                {c.tags.map((t) => (
                  <span key={t} className="chip text-[10px]">#{t}</span>
                ))}
                <span className="text-[11px] text-muted">{ago(c.capturedAt)}</span>
                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setStatus(c.id, "promoted")}
                    title="Keep as memory"
                    className="p-1 rounded hover:bg-bg border border-border"
                  >
                    <Pin size={12} />
                  </button>
                  <button
                    onClick={() => setStatus(c.id, "archived")}
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
      )}
    </section>
  );
}
