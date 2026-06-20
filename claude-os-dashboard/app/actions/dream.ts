"use server";

import { reduceSignals, type RawSignals } from "@/lib/ai/reduce";
import { runDream } from "@/lib/ai/dream";
import type { Dream } from "@/lib/ai/schema";
import { tasks, events } from "@/lib/data/tasks";
import { projects } from "@/lib/data/projects";
import { reading } from "@/lib/data/learning";
import { recentCaptureTexts } from "@/lib/inbox";
import { listRecentReviews } from "@/lib/review";

/**
 * Server action for /dream. Mutations/AI calls run server-side (no public
 * token-spending endpoint). The loop is now closed entirely on the server:
 * captures + review learnings come from SQLite directly, no client signals
 * required. The static mock data fills in until Phase 1 swaps it for live
 * MCP-backed reads (yesterday's commits, completed tasks, edited notes).
 */
export async function generateDream(): Promise<{ dream: Dream; source: "live" | "mock" }> {
  const captures = recentCaptureTexts(10);
  const learnings = listRecentReviews(5)
    .map((r) => r.learned)
    .filter(Boolean);

  const raw: RawSignals = {
    tasks: tasks.filter((t) => t.due === "today").map((t) => ({ content: t.content })),
    notes: [
      ...learnings.map((t) => ({ title: `Learned: ${t}` })),
      ...captures.map((title) => ({ title })),
      ...projects.flatMap((p) => p.todos.map((td) => ({ title: `${p.name}: ${td}` }))),
    ],
    calendar: events.map((e) => ({ title: e.title, at: e.start })),
    reading: reading.map((r) => ({ title: r.title })),
  };
  const blob = reduceSignals(raw);
  return runDream(blob);
}
