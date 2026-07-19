import { describe, it, expect } from "vitest";
import { buildTodoistData, selectPriorities } from "./todoist";

const projects = [
  { id: "inbox", name: "Inbox", is_inbox_project: true },
  { id: "p1", name: "Engram" },
  { id: "p2", name: "Side" },
  { id: "p3", name: "Empty" },
];

// today = 2026-07-20 in these fixtures
const TODAY = "2026-07-20";
const tasks = [
  { id: "a", content: "urgent thing", priority: 4, project_id: "p1", due: { date: "2026-07-18" } }, // overdue, p1
  { id: "b", content: "today thing", priority: 2, project_id: "p1", due: { date: TODAY } }, // due today, p3
  { id: "c", content: "no due", priority: 1, project_id: "p2" }, // p4, no due
  { id: "d", content: "inbox item", priority: 3, project_id: "inbox", due: { date: TODAY } },
];

describe("buildTodoistData", () => {
  const data = buildTodoistData(projects, tasks, TODAY);

  it("inverts API priority to UI priority (4->p1, 1->p4)", () => {
    expect(data.tasks.find((t) => t.id === "a")!.priority).toBe("p1");
    expect(data.tasks.find((t) => t.id === "c")!.priority).toBe("p4");
    expect(data.tasks.find((t) => t.id === "b")!.priority).toBe("p3");
  });

  it("resolves project names and flags overdue / dueToday", () => {
    const a = data.tasks.find((t) => t.id === "a")!;
    expect(a.project).toBe("Engram");
    expect(a.overdue).toBe(true);
    expect(a.dueToday).toBe(false);
    const b = data.tasks.find((t) => t.id === "b")!;
    expect(b.dueToday).toBe(true);
    expect(b.overdue).toBe(false);
  });

  it("excludes the inbox project and empty projects, sorts by task count", () => {
    const names = data.projects.map((p) => p.name);
    expect(names).not.toContain("Inbox");
    expect(names).not.toContain("Empty"); // no tasks
    expect(data.projects[0].name).toBe("Engram"); // 2 tasks > Side's 1
  });

  it("counts overdue per project and lists top tasks priority-first", () => {
    const engram = data.projects.find((p) => p.name === "Engram")!;
    expect(engram.taskCount).toBe(2);
    expect(engram.overdueCount).toBe(1);
    expect(engram.topTasks[0]).toBe("urgent thing"); // p1 before p3
  });

  it("defaults missing priority to p4 without throwing", () => {
    const d = buildTodoistData([{ id: "x", name: "X" }], [{ id: "t", content: "c", project_id: "x" }], TODAY);
    expect(d.tasks[0].priority).toBe("p4");
  });
});

describe("selectPriorities", () => {
  const data = buildTodoistData(projects, tasks, TODAY);

  it("returns overdue + due-today only, overdue first then priority", () => {
    const sel = selectPriorities(data.tasks);
    // a overdue first; then due-today by priority: d (p2) before b (p3).
    // c is excluded (no due). Inbox tasks DO count as priorities (only the
    // project-cards list excludes inbox).
    expect(sel.map((t) => t.id)).toEqual(["a", "d", "b"]);
  });

  it("honors the limit", () => {
    expect(selectPriorities(data.tasks, 1)).toHaveLength(1);
  });
});
