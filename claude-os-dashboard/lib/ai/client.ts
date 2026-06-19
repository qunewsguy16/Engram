import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Lazy Anthropic singleton — the ONLY place the SDK is constructed. The key is
 * resolved at call time (not import) so the app builds and runs without it.
 *
 * Default model is claude-opus-4-8: for a once-a-day, single-user,
 * quality-sensitive synthesis the intelligence matters and the cost (~cents)
 * does not (AI audit #1). Sonnet 4.6 is the cost fallback, not the default.
 */
export const DREAM_MODEL = "claude-opus-4-8";

let client: Anthropic | null = null;

export function anthropic(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  client = new Anthropic({ apiKey });
  return client;
}
