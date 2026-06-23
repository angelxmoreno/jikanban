# Jikanban (JKB) — Implementation Plan

## Guiding Principles

- **Frontend-first with dummy data** — validate the UX and workflow before building any plumbing. Build `web/` against a typed dummy-data module that mirrors `schema.md` exactly; that module becomes the API contract.
- **Per-directory package manifests, no workspaces** — flat single repo with `api/package.json` and `web/package.json`. No Bun workspaces, no `packages/` layer (DECISION-015). Install per directory.
- **Environment-driven config — no hardcoded URLs, model names, or credentials.** Env vars land only with the phase that needs them.
- **Local validation first** — prove the workflow locally before touching Oracle.
- **SQLite is the database for now** — MariaDB migration is a future concern, not a current design constraint (DECISION-016).

---

## Phase 0 — Project Scaffold

**Goal:** Flat repo with `web/` scaffolded and running. No Docker, no backend yet.

- [x] `web/` directory with its own `package.json`
  - Vite + React + TypeScript
  - Radix UI + Radix Themes
- [x] `web/vite.config.ts`, `web/index.html`, `web/src/main.tsx`
- [x] `api/` directory placeholder (no code yet — created in Phase 4)
- [x] `web/` dev server runs: `cd web && bun install && bunx vite` (also `bun dev` from repo root)
- [x] Root tooling stays as-is (Biome, lefthook, commitlint, fallow)

---

## Phase 1 — Dummy Data + Frontend Core

**Goal:** Board view and card management working in the browser against in-memory dummy data.

- [x] Typed dummy-data module in `web/src/data/` mirroring `schema.md` field-for-field
  - `users`, `boards`, `columns`, `cards`, `card_milestones`, `card_transitions`
  - Same field names, same types (text PKs as strings, ISO 8601 timestamps, `priority` enum)
  - 3 default boards (Development, Blog Post, Customer Email) with their columns
  - Enough sample cards to exercise overdue + missed-milestone states
- [x] App shell with sidebar navigation (list of boards)
- [x] Board view — columns rendered left to right, cards in each column
- [x] Drag and drop card movement between columns (updates in-memory state; writes to dummy `card_transitions`, stamps `work_started_at` / `completed_at`)
- [x] Card creation form
  - Title, description, priority
  - Assigned to, assigned by
  - Due date picker
  - Milestone date pickers per middle column (optional, validated client-side against schema constraints)
- [x] Card detail / edit view
- [x] Visual indicator on card if overdue (due date passed, not Complete)
- [x] Visual indicator on card if a milestone is missed

**Note:** The dummy-data module is the de-facto API contract. Phase 5 Hono routes must return shapes matching it. Keep it in sync with `schema.md`.

---

## Phase 2 — Calendar View

**Goal:** Cards and milestones visible on a calendar, still against dummy data.

- [x] Monthly calendar view — cards plotted on due date
- [x] Weekly detail view — cards and milestone markers per day
- [x] Overdue cards highlighted
- [x] Click card on calendar to open card detail

---

## Phase 3 — Todos View

**Goal:** Per-user task list sorted by urgency, still against dummy data.

- [x] Todos view — all cards where `assigned_to = current_user`
- [x] Sorted by: overdue first, then by due date ascending
- [x] Filter by board and priority
- [x] Seeded users with current-user selector (DECISION-020)

---

## Phase 4 — Database + Schema (Backend)

**Goal:** `api/` bootstrapped, Drizzle schema defined, migrations running, DB seeded.

- [ ] `api/` directory with its own `package.json` (Bun + Hono + Drizzle)
- [ ] `.env.example` gains backend vars: `SQLITE_PATH`
- [ ] Define all Drizzle tables in `api/src/db/schema`
  - users, boards, columns, cards, card_milestones, card_transitions
- [ ] Write and run initial migration
- [ ] Enable `PRAGMA foreign_keys = ON` on SQLite connection
- [ ] Seed script
  - 1-2 test users
  - 3 default boards with their columns (same data the dummy module used)
- [ ] Verify schema with a manual Drizzle query

---

## Phase 5 — API Layer

**Goal:** Full CRUD for all entities via Hono routes. Shapes match the dummy-data contract from Phase 1.

