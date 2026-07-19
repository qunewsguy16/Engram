import { BookOpen, RotateCw } from "lucide-react";
import { reading, reviewQueue } from "@/lib/data/learning";
import { getProgress, completedTakeaways, type ReadStatus } from "@/lib/learningProgress";
import { LearningItem } from "./LearningItem";

/**
 * Server component. Reads per-paper persisted progress from SQLite and hands
 * each row's state to a client island that handles the editor + actions.
 * The page revalidates after each mutation, so the props refresh.
 */
export function Learning() {
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
            return (
              <LearningItem
                key={r.id}
                id={r.id}
                title={r.title}
                source={r.source}
                arxiv={r.arxiv}
                status={status}
                takeaway={takeaway}
              />
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
