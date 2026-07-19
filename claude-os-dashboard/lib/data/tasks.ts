export interface Task {
  id: string;
  content: string;
  due?: string;
  priority: "p1" | "p2" | "p3" | "p4";
  project?: string;
  done?: boolean;
}

export const tasks: Task[] = [
  { id: "t1", content: "Outline ablation experiments for Engram paper", due: "today", priority: "p1", project: "Engram" },
  { id: "t2", content: "Reply to advisor on Section 4 draft", due: "today", priority: "p1", project: "Engram" },
  { id: "t3", content: "Skim Mamba paper - take 3 notes", due: "today", priority: "p2", project: "Learning" },
  { id: "t4", content: "Polish dashboard /dream prompt", due: "today", priority: "p3", project: "Dashboard" },
  { id: "t5", content: "Workout - 45m", due: "today", priority: "p3", project: "Health" },
  { id: "t6", content: "Refactor engram_demo_v1.py", due: "tomorrow", priority: "p2", project: "Engram" },
  { id: "t7", content: "Write blog post: 'What I learned shipping Engram'", due: "this week", priority: "p3", project: "Side" },
];

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  attendees?: number;
}

export const events: CalendarEvent[] = [
  { id: "e1", title: "Deep work: paper ablations", start: "09:00", end: "10:30" },
  { id: "e2", title: "1:1 with advisor", start: "11:00", end: "11:30", attendees: 2 },
  { id: "e3", title: "Lunch / walk", start: "12:30", end: "13:15" },
  { id: "e4", title: "Build block: dashboard", start: "14:00", end: "16:00" },
  { id: "e5", title: "Reading: Mamba paper", start: "17:00", end: "17:45" },
];
