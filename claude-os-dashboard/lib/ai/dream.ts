import "server-only";
import { DreamSchema, type Dream, type MemoryBlob } from "./schema";
import { renderBlob } from "./reduce";
import { flag } from "../flags";
import { canSpend, recordSpend } from "./budget";

/**
 * runDream: consolidate yesterday's signals into one grounded, actionable Dream.
 *
 * Gated by FEATURE_DREAM_LIVE. Off (default): deterministic mock that conforms
 * to DreamSchema — same contract, no key, no spend. On: Claude with the
 * skill-correct API surface (`claude-opus-4-8`, adaptive thinking, structured
 * outputs via output_config.format, prompt-cached system, streaming). Output
 * is validated against DreamSchema as a defensive check; any failure
 * (refusal, parse, schema) falls back to the mock — the app never throws.
 */

export const DREAM_SYSTEM_PROMPT = [
  "You are the consolidation engine of a personal dashboard, inspired by memory",
  "consolidation during sleep. You receive a numbered list of signals from the",
  "user's day (commits, tasks, notes, calendar, reading) and produce a concise,",
  "grounded synthesis that points the user at the single highest-leverage thing",
  "to do next.",
  "",
  "GROUNDING RULE (critical): every thread and every action MUST cite at least",
  "one signal id (e.g. \"c3\", \"n7\") in its sourceIds. If you cannot ground a",
  "claim in a provided signal, OMIT it. Never invent specifics not in the signals.",
  "",
  "Pick exactly one oneThing: the single most important focus for today. Keep",
  "threads to the few that matter. Only propose actions you are confident about;",
  "they are shown as buttons the user clicks to confirm — you never execute them.",
].join("\n");

/**
 * JSON schema mirroring DreamSchema. structured-outputs limits apply: no
 * minLength/maximum/recursion. Counts (e.g. "few threads") live in the prompt.
 */
const DREAM_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["oneThing", "threads", "suggestedActions", "openQuestions", "newConcepts"],
  properties: {
    oneThing: { type: "string" },
    threads: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "body", "sourceIds"],
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          sourceIds: { type: "array", items: { type: "string" } },
        },
      },
    },
    suggestedActions: {
      type: "array",
      items: {
        anyOf: [
          {
            type: "object",
            additionalProperties: false,
            required: ["kind", "title", "sourceIds"],
            properties: {
              kind: { const: "todoist.create" },
              title: { type: "string" },
              due: { type: "string" },
              sourceIds: { type: "array", items: { type: "string" } },
            },
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["kind", "noteId", "reason", "sourceIds"],
            properties: {
              kind: { const: "memory.pin" },
              noteId: { type: "string" },
              reason: { type: "string" },
              sourceIds: { type: "array", items: { type: "string" } },
            },
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["kind", "title", "start", "durationMin", "sourceIds"],
            properties: {
              kind: { const: "calendar.block" },
              title: { type: "string" },
              start: { type: "string" },
              durationMin: { type: "number" },
              sourceIds: { type: "array", items: { type: "string" } },
            },
          },
        ],
      },
    },
    openQuestions: { type: "array", items: { type: "string" } },
    newConcepts: { type: "array", items: { type: "string" } },
  },
} as const;

export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON object found");
  return JSON.parse(raw.slice(start, end + 1));
}

export function buildMockDream(blob: MemoryBlob): Dream {
  const ids = blob.signals.map((s) => s.id);
  const cite = (n: number) => (ids.length ? ids.slice(0, n) : ["c1"]);
  return {
    oneThing: "Make the Engram paper's ablation section watertight.",
    threads: [
      {
        title: "Engram paper is the critical path",
        body: "Your recent commits and notes converge on the ablation section; today's deep-work block is best spent there.",
        sourceIds: cite(2),
      },
      {
        title: "A reusable retrieval insight",
        body: "The rerank > top-k finding applies directly to Engram's memory retrieval — consider citing your own numbers.",
        sourceIds: cite(1),
      },
    ],
    suggestedActions: [
      { kind: "calendar.block", title: "Deep work: paper ablations", start: "09:00", durationMin: 90, sourceIds: cite(1) },
      { kind: "memory.pin", noteId: "m5", reason: "Relevant to Section 4.2", sourceIds: cite(1) },
    ],
    openQuestions: ["Does the ablation isolate the consolidation effect from context length?"],
    newConcepts: ["Reciprocal rank fusion"],
  };
}

async function callClaude(blob: MemoryBlob): Promise<Dream> {
  // Lazy import — keeps the module graph (and tests) free of the key dependency.
  const { anthropic, DREAM_MODEL } = await import("./client");
  const user = `${renderBlob(blob)}\n\nReturn the dream as JSON matching the schema.`;

  // Stream because xhigh-effort runs can take minutes — non-streaming would
  // timeout. .finalMessage() gives the assembled response when done.
  const stream = anthropic().messages.stream({
    model: DREAM_MODEL,
    max_tokens: 16000,
    system: [
      // Cache the stable system prompt — saves on re-dreams within the 5-min TTL.
      { type: "text", text: DREAM_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    thinking: { type: "adaptive", display: "summarized" },
    output_config: {
      effort: "high",
      format: { type: "json_schema", schema: DREAM_JSON_SCHEMA },
    } as unknown as Record<string, unknown>,
    messages: [{ role: "user", content: user }],
  } as unknown as Parameters<ReturnType<typeof anthropic>["messages"]["stream"]>[0]);

  const res = await stream.finalMessage();

  if (res.stop_reason === "refusal") {
    throw new Error("model refused");
  }

  // output_config.format guarantees the first text block is the JSON object.
  // Defensive validation against the zod schema — schema/runtime drift is caught
  // here and triggers the mock fallback in runDream.
  const text = res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");
  return DreamSchema.parse(extractJson(text));
}

export async function runDream(blob: MemoryBlob): Promise<{ dream: Dream; source: "live" | "mock" }> {
  if (flag("FEATURE_DREAM_LIVE") && process.env.ANTHROPIC_API_KEY && canSpend()) {
    try {
      const dream = await callClaude(blob);
      recordSpend();
      return { dream, source: "live" };
    } catch {
      // Degrade gracefully rather than failing the request.
    }
  }
  return { dream: buildMockDream(blob), source: "mock" };
}