- [ ] `GET/POST /boards`
- [ ] `GET/PUT/DELETE /boards/:id`
- [ ] `GET/POST /boards/:id/columns`
- [ ] `PUT/DELETE /columns/:id`
- [ ] `GET/POST /boards/:id/cards`
- [ ] `GET/PUT/DELETE /cards/:id`
- [ ] `POST /cards/:id/move` — moves card to a new column, stamps `work_started_at` or `completed_at` if applicable, writes to `card_transitions`
- [ ] `GET/POST /cards/:id/milestones`
- [ ] `DELETE /milestones/:id`
- [ ] `GET /users/:id/todos` — cards assigned to user, sorted by due date
- [ ] Milestone validation middleware — target dates must be ordered and before due date
- [ ] Basic error handling and response shape consistency
- [ ] Expose Hono RPC client types for the frontend

---

## Phase 6 — Wire Frontend to API

**Goal:** Replace the dummy-data module with real Hono RPC calls. Types flow via Hono RPC inference.

- [ ] Add API client in `web/` using Hono RPC
- [ ] Replace dummy-data reads/writes with API calls across board, card, milestone, todos, calendar views
- [ ] Drag-drop move calls `POST /cards/:id/move`
- [ ] Delete or archive the dummy-data module once all views are wired
- [ ] Verify type safety end-to-end (no hand-rolled FE types duplicating backend)

---

## Phase 7 — AI Ticket Assistant

**Goal:** AI-assisted card creation via Ollama.

- [ ] `.env.example` gains: `OLLAMA_BASE_URL`, `OLLAMA_MODEL`
- [ ] Hono route `POST /ai/assist` — accepts rough idea, returns draft title + description
- [ ] Calls Ollama via OpenAI-compatible API at `OLLAMA_BASE_URL`
- [ ] System prompt includes board context (board name, column names)
- [ ] "Help me write this" button on card creation form
- [ ] Loading state while waiting for Ollama response
- [ ] User can accept, edit, or ignore the AI draft

---

## Phase 8 — Open Notebook Integration

**Goal:** Bidirectional data flow between the kanban and Open Notebook.

- [ ] `.env.example` gains: `OPEN_NOTEBOOK_BASE_URL`

**Inbound (context into AI assistant):**
- [ ] On AI assist request, query Open Notebook search API with the user's rough idea
- [ ] Inject top results into the Ollama system prompt as project context
- [ ] Graceful fallback if Open Notebook is not configured or unavailable

**Outbound (kanban data into Open Notebook):**
- [ ] `POST /sync/open-notebook` — on-demand sync endpoint
- [ ] Serialize full board state per board (cards, milestones, transitions, overdue summary)
- [ ] POST each board as a source document to Open Notebook API
- [ ] Cron job on Hono backend for nightly scheduled sync
- [ ] "Sync Now" button in the UI with last synced timestamp

---

## Phase 9 — Local Validation

**Goal:** Use the app in real workflows for 2-4 weeks before promoting to Oracle.

- [ ] Run the app locally on dokbuntu
- [ ] Create real boards and cards for active projects
- [ ] Use the AI assistant and Open Notebook integration daily
- [ ] Note any friction points, missing features, or schema gaps
- [ ] Document findings for the Oracle migration phase

---

## Phase 10 — Oracle Migration (Post-Validation)

**Goal:** Promote to production on Oracle A1 Flex VM.

- [ ] Containerize with Docker Compose (Docker enters here, not at the start)
- [ ] Swap SQLite for MariaDB — update Drizzle connection string and driver
- [ ] Add MariaDB service to Docker Compose (or point at existing shared instance)
- [ ] Wire secrets through Infisical
- [ ] Drop compose into Dokploy on Oracle
- [ ] Configure Traefik + Cloudflare tunnel for public URL
- [ ] Update `OLLAMA_BASE_URL` to point at Omen via Tailscale or keep on LAN
- [ ] Smoke test all routes and views

---

## Future Phases (Post-Oracle)

- **Auth** — swap seeded-user selector for Clerk, wire `current_user` throughout
- **BYOK** — swap Ollama base URL for cloud provider endpoint + key via Infisical
- **Notifications** — Telegram/SMS on card assignment via notify() abstraction
- **Richer Open Notebook sync** — event-driven transitions, real-time append log
- **Mobile view** — responsive layout pass

---

## Notes

- Docker is deferred to Phase 10 (production), not used during development. See `decisions-log.md` DECISION-017.
- The dummy-data module in Phase 1 is the single source of truth for the API response shape until Phase 6 wires it away. Keep it aligned with `schema.md`.
- Phase 1 was corrected after initial completion to add the `workspaces` layer and per-workspace settings, and to make `assigned_by` backend-set (see DECISION-018 and DECISION-019).
- Per-directory `package.json` (no workspaces) is the dependency model — see DECISION-015.