"use client";

import { useEffect, useState } from "react";
import { CalendarClock, ArrowUpRight } from "lucide-react";
import { tasks, events } from "@/lib/data/tasks";
import { buildAgenda, nextEvent, untilLabel } from "@/lib/agenda";

const priColor: Record<string, string> = {
  p1: "bg-red-500",
  p2: "bg-amber-500",
  p3: "bg-sky-500",
  p4: "bg-muted/60",
};

// Don't mirror Todoist (Product audit #6): surface only what serves today.
const priorities = tasks.filter((t) => t.due === "today" && (t.priority === "p1" || t.priority === "p2"));

export function TasksCalendar() {
  const [nowMin, setNowMin] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const next = nowMin === null ? null : nextEvent(events, nowMin);
  const agenda = nowMin === null ? [] : buildAgenda(events, nowMin);

  return (
    <section className="card card-pad">
      <div className="flex items-center justify-between">
        <div className="section-title"><CalendarClock size={12} /> Up next</div>
        <span className="chip">{priorities.length} priorities today</span>
      </div>

      {/* The one thing the timeline is for: what's happening now / next. */}
      <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
        {next ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">{next.title}</div>
              <div className="text-xs text-muted mt-0.5">
                {next.start} - {next.end}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm">
                {next.state === "now" ? "now" : nowMin !== null ? untilLabel(next.startMin, nowMin) : ""}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted">No more events today.</div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted mb-1.5">Today&apos;s priorities</div>
          {priorities.length === 0 ? (
            <div className="text-sm text-muted">Nothing high-priority due.</div>
          ) : (
            <ul className="space-y-1.5">
              {priorities.map((t) => (
                <li key={t.id} className="flex items-start gap-2 text-sm">
                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-none ${priColor[t.priority]}`} />
                  <div className="flex-1">
                    <div>{t.content}</div>
                    <div className="text-[11px] text-muted">{t.project}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 text-[11px] text-muted flex items-center gap-1">
            Full list lives in Todoist <ArrowUpRight size={11} />
          </div>
        </div>

        <div>
          <div className="text-xs text-muted mb-1.5">Rest of day</div>
          <ul className="space-y-1.5">
            {agenda.map((e) => (
              <li key={e.id} className={`flex items-start gap-2 text-sm ${e.state === "past" ? "opacity-40" : ""}`}>
                <span className="font-mono text-[11px] text-muted w-24 mt-0.5">
                  {e.start}-{e.end}
                </span>
                <div className="flex-1 flex items-center gap-1.5">
                  {e.title}
                  {e.state === "now" && <span className="chip text-[10px] text-accent">now</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
