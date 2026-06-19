import { NextRequest, NextResponse } from "next/server";
import { memory } from "@/lib/data/memory";
import { keywordSearch, semanticSearch } from "@/lib/memorySearch";
import { openaiEmbedder } from "@/lib/ai/embeddings";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ results: memory, mode: "all" });

  const embeddingsOn =
    process.env.FEATURE_MEMORY_EMBEDDINGS === "true" || process.env.FEATURE_MEMORY_EMBEDDINGS === "1";
  const key = process.env.EMBEDDING_API_KEY;

  if (embeddingsOn && key) {
    try {
      const results = await semanticSearch(memory, q, openaiEmbedder(key));
      return NextResponse.json({ results, mode: "semantic" });
    } catch {
      // Fall back to keyword on any embeddings error — never fail the search.
    }
  }

  return NextResponse.json({ results: keywordSearch(memory, q), mode: "keyword" });
}
