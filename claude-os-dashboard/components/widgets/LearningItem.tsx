"use client";

import { useState, useTransition } from "react";
import { Check, PenLine, Loader2 } from "lucide-react";
import { canComplete, MIN_TAKEAWAY, type ReadStatus } from "@/lib/learningTypes";
import { setReadingStatusAction, markReadingDoneAction } from "@/app/actions/learning";

const statusColor: Record<ReadStatus, string> = {
  reading: "text-accent",
  queued: "text-muted",
  done: "text-emerald-600",
};

interface Props {
  id: string;
  title: string;
  source: string;
  arxiv?: string;
  status: ReadStatus;
  takeaway: string;
}

export function LearningItem({ id, title, source, arxiv, status, takeaway }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(takeaway);
  const [pending, start] = useTransition();

  function start_reading() {
    start(async () => {
      await setReadingStatusAction(id, "reading");
    });
  }

  function finish() {
    start(async () => {
      const result = await markReadingDoneAction(id, draft);
      if (result) setEditing(false);
    });
  }

  return (
    <div className="rounded-lg border border-border p-2.5">
      <div className="flex items-start gap-2 text-sm">
        <span className={`text-[10px] uppercase font-mono ${statusColor[status]} w-14 mt-0.5`}>
          {status}
        </span>
        <div className="flex-1">
          <div className="text-ink">{title}</div>
          <div className="text-[11px] text-muted">
            {source}
            {arxiv ? ` - arXiv:${arxiv}` : ""}
          </div>

          {takeaway && !editing && (
            <div className="mt-1.5 text-xs text-ink/80 border-l-2 border-emerald-300 pl-2">
              &ldquo;{takeaway}&rdquo;
            </div>
          )}

          {editing ? (
            <div className="mt-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="In your own words: what did this teach you? (active recall, not a copy of the abstract)"
                className="w-full rounded-md border border-border bg-bg/50 p-2 text-xs outline-none resize-none min-h-[64px]"
              />
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  onClick={finish}
                  disabled={!canComplete(draft) || pending}
                  className="btn-primary text-xs"
                >
                  {pending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  Mark done
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setDraft(takeaway);
                  }}
                  className="btn text-xs"
                >
                  Cancel
                </button>
                <span className="text-[11px] text-muted">
                  {canComplete(draft)
                    ? "Looks good"
                    : `${Math.max(0, MIN_TAKEAWAY - draft.trim().length)} more chars`}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-1.5 flex items-center gap-2">
              {status === "queued" && (
                <button onClick={start_reading} disabled={pending} className="btn text-xs">
                  Start reading
                </button>
              )}
              {status !== "done" && (
                <button
                  onClick={() => {
                    setDraft(takeaway);
                    setEditing(true);
                  }}
                  className="btn text-xs"
                >
                  <PenLine size={12} /> Finish + takeaway
                </button>
              )}
              {status === "done" && (
                <button
                  onClick={() => {
                    setDraft(takeaway);
                    setEditing(true);
                  }}
                  className="btn text-xs"
                >
                  Edit takeaway
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
