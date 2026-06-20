import { Inbox as InboxIcon } from "lucide-react";
import { listInbox } from "@/lib/inbox";
import { InboxItems } from "./InboxItems";

export async function Inbox() {
  const items = listInbox();
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
        <InboxItems items={items} />
      )}
    </section>
  );
}
