"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

interface DreamThread { title: string; body: string }
interface DreamAction { label: string; kind: string }
interface DreamResponse {
  generatedAt: string;
  threads: DreamThread[];
  suggestedActions: DreamAction[];
}

export function Dream() {
  const [data, setData] = useState<DreamResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/dream", { method: "POST" });
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card card-pad">
      <div className="flex items-center justify-between">
        <div className="section-title"><Sparkles size={12} /> /dream</div>
        <button onClick={run} disabled={loading} className="btn-primary">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {data ? "Re-dream" : "Consolidate yesterday"}
        </button>
      </div>

      {!data && !loading && (
        <p className="text-sm text-muted mt-3 max-w-lg">
          Claude reads yesterday's commits, notes, completed tasks, and reading
          history, then surfaces what to do today. Engram-style memory
          consolidation, but for you.
        </p>
      )}

      {data && (
        <div className="mt-4 space-y-3">
          {data.threads.map((t, i) => (
            <div key={i} className="rounded-lg border border-border p-3 bg-bg/40">
              <div className="text-sm font-medium">{t.title}</div>
              <div className="text-sm text-muted mt-1">{t.body}</div>
            </div>
          ))}
          <div>
            <div className="section-title mt-4">Suggested actions</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.suggestedActions.map((a, i) => (
                <button key={i} className="btn text-xs">
                  {a.label} <ArrowRight size={12} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
