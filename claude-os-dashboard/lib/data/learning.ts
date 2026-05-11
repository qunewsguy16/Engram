export interface ReadingItem {
  id: string;
  title: string;
  source: string;
  kind: "paper" | "course" | "post";
  status: "queued" | "reading" | "done";
  arxiv?: string;
  url?: string;
  takeaway?: string;
}

export const reading: ReadingItem[] = [
  {
    id: "engram",
    title: "Engram: episodic memory consolidation for agents",
    source: "Local PDF",
    kind: "paper",
    status: "reading",
    takeaway: "Sleep-like replay improves long-horizon recall.",
  },
  {
    id: "mamba",
    title: "Mamba: Linear-Time Sequence Modeling with Selective SSMs",
    source: "arXiv",
    kind: "paper",
    status: "queued",
    arxiv: "2312.00752",
  },
  {
    id: "ringattn",
    title: "Ring Attention with Blockwise Transformers",
    source: "arXiv",
    kind: "paper",
    status: "queued",
    arxiv: "2310.01889",
  },
  {
    id: "dspy",
    title: "DSPy programming model",
    source: "Stanford NLP",
    kind: "course",
    status: "reading",
    takeaway: "Compile prompts the way you compile code.",
  },
  {
    id: "ttt",
    title: "Test-Time Training as a strong inductive bias",
    source: "arXiv",
    kind: "paper",
    status: "queued",
    arxiv: "2407.04620",
  },
];

export interface Concept {
  id: string;
  label: string;
  lastReviewed: string;
  due: string;
}

export const reviewQueue: Concept[] = [
  { id: "moe", label: "Mixture-of-Experts routing", lastReviewed: "5d ago", due: "today" },
  { id: "ssm", label: "State-Space Models (S4/Mamba)", lastReviewed: "9d ago", due: "today" },
  { id: "ppo-vs-grpo", label: "PPO vs GRPO", lastReviewed: "2d ago", due: "tomorrow" },
];
