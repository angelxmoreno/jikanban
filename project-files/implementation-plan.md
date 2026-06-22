# Jikanban (JKB) — Implementation Plan

## Guiding Principles

- Docker-first from day one — nothing runs outside of a container except Ollama on Omen
- Environment-driven config — no hardcoded URLs, model names, or credentials
- Local validation first — prove the workflow on dokbuntu before touching Oracle
- SQLite is the database for now — MariaDB migration is a future concern, not a current design constraint

---

## Phase 0 — Project Scaffold

**Goal:** Repo structure, Docker Compose, and dev environment running.

- [ ] Initialize flat single repo
  - `api/` — Bun + Hono backend (owns Drizzle schema + migrations)
  - `web/` — React + Vite frontend
- [ ] `docker-compose.yml`
  - `jkb-api` service (Bun + Hono)
  - `jkb-web` service (Vite dev server or static build)
  - SQLite bind mount for persistence
  - Open Notebook service (official Docker image)
- [ ] `.env.example` with all required variables
  - `OLLAMA_BASE_URL` — LAN IP of Omen
  - `OLLAMA_MODEL` — e.g. llama3.2
  - `OPEN_NOTEBOOK_BASE_URL`
  - `SQLITE_PATH`
- [ ] Confirm `docker compose up` brings all services online

---

## Phase 1 — Database + Schema

**Goal:** Drizzle schema defined, migrations running, DB seeded.

- [ ] Define all Drizzle tables in `api/src/db/schema`
  - users
  - boards
  - columns
  - cards
  - card_milestones
  - card_transitions
- [ ] Write and run initial migration
- [ ] Enable `PRAGMA foreign_keys = ON` on SQLite connection
- [ ] Seed script
  - 1-2 test users
  - 3 default boards (Development, Blog Post, Customer Email) with their columns
- [ ] Verify schema with a manual Drizzle query

---

## Phase 2 — API Layer

**Goal:** Full CRUD for all entities via Hono routes.

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

---

## Phase 3 — Frontend Core

**Goal:** Board view and card management working in the browser.

- [ ] App shell with sidebar navigation (list of boards)
- [ ] Board view — columns rendered left to right, cards in each column
- [ ] Drag and drop card movement between columns (triggers `POST /cards/:id/move`)
- [ ] Card creation form
  - Title, description, priority
  - Assigned to, assigned by
  - Due date picker
  - Milestone date pickers per middle column (optional, validated client-side)
- [ ] Card detail / edit view
- [ ] Visual indicator on card if overdue (due date passed, not Complete)
- [ ] Visual indicator on card if a milestone is missed

---

## Phase 4 — Calendar View

**Goal:** Cards and milestones visible on a calendar.

- [ ] Monthly calendar view — cards plotted on due date
- [ ] Weekly detail view — cards and milestone markers per day
- [ ] Overdue cards highlighted
- [ ] Click card on calendar to open card detail

---

## Phase 5 — Todos View

**Goal:** Per-user task list sorted by urgency.

- [ ] Todos view — all cards where `assigned_to = current_user`
- [ ] Sorted by: overdue first, then by due date ascending
- [ ] Filter by board and priority
- [ ] Hardcoded current user in MVP (no auth yet)

---

## Phase 6 — AI Ticket Assistant

**Goal:** AI-assisted card creation via Ollama.

- [ ] Hono route `POST /ai/assist` — accepts rough idea, returns draft title + description
- [ ] Calls Ollama via OpenAI-compatible API at `OLLAMA_BASE_URL`
- [ ] System prompt includes board context (board name, column names)
- [ ] "Help me write this" button on card creation form
- [ ] Loading state while waiting for Ollama response
- [ ] User can accept, edit, or ignore the AI draft

---

## Phase 7 — Open Notebook Integration

**Goal:** Bidirectional data flow between the kanban and Open Notebook.

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

## Phase 8 — Local Validation

**Goal:** Use the app in real workflows for 2-4 weeks before promoting to Oracle.

- [ ] Run `docker compose up` on dokbuntu
- [ ] Create real boards and cards for active projects
- [ ] Use the AI assistant and Open Notebook integration daily
- [ ] Note any friction points, missing features, or schema gaps
- [ ] Document findings for the Oracle migration phase

---

## Phase 9 — Oracle Migration (Post-Validation)

**Goal:** Promote to production on Oracle A1 Flex VM.

- [ ] Swap SQLite for MariaDB — update Drizzle connection string and driver
- [ ] Add MariaDB service to Docker Compose (or point at existing shared instance)
- [ ] Wire secrets through Infisical
- [ ] Drop compose into Dokploy on Oracle
- [ ] Configure Traefik + Cloudflare tunnel for public URL
- [ ] Update `OLLAMA_BASE_URL` to point at Omen via Tailscale or keep on LAN
- [ ] Smoke test all routes and views

---

## Future Phases (Post-Oracle)

- **Auth** — add Clerk, wire `current_user` throughout, remove hardcoded user seed
- **BYOK** — swap Ollama base URL for cloud provider endpoint + key via Infisical
- **Notifications** — Telegram/SMS on card assignment via notify() abstraction
- **Richer Open Notebook sync** — event-driven transitions, real-time append log
- **Mobile view** — responsive layout pass
