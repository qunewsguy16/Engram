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

// ── Rich data for the Projects + Up-next widgets ─────────────────────────────

export type UiPriority = "p1" | "p2" | "p3" | "p4";

/** Rank for sorting: p1 (highest) first. */
const PRANK: Record<UiPriority, number> = { p1: 0, p2: 1, p3: 2, p4: 3 };

export interface TodoistTaskItem {
  id: string;
  content: string;
  priority: UiPriority;
  projectId: string;
  project?: string; // resolved project name
  due?: string; // YYYY-MM-DD (date part only)
  dueToday: boolean;
  overdue: boolean;
}

export interface TodoistProjectItem {
  id: string;
  name: string;
  taskCount: number;
  overdueCount: number;
  topTasks: string[]; // up to 3, highest priority first
}

export interface TodoistData {
  projects: TodoistProjectItem[];
  tasks: TodoistTaskItem[];
}

interface RawProject {
  id: string;
  name: string;
  is_inbox_project?: boolean;
}
interface RawTask {
  id: string;
  content: string;
  priority?: number; // Todoist API: 4 = urgent (p1) ... 1 = normal (p4)
  project_id: string;
  due?: { date?: string } | null;
}

/**
 * Pure transform from raw Todoist REST responses to widget-ready data.
 * Testable without network. Note the priority inversion: the API uses 4=highest
 * while the UI uses p1=highest, so p = "p" + (5 - apiPriority).
 */
export function buildTodoistData(
  rawProjects: RawProject[],
  rawTasks: RawTask[],
  today: string = dayKey(),
): TodoistData {
  const nameById = new Map(rawProjects.map((p) => [p.id, p.name]));

  const tasks: TodoistTaskItem[] = rawTasks.map((t) => {
    const apiP = Math.min(4, Math.max(1, t.priority ?? 1));
    const priority = `p${5 - apiP}` as UiPriority;
    const d = t.due?.date ? t.due.date.slice(0, 10) : undefined;
    return {
      id: t.id,
      content: t.content,
      priority,
      projectId: t.project_id,
      project: nameById.get(t.project_id),
      due: d,
      dueToday: d === today,
      overdue: Boolean(d && d < today),
    };
  });

  const projects: TodoistProjectItem[] = rawProjects
    .filter((p) => !p.is_inbox_project)
    .map((p) => {
      const pts = tasks
        .filter((t) => t.projectId === p.id)
        .sort((a, b) => PRANK[a.priority] - PRANK[b.priority]);
      return {
        id: p.id,
        name: p.name,
        taskCount: pts.length,
        overdueCount: pts.filter((t) => t.overdue).length,
        topTasks: pts.slice(0, 3).map((t) => t.content),
      };
    })
    .filter((p) => p.taskCount > 0)
    .sort((a, b) => b.taskCount - a.taskCount);

  return { projects, tasks };
}

/** The focused "up next" list: overdue + due-today, overdue first then priority. */
export function selectPriorities(tasks: TodoistTaskItem[], limit = 6): TodoistTaskItem[] {
  return tasks
    .filter((t) => t.overdue || t.dueToday)
    .sort((a, b) => Number(b.overdue) - Number(a.overdue) || PRANK[a.priority] - PRANK[b.priority])
    .slice(0, limit);
}

export async function fetchTodoistData(token: string, f: typeof fetch = fetch): Promise<TodoistData> {
  const headers = { Authorization: `Bearer ${token}` };
  const [pRes, tRes] = await Promise.all([
    f("https://api.todoist.com/rest/v2/projects", { headers }),
    f("https://api.todoist.com/rest/v2/tasks", { headers }),
  ]);
  if (!pRes.ok) throw new Error(`Todoist projects ${pRes.status}`);
  if (!tRes.ok) throw new Error(`Todoist tasks ${tRes.status}`);
  const rawProjects = (await pRes.json()) as RawProject[];
  const rawTasks = (await tRes.json()) as RawTask[];
  return buildTodoistData(rawProjects, rawTasks);
}
