import { cosine, type Embedder } from "./ai/embeddings";
import type { MemoryNote } from "./data/memory";

/**
 * Retrieval over the local note corpus. Two paths, same return type:
 *  - keywordSearch: substring term-count. The default; at a personal corpus
 *    size it's fast, dependency-free, and good enough.
 *  - semanticSearch: brute-force cosine over embeddings. Enabled behind
 *    FEATURE_MEMORY_EMBEDDINGS once a real embedder + key exist. Brute force is
 *    sub-millisecond here; sqlite-vec/BM25/RRF are deferred until proven needed
 *    (DECISIONS.md).
 */

export function noteText(n: MemoryNote): string {
  return `${n.title}\n${n.snippet}\n${n.tags.join(" ")}`;
}

export function keywordSearch(notes: MemoryNote[], q: string): MemoryNote[] {
  const query = q.toLowerCase().trim();
  if (!query) return notes;
  const terms = query.split(/\s+/);
  return notes
    .map((n) => {
      const hay = `${noteText(n)} ${n.source}`.toLowerCase();
      const score = terms.reduce((s, t) => (hay.includes(t) ? s + 1 : s), 0);
      return { n, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.n);
}

export async function semanticSearch(
  notes: MemoryNote[],
  q: string,
  embedder: Embedder,
  topK = notes.length,
): Promise<MemoryNote[]> {
  if (!q.trim()) return notes;
  const [queryVec] = await embedder.embed([q]);
  const docVecs = await embedder.embed(notes.map(noteText));
  return notes
    .map((n, i) => ({ n, score: cosine(queryVec, docVecs[i]) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((r) => r.n);
}
