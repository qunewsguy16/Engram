import "server-only";
import { z } from "zod";
import path from "node:path";

/** Parse "true"/"1" as true; everything else (incl. "false") as false. */
const boolFlag = z
  .string()
  .optional()
  .transform((v) => v === "true" || v === "1");

const schema = z.object({
  ANTHROPIC_API_KEY: z.string().optional(),
  // Embeddings use a non-Anthropic provider (Anthropic has no embeddings endpoint).
  EMBEDDING_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().default("file:./data/engram-os.sqlite"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  DREAM_DAILY_BUDGET_USD: z.coerce.number().default(1),
  FEATURE_REAL_CONNECTORS: boolFlag,
  FEATURE_DREAM_LIVE: boolFlag,
  FEATURE_MEMORY_EMBEDDINGS: boolFlag,
});

export type Config = z.infer<typeof schema>;

let cached: Config | null = null;

export function config(): Config {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/**
 * Absolute SQLite path, resolved against the project root so it is stable
 * across `next dev`, `next build`, and standalone runs (which differ in cwd).
 * Persistence is not wired yet; this is the agreed location for when it lands.
 */
export function sqlitePath(): string {
  const url = config().DATABASE_URL;
  const rel = url.startsWith("file:") ? url.slice(5) : url;
  return path.isAbsolute(rel) ? rel : path.resolve(process.cwd(), rel);
}
