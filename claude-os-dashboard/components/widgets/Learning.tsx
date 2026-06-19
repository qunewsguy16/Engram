"use client";

import { useEffect, useState } from "react";
import { BookOpen, RotateCw, Check, PenLine } from "lucide-react";
import { reading, reviewQueue } from "@/lib/data/learning";
import {
  getProgress,
  setStatus,
  markDone,
  canComplete,
  completedTakeaways,
  subscribeLearning,
  MIN_TAKEAWAY,
  type ReadStatus,
} from "@/lib/learningProgress";

const statusColor: Record<ReadStatus, string> = {
  reading: "text-accent",
  queued: "text-muted",
  done: "text-emerald-600",
};

export function Learning() {
  const [, force] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => subscribeLearning(() => force((n) => n + 1)), []);

  function openEditor(id: string, current: string) {
    setEditing(id);
    setDraft(current);
  }

  function finish(id: string) {
    if (markDone(id, draft)) {
      setEditing(null);
      setDraft("");
    }
  }

  const conceptsFromTakeaways = completedTakeaways();

  return (
    <section className="card card-pad">
      <div className="section-title"><BookOpen size={12} /> Learning</div>

      <div className="mt-3">
        <div className="text-xs text-muted mb-1.5">Reading queue</div>
        <div className="space-y-2">
          {reading.map((r) => {
            const p = getProgress(r.id);
            const status: ReadStatus = (p?.status ?? r.status) as ReadStatus;
            const takeaway = p?.takeaway ?? r.takeaway ?? "";
            const isEditing = editing === r.id;
            return (
              <div key={r.id} className="rounded-lg border border-border p-2.5">
                <div className="flex items-start gap-2 text-sm">
                  <span className={`text-[10px] uppercase font-mono ${statusColor[status]} w-14 mt-0.5`}>
                    {status}
                  </span>
                  <div className="flex-1">
                    <div className="text-ink">{r.title}</div>
                    <div className="text-[11px] text-muted">
                      {r.source}{r.arxiv ? ` - arXiv:${r.arxiv}` : ""}
                    </div>

                    {takeaway && !isEditing && (
                      <div className="mt-1.5 text-xs text-ink/80 border-l-2 border-emerald-300 pl-2">
                        &ldquo;{takeaway}&rdquo;
                      </div>
                    )}

                    {isEditing ? (
                      <div className="mt-2">
                        <textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder="In your own words: what did this teach you? (active recall, not a copy of the abstract)"
                          className="w-full rounded-md border border-border bg-bg/50 p-2 text-xs outline-none resize-none min-h-[64px]"
                        />
                        <div className="mt-1.5 flex items-center gap-2">
                          <button onClick={() => finish(r.id)} disabled={!canComplete(draft)} className="btn-primary text-xs">
                            <Check size={12} /> Mark done
                          </button>
                          <button onClick={() => setEditing(null)} className="btn text-xs">Cancel</button>
                          <span className="text-[11px] text-muted">
                            {canComplete(draft) ? "Looks good" : `${Math.max(0, MIN_TAKEAWAY - draft.trim().length)} more chars`}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1.5 flex items-center gap-2">
                        {status === "queued" && (
                          <button onClick={() => setStatus(r.id, "reading")} className="btn text-xs">Start reading</button>
                        )}
                        {status !== "done" && (
                          <button onClick={() => openEditor(r.id, takeaway)} className="btn text-xs">
                            <PenLine size={12} /> Finish + takeaway
                          </button>
                        )}
                        {status === "done" && (
                          <button onClick={() => openEditor(r.id, takeaway)} className="btn text-xs">Edit takeaway</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs text-muted mb-1.5 flex items-center gap-1">
          <RotateCw size={11} /> Concepts to revisit
        </div>
        <div className="flex flex-wrap gap-1.5">
          {reviewQueue.map((c) => (
            <span key={c.id} className="chip">
              {c.label} <span className="text-[10px] opacity-60">- {c.due}</span>
            </span>
          ))}
          {conceptsFromTakeaways.map((c) => (
            <span key={c.id} className="chip border-emerald-300 text-ink" title={c.takeaway}>
              {c.takeaway.length > 40 ? c.takeaway.slice(0, 40) + "..." : c.takeaway}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
