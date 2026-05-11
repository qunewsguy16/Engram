export interface Project {
  id: string;
  name: string;
  description: string;
  repo?: string;
  branch?: string;
  openPRs: number;
  todos: string[];
  nextMilestone?: string;
}

export const projects: Project[] = [
  {
    id: "engram",
    name: "Engram",
    description: "Memory consolidation for LLM agents (research repo).",
    repo: "qunewsguy16/engram",
    branch: "claude/custom-code-os-dashboard-BOlVQ",
    openPRs: 1,
    todos: [
      "Finish ablation section in paper",
      "Run consolidation benchmark on long-context tasks",
      "Refactor engram_demo_v1.py into modules",
    ],
    nextMilestone: "Submit to workshop - 3 weeks",
  },
  {
    id: "claude-os-dashboard",
    name: "Claude Code OS Dashboard",
    description: "This dashboard - personal command center.",
    repo: "qunewsguy16/engram",
    branch: "claude/custom-code-os-dashboard-BOlVQ",
    openPRs: 0,
    todos: [
      "Wire real MCP connectors (GitHub, Calendar, Todoist)",
      "Implement /dream with Claude API + memory store",
      "Add embeddings-based search to Memory widget",
    ],
    nextMilestone: "v1 shipped today",
  },
  {
    id: "rag-toolkit",
    name: "RAG Toolkit (side)",
    description: "Composable retrieval primitives - chunking, rerank, eval.",
    openPRs: 0,
    todos: ["Add Cohere rerank adapter", "Benchmark vs naive top-k"],
    nextMilestone: "First public release",
  },
];
