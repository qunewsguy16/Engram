# Architecture & Product Decisions

A judge-orchestrated panel (architecture, AI/RAG, product/behavioral lenses)
audited the original 8-phase "build to completion" plan against the code. This
records the decisions that came out of it so the rationale isn't lost.

## Status (built so far)

Phase 0 hardening complete; the daily loop and several corrections are in.
All slices ship with unit tests (64 passing) and green CI on PR #1.

- ✅ Foundation: stable React 19/Next 15.5, zero-dep logger, strict flag
  parsing, secret/DB gitignore, Vitest + GitHub Actions CI.
- ✅ AI contract (`lib/ai/*`): zod `DreamSchema` (grounded, typed actions),
  pure-TS reducer, embeddings interface + BLOB helpers + real `openaiEmbedder`,
  lazy Anthropic client (`claude-opus-4-8`), `runDream` with mock fallback.
- ✅ Connectors: `Result<T>` + `health()`; real GitHub connector exemplar
  (gated), mocks for the rest; demoted to a footer.
- ✅ Daily loop: Today one-thing + rate-based habits; quick capture (⌘⇧N) +
  inbox; end-of-day review (⌘⇧R) with streak; `/dream` consumes captures +
  learnings; dream actions send to inbox (human-in-the-loop).
- ✅ Agenda: live "Up next" + priorities (no Todoist mirror).
- ✅ Learning: takeaway-gated completion; takeaways become concepts.
- ✅ Memory: semantic (brute-force cosine) path behind the flag, keyword default.
- ✅ First-run onboarding checklist.
- ✅ Goal-balance widget (under-served-goal callout).
- ✅ Full connector set via `defineConnector` (GitHub/GCal/Todoist/Gmail/Notion/
  Drive); registry is a token table; all gated by `FEATURE_REAL_CONNECTORS`.
- ✅ **SQLite persistence** (DECISIONS.md raw better-sqlite3, no ORM): all three
  client stores (inbox/review/learning) now persist to `data/engram-os.sqlite`
  via server-only modules + server actions. Widgets that read data are now RSC
  and refresh via `revalidatePath` after mutations. The `useStoreSync` hook
  and `localStore.ts` are gone — server data flows top-down.

Not yet built (next): live `/dream` wiring (flag off; mock until a key is set;
candidate for the `claude-api` skill), dream-run persistence into the
`dream_runs` table that's already provisioned.

## Verdict in one line

The foundation (mock-first adapters, RSC-default, typed seams, flags-before-
features, local-first) is sound. The original *roadmap* was over-scoped at the
edges and inverted: it front-loaded breadth (7 connectors, cross-platform,
observability) and back-loaded the only mechanics that change behavior (the
daily loop). Corrected below.

## The overriding risk

This dashboard is itself a side project that can eat the time meant for the
owner's actual goals (learn AI/ML, ship *other* projects). The plan is
therefore capped and resequenced so the build doubles as the AI/ML curriculum.

**Build cap:** ~2 weekends to the minimal daily loop, then a feature freeze
until 10 consecutive days of real use are logged. A future "build-time vs
goals" line in the goal-weighting widget should let the tool police itself.

## Corrected foundation (done in Phase 0)

| Decision | Why |
|---|---|
| Stable React 19 + `@types/react` 19; Next 15.1+ | RC + types@18 mismatch mistyped the server-action/swap layer |
| Zero-dep logger, dropped pino/pino-pretty | pino-pretty's worker transport breaks the Next server/edge build |
| Explicit `"true"/"1"` flag parsing | `z.coerce.boolean()` made every flag (incl. `=false`) **true** |
| `server-only` on config/log; `Result<T>` + `health()` connectors | model the live world (provenance, staleness, errors) before wiring it |
| `.gitignore` all `.env*` + `data/*.sqlite*` | secrets and the personal DB were committable |
| Defer SQLite/Drizzle, Zustand, Playwright/axe | not needed until a feature requires them; raw SQLite likely beats Drizzle here |
| `/dream` as a **server action**, not a public route | no unauthenticated token-spending endpoint; CSRF-safe |

