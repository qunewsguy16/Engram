import { describe, it, expect } from "vitest";
import { keywordSearch, semanticSearch, noteText } from "./memorySearch";
import type { MemoryNote } from "./data/memory";
import type { Embedder } from "./ai/embeddings";

const notes: MemoryNote[] = [
  { id: "a", title: "RAG eval baseline", snippet: "rerank beats naive top-k", source: "x.md", tags: ["rag", "eval"], updatedAt: "today" },
  { id: "b", title: "Sleep consolidation", snippet: "replay improves recall", source: "y.md", tags: ["memory"], updatedAt: "today" },
  { id: "c", title: "DSPy compile", snippet: "optimize prompts as parameters", source: "z.md", tags: ["prompting"], updatedAt: "today" },
];

describe("keywordSearch", () => {
  it("ranks by term hits and drops non-matches", () => {
    const r = keywordSearch(notes, "rag eval");
    expect(r[0].id).toBe("a");
    expect(r.find((n) => n.id === "c")).toBeUndefined();
  });
  it("returns all notes for an empty query", () => {
    expect(keywordSearch(notes, "")).toHaveLength(3);
  });
  it("matches within tags and snippet, case-insensitively", () => {
    expect(keywordSearch(notes, "REPLAY")[0].id).toBe("b");
  });
});

describe("semanticSearch", () => {
  // Fake embedder: map known text fragments to controlled vectors so cosine
  // ordering is deterministic and meaningful (real semantics tested elsewhere).
  const fake: Embedder = {
    model: "fake",
    dim: 2,
    async embed(texts: string[]) {
      return texts.map((t) => {
        if (t.includes("RAG") || t.toLowerCase().includes("retrieval")) return Float32Array.from([1, 0]);
        if (t.includes("consolidation") || t.includes("recall")) return Float32Array.from([0, 1]);
        return Float32Array.from([0.7, 0.7]);
      });
    },
  };

  it("ranks the semantically closest note first", async () => {
    const r = await semanticSearch(notes, "retrieval evaluation", fake);
    expect(r[0].id).toBe("a"); // query -> [1,0], note a -> [1,0]
  });

  it("honors topK", async () => {
    const r = await semanticSearch(notes, "recall", fake, 1);
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe("b");
  });

  it("returns all notes for an empty query", async () => {
    expect(await semanticSearch(notes, "", fake)).toHaveLength(3);
  });
});

describe("noteText", () => {
  it("includes title, snippet, and tags", () => {
    expect(noteText(notes[0])).toContain("RAG eval baseline");
    expect(noteText(notes[0])).toContain("rag eval");
  });
});
