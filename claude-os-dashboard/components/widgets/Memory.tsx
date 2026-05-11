"use client";

import { useEffect, useState } from "react";
import { Brain, Pin, Search } from "lucide-react";
import type { MemoryNote } from "@/lib/data/memory";

export function Memory() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<MemoryNote[]>([]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await fetch(`/api/memory/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setResults(json.results);
    }, 100);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <section className="card card-pad">
      <div className="flex items-center justify-between">
        <div className="section-title"><Brain size={12} /> Memory & Context</div>
        <span className="chip">RAG over local notes</span>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-bg/50 px-3 py-2">
        <Search size={14} className="text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search notes, papers, commits..."
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>

      <div className="mt-3 space-y-2 max-h-72 overflow-auto">
        {results.map((n) => (
          <div key={n.id} className="rounded-lg border border-border p-3 hover:bg-bg/40 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">{n.title}</div>
                  {n.pinned && <Pin size={11} className="text-accent" />}
                </div>
                <div className="text-sm text-muted mt-0.5 line-clamp-2">{n.snippet}</div>
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  {n.tags.map((t) => (
                    <span key={t} className="chip text-[10px]">#{t}</span>
                  ))}
                  <span className="text-[11px] text-muted ml-1">{n.source}</span>
                </div>
              </div>
              <div className="text-[11px] text-muted whitespace-nowrap">{n.updatedAt}</div>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <div className="text-sm text-muted py-6 text-center">No matches.</div>
        )}
      </div>
    </section>
  );
}
