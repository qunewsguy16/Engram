import { Flame, Sun, Target } from "lucide-react";
import { profile } from "@/lib/profile";

export function Today() {
  return (
    <section className="card card-pad">
      <div className="flex items-start justify-between">
        <div>
          <div className="section-title"><Sun size={12} /> Today</div>
          <h2 className="text-xl font-semibold mt-1">Make Engram Section 4 watertight.</h2>
          <p className="text-sm text-muted mt-1 max-w-xl">
            One sentence definition of a winning day. Edit it; the rest of the dashboard reads from it.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted">Focus block</div>
          <div className="font-mono text-2xl">09:00 - 10:30</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {profile.habits.map((h) => (
          <div key={h.id} className="rounded-lg border border-border p-3 bg-bg/50">
            <div className="text-xs text-muted">{h.label}</div>
            <div className="mt-1 flex items-center gap-1 text-lg font-semibold">
              <Flame size={14} className="text-orange-500" /> {h.streak}d
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-muted">
        <Target size={12} /> Goals:
        {profile.goals.map((g) => (
          <span key={g.id} className="chip">{g.label}</span>
        ))}
      </div>
    </section>
  );
}
