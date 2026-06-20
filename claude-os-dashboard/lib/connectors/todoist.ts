import "server-only";
import { defineConnector } from "./define";
import { dayKey } from "../date";

/** Live Todoist connector. Lifecycle from defineConnector. */
export interface TodoistSnapshot {
  dueToday: number;
  overdue: number;
}

interface Task {
  due?: { date?: string };
}

export const todoistConnector = defineConnector<TodoistSnapshot>({
  meta: { id: "todoist", name: "Todoist", category: "tasks" },
  errorCode: "todoist_error",
  disabledDetail: "Set TODOIST_TOKEN + FEATURE_REAL_CONNECTORS",
  async fetchSnapshot(token, f) {
    const res = await f(`https://api.todoist.com/rest/v2/tasks?filter=${encodeURIComponent("today | overdue")}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Todoist ${res.status}`);
    const tasks = (await res.json()) as Task[];
    const today = dayKey();
    const overdue = tasks.filter((t) => t.due?.date && t.due.date < today).length;
    return { dueToday: tasks.length - overdue, overdue };
  },
  detail: (s) => `${s.dueToday} due today - ${s.overdue} overdue`,
});
