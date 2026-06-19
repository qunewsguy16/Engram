"use client";

import { useState, useTransition } from "react";
import { Sparkles, ArrowRight, Loader2, Target } from "lucide-react";
import { generateDream } from "@/app/actions/dream";
import type { Dream, SuggestedAction } from "@/lib/ai/schema";

function actionLabel(a: SuggestedAction): string {
  switch (a.kind) {
    case "todoist.create":
      return `Add task: ${a.title}`;
    case "memory.pin":
      return `Pin memory: ${a.reason}`;
    case "calendar.block":
      return `Block ${a.durationMin}m: ${a.title} @ ${a.start}`;
  }
}

export function Dream() {
  const [data, setData] = useState<{ dream: Dream; source: "live" | "mock" } | null>(null);
  const [pending, start] = useTransition();

  function run() {
    start(async () => setData(await generateDream()));
  }

  const dream = data?.dream;

  return (
    <section className="card card-pad">
      <div className="flex items-center justify-between">
        <div className="section-title"><Sparkles size={12} /> /dream</div>
        <div className="flex items-center gap-2">
          {data && <span className="chip">{data.source}</span>}
          <button onClick={run} disabled={pending} className="btn-primary">
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {dream ? "Re-dream" : "Consolidate yesterday"}
          </button>
        </div>
      </div>

      {!dream && !pending && (
        <p className="text-sm text-muted mt-3 max-w-lg">
          Consolidates yesterday&apos;s commits, notes, tasks, and reading into one
          grounded focus for today. Engram-style memory consolidation, for you.
        </p>
      )}

      {dream && (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
            <div className="section-title text-accent"><Target size={12} /> Today&apos;s one thing</div>
            <div className="text-sm font-medium mt-1">{dream.oneThing}</div>
          </div>

          {dream.threads.map((t, i) => (
            <div key={i} className="rounded-lg border border-border p-3 bg-bg/40">
              <div className="text-sm font-medium">{t.title}</div>
              <div className="text-sm text-muted mt-1">{t.body}</div>
              {t.sourceIds.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {t.sourceIds.map((s) => (
                    <span key={s} className="chip text-[10px] font-mono">{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {dream.suggestedActions.length > 0 && (
            <div>
              <div className="section-title mt-4">Suggested actions</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {dream.suggestedActions.map((a, i) => (
                  // Proposals only — execution is an explicit, confirmed click (never auto-run).
                  <button key={i} className="btn text-xs" title="Review and confirm">
                    {actionLabel(a)} <ArrowRight size={12} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {dream.openQuestions.length > 0 && (
            <div className="text-xs text-muted mt-2">
              <span className="font-medium">Open questions: </span>
              {dream.openQuestions.join(" · ")}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
