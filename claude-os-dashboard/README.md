# Claude Code OS Dashboard

Personal command center for code, learning, and daily focus. Tailored around
**learn AI/ML deeper**, **ship side projects**, and **daily focus / habits**.

Built as a sibling project inside the Engram repo so it can be split out later
(`git subtree split` / move to its own repo). It runs locally; external
integrations are gated behind feature flags and fall back to mock/local data
so it's fully usable with zero credentials.

> **Roadmap, scope, and the rationale behind every major choice live in
> [`DECISIONS.md`](./DECISIONS.md)** — read it before adding features. The plan
> is deliberately capped (and resequenced) to avoid the dashboard eating the
> goals it serves.

## Run

```bash
cd claude-os-dashboard
npm install
npm run dev        # http://localhost:3000
npm test           # vitest (64 unit tests)
npm run typecheck  # tsc --noEmit
npm run build      # next build
```

## The daily loop

The point of the dashboard is a loop, not a screen:

1. **Morning** — open it; **Today** shows the single *one thing* that matters
   and your honest habit rates. `/dream` consolidates yesterday's signals
   (commits, tasks, captures, learnings) into one grounded focus + proposals.
2. **All day** — `⌘⇧N` quick-capture anything into the **Inbox**; **Up next**
   shows the live next event + today's priorities.
3. **Night** — `⌘⇧R` end-of-day **review**: did the one thing get done? what did
   you learn? Those entries feed tomorrow's `/dream`.

| Shortcut | Action |
|---|---|
| `⌘⇧N` / `Ctrl⇧N` | Quick capture |
| `⌘⇧R` / `Ctrl⇧R` | End-of-day review |
| `⌘↵` / `Esc` | Save / cancel in a modal |

## Widgets

| Widget | What it does | Source |
|---|---|---|
| **Today** | One thing above the fold; habits as honest *rate* (not fragile streaks), atRisk on 2 misses in a row | `lib/today.ts`, `lib/profile.ts` |
| **/dream** | Consolidates yesterday into one focus + grounded threads + typed action proposals (click → sent to inbox) | `app/actions/dream.ts`, `lib/ai/*` |
| **Up next** | Live current/next event + countdown; today's p1/p2 priorities (no Todoist mirror) | `lib/agenda.ts`, `lib/data/tasks.ts` |
| **Projects** | Side projects; live PR count from the GitHub connector when enabled, else mock | `lib/data/projects.ts`, `lib/connectors/github.ts` |
| **Inbox** | Quick-capture items with one-click triage (pin / archive) | `lib/inbox.ts` |
| **Memory** | Search notes; keyword by default, semantic (cosine) behind a flag | `app/api/memory/search/route.ts`, `lib/memorySearch.ts` |
| **Learning** | Reading queue; a paper isn't *done* until you write an own-words takeaway, which becomes a concept | `lib/learningProgress.ts`, `lib/data/learning.ts` |
| **Connectors** (footer) | Quiet health strip | `lib/connectors/index.ts` |

## Architecture

```
app/
  page.tsx                 # grid + onboarding + connectors footer
  actions/dream.ts         # server action: /dream (mutations are actions, not routes)
  api/memory/search/route.ts
components/
  Shell, QuickCapture, DailyReview, Onboarding, ConnectorsFooter
  widgets/                 # one file per widget
lib/
  ai/                      # schema (DreamSchema), reduce, dream, client, embeddings
  connectors/              # Result<T> + health(); github (live) + mocks
  data/                    # mock domain data
  localStore.ts            # generic localStorage store (inbox/review/learning)
  inbox / review / learningProgress / agenda / memorySearch / profile / today / config / log
```

### Conventions
- **Adapter-first:** widgets never import SDKs; everything goes through `lib/*`.
- **Mutations are server actions**, not public routes.
- **Connectors return `Result<T>`** (live/mock provenance, errors) + `health()`,
  so graceful degradation is built in.
- **Feature flags** (`lib/config.ts`): `FEATURE_REAL_CONNECTORS`,
  `FEATURE_DREAM_LIVE`, `FEATURE_MEMORY_EMBEDDINGS` — all off by default.
- **Local-first:** persistence is localStorage for now; SQLite is deferred
  until a feature needs it (see `DECISIONS.md`).

## Going live (flip a flag + add a key)

| To enable | Set |
|---|---|
| `/dream` via Claude | `ANTHROPIC_API_KEY`, `FEATURE_DREAM_LIVE=true` (model `claude-opus-4-8`) |
| Semantic memory search | `EMBEDDING_API_KEY`, `FEATURE_MEMORY_EMBEDDINGS=true` |
| Live GitHub in Projects/footer | `GITHUB_TOKEN` (+ `GITHUB_REPO`), `FEATURE_REAL_CONNECTORS=true` |

Each remaining connector (Calendar, Todoist, Gmail, Notion, Drive) follows the
`lib/connectors/github.ts` exemplar: gate on the flag + a credential, return
`Result`, never throw in `health()`.

## Tailoring

- `lib/profile.ts` — goals, habits. `lib/today.ts` — the one thing + focus block.
- `app/page.tsx` — rearrange the grid.
- Each widget is one self-contained file in `components/widgets/`.
