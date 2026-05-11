export interface MemoryNote {
  id: string;
  title: string;
  snippet: string;
  source: string;
  tags: string[];
  pinned?: boolean;
  updatedAt: string;
}

export const memory: MemoryNote[] = [
  {
    id: "m1",
    title: "Engram consolidation hypothesis",
    snippet: "Replay-based consolidation may close the gap between episodic recall and parametric memory in agents...",
    source: "Engram_paper.pdf - 3",
    tags: ["engram", "memory", "research"],
    pinned: true,
    updatedAt: "today",
  },
  {
    id: "m2",
    title: "Why /dream matters",
    snippet: "Daily reflection over yesterday's PRs, notes, and tasks compresses context into reusable abstractions.",
    source: "notes/dream.md",
    tags: ["dashboard", "context"],
    pinned: true,
    updatedAt: "today",
  },
  {
    id: "m3",
    title: "DSPy compile pattern",
    snippet: "Optimizers tune prompts against a metric - treat prompts as parameters, not strings.",
    source: "notes/dspy.md",
    tags: ["dspy", "prompting"],
    updatedAt: "yesterday",
  },
  {
    id: "m4",
    title: "Side project north star",
    snippet: "Ship one public artifact (paper, post, repo) every 2 weeks. Cadence > scope.",
    source: "notes/north-star.md",
    tags: ["habits", "shipping"],
    updatedAt: "3d ago",
  },
  {
    id: "m5",
    title: "RAG eval baseline numbers",
    snippet: "Top-k=20 + rerank beats naive top-k by 14pts on internal eval. Chunk size matters more than k.",
    source: "rag-toolkit/eval.md",
    tags: ["rag", "eval"],
    updatedAt: "2d ago",
  },
];
