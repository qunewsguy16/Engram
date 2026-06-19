import { z } from "zod";

/**
 * The /dream contract. This is the single source of truth for the shape Claude
 * must return AND the shape the mock returns — freezing it now makes the
 * live swap a flag flip. Grounding is enforced structurally: every thread and
 * action carries sourceIds referencing the numbered signals in the blob, and
 * the prompt instructs "cite a sourceId or omit the claim" to curb confabulation.
 */

/** A typed, validated action proposal. Never free text the handler interprets. */
export const SuggestedAction = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("todoist.create"),
    title: z.string(),
    due: z.string().optional(),
    sourceIds: z.array(z.string()),
  }),
  z.object({
    kind: z.literal("memory.pin"),
    noteId: z.string(),
    reason: z.string(),
    sourceIds: z.array(z.string()),
  }),
  z.object({
    kind: z.literal("calendar.block"),
    title: z.string(),
    start: z.string(),
    durationMin: z.number(),
    sourceIds: z.array(z.string()),
  }),
]);
export type SuggestedAction = z.infer<typeof SuggestedAction>;

export const DreamThread = z.object({
  title: z.string(),
  body: z.string(),
  sourceIds: z.array(z.string()),
});
export type DreamThread = z.infer<typeof DreamThread>;

export const DreamSchema = z.object({
  // The single most important thing today — the forcing function (Product audit).
  oneThing: z.string(),
  threads: z.array(DreamThread),
  suggestedActions: z.array(SuggestedAction),
  openQuestions: z.array(z.string()),
  newConcepts: z.array(z.string()),
});
export type Dream = z.infer<typeof DreamSchema>;

/** A numbered, ID'd input signal so insights can cite their provenance. */
export interface DreamSignal {
  id: string; // e.g. "c3" (commit), "n7" (note), "t2" (task)
  kind: "commit" | "task" | "note" | "calendar" | "reading";
  text: string;
  at?: string;
}

export interface MemoryBlob {
  date: string;
  signals: DreamSignal[];
}
