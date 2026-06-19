"use client";

import { useEffect, useState } from "react";
import { Brain, Pin, Search, Loader2 } from "lucide-react";
import type { MemoryNote } from "@/lib/data/memory";

export function Memory() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<MemoryNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/memory/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`search failed (${res.status})`);
        const json = await res.json();
        setResults(Array.isArray(json?.results) ? json.results : []);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError("Search unavailable.");
          setResults([]);
        }
      } finally {
        // Only the latest (non-aborted) request clears loading.
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 150);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
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
        {loading && <Loader2 size={14} className="animate-spin text-muted" />}
      </div>

      <div className="mt-3 space-y-2 max-h-72 overflow-auto">
        {error && <div className="text-sm text-red-500 py-6 text-center">{error}</div>}
        {!error && results.map((n) => (
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
        {!error && !loading && results.length === 0 && (
          <div className="text-sm text-muted py-6 text-center">No matches.</div>
        )}
      </div>
    </section>
  );
}