## AI/`/dream` contract (scaffolded in `lib/ai/*`)

- **Model default `claude-opus-4-8`** (once-daily single-user synthesis: quality
  matters, cost ~cents). Sonnet 4.6 is the fallback, not the default.
- **Structured output validated by `DreamSchema` (zod)** with one repair retry,
  then graceful fallback to a schema-conforming mock. The app never throws on a
  bad model response. (Swap manual validation for the SDK's structured-outputs
  helper when wiring live.)
- **Grounding is structural:** signals are numbered/ID'd; every thread and action
  must carry `sourceIds` ("cite a signal or omit the claim") to curb confabulation.
- **Actions are typed proposals, never auto-executed.** The future 5am cron only
  persists a read-only `dream_run`; writes (Todoist/calendar) happen on an
  explicit, confirmed click. Prevents a hallucinated action mutating real
  accounts unattended. Also the defense against prompt-injection from ingested
  content (emails, issues, papers).
- **Reduction is pure TS**, not an LLM pass (one person's day fits the context
  window; an LLM reduce would be wasted cost).
- **Retrieval stays substring for now**; embeddings interface + Float32 BLOB
  helpers + `{model,dim}` stamping + content-hash idempotency are scaffolded.
  Brute-force cosine over `text-embedding-3-small` is the next step; defer
  `sqlite-vec`/FTS5/BM25/RRF until brute force is proven too slow.
- **Cost is ~$3–5/mo**; a one-line daily budget check is enough — no cost
  subsystem. **PII-redaction regex and local-Ollama fallback are cut** (theater
  for a single-user tool sending its own data to its own key).

## Cut / deferred (from the original plan)

- **Cut:** Phase 6 cross-platform (PWA/extension/CLI/Tauri), Phase 7 observability
  (SLO board, cost dashboard, audit subsystem, privacy mode), most of Phase 8
  (voice, knowledge graph, agent orchestration, public "now page"), paper
  auto-summary (anti-learning), Notion/Drive/HF connectors, inbox/email triage.
- **Defer until ≥10 days of real use:** embeddings upgrade, react-pdf reader +
  "open in Jupyter", Pomodoro/focus-mode, SSE.

## Resequenced roadmap (build = curriculum)

1. **Loop skeleton (no AI).** Persist; Today "one thing" + habit-as-rate +
   quick-capture + 9pm review; wire real GitHub/Todoist/GCal reads. Plain web
   dev — fast momentum, immediate daily value.
2. **`/dream` as a real LLM app** (lesson: context assembly, structured output,
   prompt iteration, eval). Replace the mock in `lib/ai/dream.ts`'s live branch.
3. **Memory as hand-built RAG** (lesson: chunking, embeddings, retrieval, eval).
   Substring → brute-force cosine; add a tiny recall@5 eval set.
4. **Learning loop with generation + FSRS-lite.** Required own-words takeaway to
   finish a paper; cards from the owner's words; arXiv ingest (not auto-summary).
5. **Goal-weighting imbalance flag** (only if days-used ≥ 10). The one behavioral
   feature worth polishing — and it polices risk #1.

The `/dream` (consolidation) and Memory (retrieval) builds deliberately mirror
the Engram paper's thesis, so the dashboard becomes a working model of the
research while teaching the AI/ML the owner wants to learn.

## Product corrections to apply when the loop is built

- Today widget commits to **one thing above the fold**; everything else is a
  collapsed digest.
- Habits track **rate** (e.g. "9 of last 14") + **silent** freeze tokens, not
  fragile all-or-nothing streaks (`lib/profile.ts`).
- Tasks/Calendar shows only **today's one task + next event**, not a mirror of
  Todoist.
- Connectors widget demoted to a small settings/footer affordance.
- Design **empty/first-run states** as onboarding (real data starts empty).
