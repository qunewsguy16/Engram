import { BookOpen, RotateCw } from "lucide-react";
import { reading, reviewQueue } from "@/lib/data/learning";

const statusColor: Record<string, string> = {
  reading: "text-accent",
  queued: "text-muted",
  done: "text-emerald-600",
};

export function Learning() {
  return (
    <section className="card card-pad">
      <div className="section-title"><BookOpen size={12} /> Learning</div>

      <div className="mt-3">
        <div className="text-xs text-muted mb-1.5">Reading queue</div>
        <div className="space-y-1.5">
          {reading.map((r) => (
            <div key={r.id} className="flex items-start gap-2 text-sm">
              <span className={`text-[10px] uppercase font-mono ${statusColor[r.status]} w-14 mt-0.5`}>
                {r.status}
              </span>
              <div className="flex-1">
                <div className="text-ink">{r.title}</div>
                <div className="text-[11px] text-muted">
                  {r.source}{r.arxiv ? ` - arXiv:${r.arxiv}` : ""}
                  {r.takeaway && <span> - "{r.takeaway}"</span>}
                </div>
              </div>
            </div>
          ))}
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
        </div>
      </div>
    </section>
  );
}
