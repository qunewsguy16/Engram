import { todoistData } from "@/lib/connectors";
import { selectPriorities } from "@/lib/connectors/todoist";
import { tasks as mockTasks, events as mockEvents } from "@/lib/data/tasks";
import { UpNext, type PriorityItem } from "./UpNext";

/**
 * Server wrapper: pulls live Todoist tasks for the priority list (falling back
 * to mock), then hands plain props to the UpNext client island. Calendar events
 * are still mock here — the Google Calendar slice replaces them next.
 */
export async function TasksCalendar() {
  const live = await todoistData();

  const priorities: PriorityItem[] = live
    ? selectPriorities(live.tasks).map((t) => ({
        id: t.id,
        content: t.content,
        priority: t.priority,
        project: t.project,
        overdue: t.overdue,
      }))
    : mockTasks
        .filter((t) => t.due === "today" && (t.priority === "p1" || t.priority === "p2"))
        .map((t) => ({ id: t.id, content: t.content, priority: t.priority, project: t.project, overdue: false }));

  const events = mockEvents.map((e) => ({ id: e.id, title: e.title, start: e.start, end: e.end }));

  return <UpNext priorities={priorities} events={events} source={live ? "todoist" : "mock"} />;
}
