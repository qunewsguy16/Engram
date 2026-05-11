import { NextResponse } from "next/server";

/**
 * /dream — synthesize yesterday's signals into insights.
 *
 * v1: returns deterministic structured output from mocked inputs.
 * v2 (TODO): replace mocked summary with a Claude API call using
 * the Anthropic SDK + a memory store of yesterday's PRs, commits,
 * notes, and completed tasks. See claude-api skill for the recipe.
 */
export async function POST() {
  const dream = {
    generatedAt: new Date().toISOString(),
    threads: [
      {
        title: "Engram paper is the critical path",
        body: "Three of yesterday's commits and two notes converge on the ablation section. Today's deep-work block is best spent here, not on the dashboard.",
      },
      {
        title: "RAG eval insight is reusable",
        body: "The rerank > top-k finding from rag-toolkit applies directly to Engram's memory retrieval. Consider citing your own numbers in Section 4.2.",
      },
      {
        title: "Reading queue is bottlenecked on Mamba",
        body: "Mamba has been queued for 6 days. 30 minutes today unblocks the SSM section. Schedule it before the 1:1.",
      },
    ],
    suggestedActions: [
      { label: "Pin 'RAG eval baseline numbers' to context", kind: "memory" },
      { label: "Reschedule 'Skim Mamba paper' to 09:30 today", kind: "task" },
      { label: "Open Engram_paper.pdf to Section 4", kind: "open" },
    ],
  };

  return NextResponse.json(dream);
}
