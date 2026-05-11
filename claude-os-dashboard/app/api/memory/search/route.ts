import { NextRequest, NextResponse } from "next/server";
import { memory } from "@/lib/data/memory";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").toLowerCase().trim();
  if (!q) return NextResponse.json({ results: memory });

  const results = memory
    .map((n) => {
      const hay = `${n.title} ${n.snippet} ${n.tags.join(" ")} ${n.source}`.toLowerCase();
      const score = q.split(/\s+/).reduce((s, term) => (hay.includes(term) ? s + 1 : s), 0);
      return { note: n, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.note);

  return NextResponse.json({ results });
}
