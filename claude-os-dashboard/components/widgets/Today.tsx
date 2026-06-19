import { Target, Sun, Sparkles, AlertCircle } from "lucide-react";
import { profile, habitStats } from "@/lib/profile";
import { today } from "@/lib/today";
import { OneThingStatus } from "@/components/OneThingStatus";

export function Today() {
  return (
    <section className="card card-pad">
      {/* One thing — the forcing function above the fold. Visually dominant. */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="section-title"><Sun size={12} /> Today</div>
          <div className="mt-2 flex items-start gap-2">
            <Target size={20} className="text-accent flex-none mt-0.5" />
            <h2 className="text-2xl font-semibold leading-tight">{today.oneThing}</h2>
          </div>
          <div className="text-xs text-muted mt-1.5 flex items-center gap-1.5">
            {today.source === "dream" ? (
              <><Sparkles size={11} className="text-accent" /> from this morning&apos;s /dream</>
            ) : (
              <>Edit this in <span className="font-mono">lib/today.ts</span> until /dream sets it</>
            )}
          </div>
          <OneThingStatus />
        </div>
        <div className="text-right flex-none">
          <div className="text-xs text-muted">Focus block</div>
          <div className="font-mono text-xl mt-0.5">{today.focusBlock.start} - {today.focusBlock.end}</div>
        </div>
      </div>

      {/* Habits as honest rate, not fragile streaks. atRisk surfaces the real signal: two misses in a row. */}
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {profile.habits.map((h) => {
          const s = habitStats(h);
          const pct = Math.round((s.rate.done / s.rate.window) * 100);
          return (
            <div
              key={h.id}
              className={`rounded-lg border p-3 ${s.atRisk ? "border-amber-400 bg-amber-50/60" : "border-border bg-bg/50"}`}
            >
              <div className="text-xs text-muted leading-tight">{h.label}</div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-lg font-semibold">{s.rate.done}</span>
                <span className="text-xs text-muted">of last {s.rate.window}</span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-border overflow-hidden">
                <div className="h-full bg-ink/80" style={{ width: `${pct}%` }} />
              </div>
              {s.atRisk && (
                <div className="mt-1.5 text-[11px] text-amber-700 flex items-center gap-1">
                  <AlertCircle size={11} /> 2 misses in a row
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Goals as quiet reference, not the main event. */}
      <div className="mt-4 flex items-center gap-2 text-xs text-muted flex-wrap">
        <span>Goals:</span>
        {profile.goals.map((g) => (
          <span key={g.id} className="chip">{g.label}</span>
        ))}
      </div>
    </section>
  );
}
