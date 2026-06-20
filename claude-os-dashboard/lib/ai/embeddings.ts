import "server-only";

/**
 * Embeddings interface + storage helpers. Pure functions only (no DB yet).
 *
 * Decisions from the AI audit:
 *  - v1 model is OpenAI text-embedding-3-small (1536-dim): cheap, adequate for
 *    a personal corpus, swappable behind this interface. NOT an Anthropic model
 *    (Anthropic has no embeddings endpoint) — kept separate from lib/ai/dream.ts.
 *  - Retrieval is brute-force cosine over stored Float32 vectors; defer
 *    sqlite-vec / FTS5 / RRF until brute force is proven too slow.
 *  - Every stored vector is stamped with {model, dim} so a model change
 *    re-embeds only mismatched rows instead of silently mixing vector spaces.
 */

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIM = 1536;

export interface Embedder {
  model: string;
  dim: number;
  embed(texts: string[]): Promise<Float32Array[]>;
}

/** Encode a vector for SQLite BLOB storage. */
export function encodeVector(vec: Float32Array): Buffer {
  return Buffer.from(vec.buffer, vec.byteOffset, vec.byteLength);
}

/** Decode a BLOB back to a vector. byteOffset matters — get it wrong and you read garbage. */
export function decodeVector(blob: Buffer): Float32Array {
  return new Float32Array(blob.buffer, blob.byteOffset, blob.byteLength / 4);
}

export function cosine(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) throw new Error(`dim mismatch: ${a.length} vs ${b.length}`);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/** Stable content hash for idempotent ingest (skip unchanged, re-embed changed). */
export async function contentHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text.trim().replace(/\s+/g, " "));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Real embedder: OpenAI text-embedding-3-small via fetch (no SDK dependency).
 * Used when FEATURE_MEMORY_EMBEDDINGS is on and EMBEDDING_API_KEY is set.
 */
export function openaiEmbedder(apiKey: string): Embedder {
  return {
    model: EMBEDDING_MODEL,
    dim: EMBEDDING_DIM,
    async embed(texts: string[]): Promise<Float32Array[]> {
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: EMBEDDING_MODEL, input: texts }),
      });
      if (!res.ok) throw new Error(`embeddings failed (${res.status})`);
      const json = (await res.json()) as { data: { embedding: number[] }[] };
      return json.data.map((d) => Float32Array.from(d.embedding));
    },
  };
}

/**
 * Deterministic zero-cost stub used until FEATURE_MEMORY_EMBEDDINGS is on.
 * Returns reproducible pseudo-vectors so the pipeline + tests run with no key.
 */
export const stubEmbedder: Embedder = {
  model: "stub",
  dim: EMBEDDING_DIM,
  async embed(texts: string[]): Promise<Float32Array[]> {
    return texts.map((t) => {
      const v = new Float32Array(EMBEDDING_DIM);
      let seed = 0;
      for (let i = 0; i < t.length; i++) seed = (seed * 31 + t.charCodeAt(i)) >>> 0;
      for (let i = 0; i < EMBEDDING_DIM; i++) {
        seed = (seed * 1103515245 + 12345) >>> 0;
        v[i] = (seed / 0xffffffff) * 2 - 1;
      }
      return v;
    });
  },
};
