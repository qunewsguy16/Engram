"use server";

import { revalidatePath } from "next/cache";
import { reduceSignals, type RawSignals } from "@/lib/ai/reduce";
import { runDream } from "@/lib/ai/dream";
import type { Dream } from "@/lib/ai/schema";
import { tasks, events } from "@/lib/data/tasks";
import { projects } from "@/lib/data/projects";
import { reading } from "@/lib/data/learning";
import { recentCaptureTexts } from "@/lib/inbox";
import { listRecentReviews } from "@/lib/review";
import { recordDream } from "@/lib/dreamRuns";

/**
 * Server action for /dream. Reads captures + review learnings from SQLite
 * directly, calls runDream (live behind FEATURE_DREAM_LIVE, mock otherwise),
 * and persists every run into dream_runs so the latest dream is queryable
 * server-side (e.g. by the Today widget for "today's one thing").
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
  const result = await runDream(blob);
  recordDream(result.dream, result.source);
  revalidatePath("/");
  return result;
}
