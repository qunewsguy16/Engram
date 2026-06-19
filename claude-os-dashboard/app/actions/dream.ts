"use server";

import { reduceSignals, type RawSignals } from "@/lib/ai/reduce";
import { runDream } from "@/lib/ai/dream";
import type { Dream } from "@/lib/ai/schema";
import { tasks, events } from "@/lib/data/tasks";
import { projects } from "@/lib/data/projects";
import { reading } from "@/lib/data/learning";

/**
 * Client-side signals the browser passes in (localStorage isn't visible to the
 * server). This is what closes the loop: yesterday's captures and review
 * learnings inform today's dream.
 */
export interface ClientSignals {
  captures?: string[];
  learnings?: string[];
}

/**
 * Server action for /dream. Mutations/AI calls run server-side (no public
 * token-spending endpoint). v1 assembles the blob from local mock data plus
 * the client's recent captures/learnings; Phase 1 swaps the mock sources for
 * MCP-backed reads (yesterday's commits, completed tasks, edited notes).
 */
export async function generateDream(client?: ClientSignals): Promise<{ dream: Dream; source: "live" | "mock" }> {
  const captureNotes = (client?.captures ?? []).map((t) => ({ title: t }));
  const learningNotes = (client?.learnings ?? []).map((t) => ({ title: `Learned: ${t}` }));

  const raw: RawSignals = {
    tasks: tasks.filter((t) => t.due === "today").map((t) => ({ content: t.content })),
    notes: [
      ...learningNotes,
      ...captureNotes,
      ...projects.flatMap((p) => p.todos.map((td) => ({ title: `${p.name}: ${td}` }))),
    ],
    calendar: events.map((e) => ({ title: e.title, at: e.start })),
    reading: reading.map((r) => ({ title: r.title })),
  };
  const blob = reduceSignals(raw);
  return runDream(blob);
}
