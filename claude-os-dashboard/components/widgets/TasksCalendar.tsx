import { CheckSquare, Calendar, Users } from "lucide-react";
import { tasks, events } from "@/lib/data/tasks";

const priColor: Record<string, string> = {
  p1: "bg-red-500",
  p2: "bg-amber-500",
  p3: "bg-sky-500",
  p4: "bg-muted/60",
};

export function TasksCalendar() {
  const today = tasks.filter((t) => t.due === "today");

  return (
    <section className="card card-pad">
      <div className="flex items-center justify-between">
        <div className="section-title"><CheckSquare size={12} /> Today's plan</div>
        <span className="chip">{today.length} tasks - {events.length} events</span>
      </div>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted mb-1.5">Tasks (Todoist)</div>
          <ul className="space-y-1.5">
            {today.map((t) => (
              <li key={t.id} className="flex items-start gap-2 text-sm">
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-none ${priColor[t.priority]}`} />
                <div className="flex-1">
                  <div>{t.content}</div>
                  <div className="text-[11px] text-muted">{t.project}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-xs text-muted mb-1.5 flex items-center gap-1">
            <Calendar size={11} /> Calendar
          </div>
          <ul className="space-y-1.5">
            {events.map((e) => (
              <li key={e.id} className="flex items-start gap-2 text-sm">
                <span className="font-mono text-[11px] text-muted w-24 mt-0.5">
                  {e.start}-{e.end}
                </span>
                <div className="flex-1">
                  <div>{e.title}</div>
                  {e.attendees && (
                    <div className="text-[11px] text-muted flex items-center gap-1">
                      <Users size={10} /> {e.attendees}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
