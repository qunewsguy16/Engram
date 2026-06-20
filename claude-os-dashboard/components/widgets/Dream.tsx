"use client";

import { useState, useTransition } from "react";
import { Sparkles, ArrowRight, Loader2, Target, Check } from "lucide-react";
import { generateDream } from "@/app/actions/dream";
import { captureAction } from "@/app/actions/inbox";
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
  const [sent, setSent] = useState<Set<number>>(new Set());
  const [pending, start] = useTransition();

  function run() {
    // The server action reads captures + review learnings directly from SQLite.
    setSent(new Set());
    start(async () => setData(await generateDream()));
  }

  // Safe, reversible execution: send the proposal to the inbox. No external
  // writes auto-run — the user triages from there (human-in-the-loop gate).
  function acceptAction(a: SuggestedAction, i: number) {
    start(async () => {
      await captureAction(`${actionLabel(a)} #dream`);
      setSent((prev) => new Set(prev).add(i));
    });
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
                {dream.suggestedActions.map((a, i) =>
                  sent.has(i) ? (
                    <span key={i} className="chip text-xs text-emerald-600 border-emerald-300">
                      <Check size={12} /> Sent to inbox
                    </span>
                  ) : (
                    <button
                      key={i}
                      onClick={() => acceptAction(a, i)}
                      className="btn text-xs"
                      title="Send this proposal to your inbox"
                    >
                      {actionLabel(a)} <ArrowRight size={12} />
                    </button>
                  ),
                )}
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
