import "server-only";
import { DreamSchema, type Dream, type MemoryBlob } from "./schema";
import { renderBlob } from "./reduce";

/**
 * runDream: consolidate yesterday's signals into one grounded, actionable Dream.
 *
 * Gated by FEATURE_DREAM_LIVE. When off (default), returns a deterministic
 * mock that CONFORMS to DreamSchema, so the contract is exercised with no key
 * and no spend. When on, calls Claude and validates the output against the
 * schema, with one repair retry, then falls back to the mock — the app never
 * throws on a bad model response.
 */

export const DREAM_SYSTEM_PROMPT = [
  "You are the consolidation engine of a personal dashboard, inspired by memory",
  "consolidation during sleep. You receive a numbered list of signals from the",
  "user's day (commits, tasks, notes, calendar, reading). Produce a concise,",
  "grounded synthesis that points the user at the single highest-leverage thing",
  "to do next.",
  "",
  "GROUNDING RULE (critical): every thread and every action MUST cite at least",
  "one signal id (e.g. \"c3\", \"n7\") in its sourceIds. If you cannot ground a",
  "claim in a provided signal, OMIT it. Never invent specifics not in the signals.",
  "",
  "Pick exactly one oneThing: the most important focus for today. Keep threads to",
  "the few that matter. Only propose actions you are confident about; they are",
  "shown as buttons the user clicks to confirm — you never execute them.",
  "Respond with ONLY a JSON object matching the requested schema, no prose.",
].join("\n");

function extractJson(text: string): unknown {
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
  // Imported lazily so the module graph (and tests) don't require the key.
  const { anthropic, DREAM_MODEL } = await import("./client");
  const user = `${renderBlob(blob)}\n\nReturn a JSON object with keys: oneThing (string), threads (array of {title, body, sourceIds[]}), suggestedActions (array of typed actions: todoist.create|memory.pin|calendar.block, each with sourceIds[]), openQuestions (string[]), newConcepts (string[]).`;

  const send = (extra = "") =>
    anthropic().messages.create({
      model: DREAM_MODEL,
      max_tokens: 2048,
      system: DREAM_SYSTEM_PROMPT,
      messages: [{ role: "user", content: user + extra }],
    });

  // NOTE: when ready, replace manual extract+validate with the SDK's
  // structured-outputs helper (messages.parse + a zod output format).
  let res = await send();
  for (let attempt = 0; attempt < 2; attempt++) {
    const text = res.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("");
    try {
      return DreamSchema.parse(extractJson(text));
    } catch {
      if (attempt === 0) {
        res = await send("\n\nYour previous reply was not valid JSON for the schema. Reply with ONLY the JSON object.");
      }
    }
  }
  throw new Error("dream output failed schema validation");
}

export async function runDream(blob: MemoryBlob): Promise<{ dream: Dream; source: "live" | "mock" }> {
  const live = process.env.FEATURE_DREAM_LIVE === "true" || process.env.FEATURE_DREAM_LIVE === "1";
  if (live && process.env.ANTHROPIC_API_KEY) {
    try {
      return { dream: await callClaude(blob), source: "live" };
    } catch {
      // Degrade gracefully rather than failing the request.
    }
  }
  return { dream: buildMockDream(blob), source: "mock" };
}
