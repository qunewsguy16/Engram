# Claude Code OS Dashboard

Personal command center for code, learning, and daily focus. Tailored around
**learn AI/ML deeper**, **ship side projects**, and **daily focus / habits**.

Built as a sibling project inside the Engram repo so it can be split out later
(`git subtree split` / move to its own repo). v1 runs entirely off mocked data
with a clean adapter layer so real integrations drop in.

## Run

```bash
cd claude-os-dashboard
npm install
npm run dev
# open http://localhost:3000
```

## Layout

Two-column dashboard with seven widgets:

| Widget | What it shows | Where data lives |
|---|---|---|
| **Today** | One-sentence definition of a winning day, focus block, habit streaks, active goals | `lib/profile.ts` |
| **/dream** | Click to consolidate yesterday's commits, notes, tasks into insights + suggested actions | `app/api/dream/route.ts` (v1 deterministic; swap to Claude API) |
| **Tasks & Calendar** | Today's Todoist tasks + Google Calendar agenda on one timeline | `lib/data/tasks.ts` |
| **Projects** | Engram + side projects with branch, open PRs, top TODOs, next milestone | `lib/data/projects.ts` |
| **Memory & Context** | Live search over your notes / RAG corpus, pinnable | `lib/data/memory.ts`, `app/api/memory/search/route.ts` |
| **Learning** | Reading queue (papers, courses) + spaced-repetition concept queue | `lib/data/learning.ts` |
| **Connectors** | Status tiles for GitHub, Gmail, Calendar, Notion, Todoist, Engram RAG, Drive | `lib/connectors/index.ts` |

## Architecture

```
app/
  page.tsx                 # dashboard grid
  layout.tsx
  globals.css              # tailwind + small design tokens
  api/
    dream/route.ts         # POST /api/dream  -> consolidation output
    memory/search/route.ts # GET  /api/memory/search?q=...
components/
  Shell.tsx                # header, kbd hint, /dream button
  widgets/                 # one file per widget
lib/
  connectors/              # ConnectorMeta interface + stub registry
  data/                    # mocked domain data (projects, tasks, memory...)
  profile.ts               # your name, goals, habits
  cn.ts
```

## Wiring real integrations (next steps)

The adapter layer is intentionally thin so each connector can be wired
independently. All MCP servers listed below are already available in your
environment.

1. **/dream -> Claude API.** Replace the mocked response in `app/api/dream/route.ts`
   with an Anthropic SDK call. See the `claude-api` skill for a caching-friendly
   pattern. Inputs: yesterday's commits (GitHub MCP), completed tasks
   (Todoist MCP), edited notes (Notion MCP), reading history (`lib/data/learning.ts`).
2. **GitHub connector.** Replace `lib/connectors/index.ts` GitHub entry with a
   server action that calls `mcp__github__list_pull_requests` and `list_commits`.
3. **Calendar + Tasks.** Server actions hitting `google_calendar_find_events`
   and `find-tasks` (Todoist MCP). Replace `lib/data/tasks.ts` with a fetch.
4. **Memory search -> embeddings.** Swap the substring matcher in
   `app/api/memory/search/route.ts` for brute-force cosine over stored
   Float32 embeddings (sufficient at this corpus size); add `sqlite-vec`
   only if/when brute force is too slow. Notes live as markdown under
   `data/notes/`.
5. **Engram RAG.** Point the "Engram RAG" connector at the Engram demo's
   memory store so the dashboard can query consolidated memories.

## Tailoring

- Edit `lib/profile.ts` to change goals, habits, focus.
- Edit `app/page.tsx` to rearrange the grid (left vs right column).
- Each widget is one self-contained file in `components/widgets/`; delete what
  you don't want, add new ones the same way.
