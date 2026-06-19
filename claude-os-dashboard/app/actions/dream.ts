"use server";

import { reduceSignals, type RawSignals } from "@/lib/ai/reduce";
import { runDream } from "@/lib/ai/dream";
import type { Dream } from "@/lib/ai/schema";
import { tasks, events } from "@/lib/data/tasks";
import { projects } from "@/lib/data/projects";
import { reading } from "@/lib/data/learning";

/**
 * Server action for /dream. Mutations/AI calls run server-side (no public
 * token-spending endpoint, CSRF-safe, progressive-enhancement friendly).
 *
 * v1 assembles the signal blob from local mock data; Phase 1 swaps these for
 * MCP-backed reads (yesterday's commits, completed tasks, edited notes).
 */
export async function generateDream(): Promise<{ dream: Dream; source: "live" | "mock" }> {
  const raw: RawSignals = {
    tasks: tasks.filter((t) => t.due === "today").map((t) => ({ content: t.content })),
    notes: projects.flatMap((p) => p.todos.map((td) => ({ title: `${p.name}: ${td}` }))),
    calendar: events.map((e) => ({ title: e.title, at: e.start })),
    reading: reading.map((r) => ({ title: r.title })),
  };
  const blob = reduceSignals(raw);
  return runDream(blob);
}
