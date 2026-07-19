/**
 * CLI runner for the /dream action.
 *
 * Usage (from project root):
 *   npm run dream
 *   # or directly:
 *   node --import ./scripts/_stubs.mjs --import tsx/esm scripts/dream.ts
 *
 * Stubs for "server-only" and "next/cache" are injected via the _stubs.mjs
 * preload registered through node --import before tsx processes this file.
 */

import { generateDream } from "../app/actions/dream";
import { getDb } from "../lib/db";

async function main(): Promise<void> {
  console.log("=== /dream CLI runner ===\n");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    console.log("ANTHROPIC_API_KEY: set (live path available if FEATURE_DREAM_LIVE=true)");
  } else {
    console.log("ANTHROPIC_API_KEY: not set — using mock path");
  }
  console.log();

  let result: { dream: import("../lib/ai/schema").Dream; source: "live" | "mock" };
  try {
    result = await generateDream();
  } catch (err) {
    console.error("ERROR: generateDream() threw:", err);
    process.exit(1);
  }

  const { dream, source } = result;

  console.log(`source:     ${source}`);
  console.log(`oneThing:   ${dream.oneThing}`);
  console.log();

  console.log("threads:");
  for (const t of dream.threads) {
    console.log(`  - [${t.sourceIds.join(", ")}] ${t.title}`);
  }
  console.log();

  console.log("suggestedActions:");
  for (const a of dream.suggestedActions) {
    if (a.kind === "todoist.create") {
      console.log(`  - ${a.kind}: "${a.title}"${a.due ? ` (due: ${a.due})` : ""}`);
    } else if (a.kind === "memory.pin") {
      console.log(`  - ${a.kind}: noteId=${a.noteId} — ${a.reason}`);
    } else if (a.kind === "calendar.block") {
      console.log(`  - ${a.kind}: "${a.title}" @ ${a.start} for ${a.durationMin}min`);
    }
  }
  console.log();

  // Count dream_runs rows after persistence (recordDream already ran inside generateDream)
  const db = getDb();
  const row = db.prepare<[], { n: number }>("SELECT COUNT(*) AS n FROM dream_runs").get();
  const count = row?.n ?? 0;
  console.log(`dream_runs row count: ${count}`);
  console.log("\nDone.");
}

main().catch((err: unknown) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
