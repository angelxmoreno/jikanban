# Jikanban (JKB) — Decisions Log

A living document. Every significant architectural, technical, or product decision gets recorded here with its rationale. Append new entries at the bottom.

---

## Decision Format

```
### [DECISION-NNN] Short title
**Date:** YYYY-MM-DD
**Status:** Decided | Revisited | Superseded
**Decision:** What was decided
**Rationale:** Why
**Alternatives considered:** What else was on the table
**Trade-offs:** What we gave up
```

---

## Decisions

### [DECISION-001] SQLite for MVP database
**Date:** 2026-06-22
**Status:** Decided
**Decision:** Use SQLite as the database for the local MVP phase.
**Rationale:** Zero external dependencies, runs inside Docker with a single bind mount, no connection pooling or service config needed. For a personal local tool with one active user, SQLite is more than sufficient.
**Alternatives considered:** MariaDB from day one (already used in other projects on the stack).
**Trade-offs:** Must migrate to MariaDB for the Oracle production deployment. Drizzle abstracts this well — the migration is a driver swap and connection string change, not a schema rewrite.

---

### [DECISION-002] Ollama for MVP LLM inference
**Date:** 2026-06-22
**Status:** Decided
**Decision:** Use Ollama running on Omen (RTX 3060, Ubuntu) as the LLM provider for the AI ticket assistant.
**Rationale:** No data leaves the local network. No API keys required for MVP. Omen is already running Ollama and is accessible via LAN IP.
**Alternatives considered:** Anthropic API (Claude), OpenAI API.
**Trade-offs:** Inference quality is lower than cloud models. Omen must be on and reachable for AI features to work. Acceptable for a validation phase.

---

### [DECISION-003] OpenAI-compatible interface from day one
**Date:** 2026-06-22
**Status:** Decided
**Decision:** All LLM calls go through an OpenAI-compatible base URL + model config, not a provider-specific SDK.
**Rationale:** Ollama exposes an OpenAI-compatible API. This means swapping to a cloud BYOK provider later is a config change (base URL + API key), not a code change.
**Alternatives considered:** Anthropic SDK directly, Vercel AI SDK.
**Trade-offs:** Slightly less type-safe than a provider-specific SDK. Worth it for the portability.

---

### [DECISION-004] Docker-first deployment
**Date:** 2026-06-22
**Status:** Decided
**Decision:** Everything runs in Docker Compose from day one. No local bare-metal dev servers.
**Rationale:** Mirrors the eventual production deployment on Oracle A1 via Dokploy. Avoids "works on my machine" issues. Easier to hand off or replicate.
**Alternatives considered:** Running Bun and Vite directly on Silica during development.
**Trade-offs:** Slightly slower iteration loop during frontend development. Acceptable given the deployment fidelity benefit.

---

### [DECISION-005] Bun + Hono + React + Vite + Radix Themes
**Date:** 2026-06-22
**Status:** Decided
**Decision:** Use the standard personal stack for this project.
**Rationale:** No ramp-up time. Consistent with all other active projects. Radix Themes handles UI without Tailwind, which is a deliberate preference.
**Alternatives considered:** None — this is the default stack.
**Trade-offs:** None relevant.

---

### [DECISION-006] Boards as the primary grouping unit
**Date:** 2026-06-22
**Status:** Decided
**Decision:** Work is organized into boards, each with its own ordered columns. All boards share Backlog as the first column and Complete as the last. Middle columns are board-specific.
**Rationale:** Different types of work (development, content, customer email) have fundamentally different stages. A single column set would not represent any of them accurately. Sharing Backlog and Complete gives a consistent entry and exit point across all boards.
**Alternatives considered:** Single global column set with category tags on cards. Swim lane layout (rows by work type, shared columns). Both were discussed and rejected — the first loses stage specificity, the second forces a fixed stage model.
**Trade-offs:** Viewing work across all boards at once requires a separate aggregated view (the Todos view and Calendar view serve this purpose).

---

### [DECISION-007] Three user roles per card
**Date:** 2026-06-22
**Status:** Decided
**Decision:** Each card tracks three distinct user relationships: created_by, assigned_by, and assigned_to.
**Rationale:** These are three distinct real-world roles that may be held by different people. A card can be created by one person, delegated by a manager, and owned by a third person.
**Alternatives considered:** Just created_by and assigned_to (two roles).
**Trade-offs:** Slightly more complex card form. Worth it for accurate workflow representation.

---

### [DECISION-008] Milestone dates are per-column, not per-card
**Date:** 2026-06-22
**Status:** Decided
**Decision:** Milestone dates are stored as individual records tying a card to a specific column with a target date, rather than a single date field on the card.
**Rationale:** Each middle column on a board can have its own milestone. A blog post card might have a Draft milestone on Tuesday and an Editorialized milestone on Friday. This requires a one-to-many relationship between cards and milestone dates.
**Alternatives considered:** A JSON field on the card storing milestone dates. Rejected — unqueryable and not compatible with Drizzle's relational model.
**Trade-offs:** Slightly more complex queries when loading a card with all its milestones. Drizzle relations handle this cleanly.

---

### [DECISION-009] card_transitions as an immutable log
**Date:** 2026-06-22
**Status:** Decided
**Decision:** Every column move is recorded as a new row in card_transitions. Rows are never updated or deleted.
**Rationale:** This is the primary data source for Open Notebook sync analysis, velocity tracking, and eventual retrospectives. Mutating this log would destroy historical accuracy.
**Alternatives considered:** Storing only the current column on the card (no history). Rejected — eliminates all analytical value.
**Trade-offs:** Table grows indefinitely. Acceptable for a personal tool at this scale.

---

### [DECISION-010] Open Notebook sync is on-demand + nightly for MVP
**Date:** 2026-06-22
**Status:** Decided
**Decision:** Board data is pushed to Open Notebook via a manual "Sync Now" button and a nightly scheduled cron job. No event-driven sync in MVP.
**Rationale:** Event-driven sync (pushing every card transition in real time) adds significant complexity to the Hono backend and requires a queue or webhook pattern. For a personal tool being validated, nightly + on-demand is sufficient.
**Alternatives considered:** Event-driven sync on every card transition.
**Trade-offs:** Open Notebook data is at most 24 hours stale unless manually synced. Acceptable for analysis use cases.

---

### [DECISION-011] No auth in MVP
**Date:** 2026-06-22
**Status:** Decided
**Decision:** No authentication layer in the MVP. Users are seeded manually in the database. Current user is hardcoded in config.
**Rationale:** This is a personal local tool being validated for workflow fit. Auth adds significant scaffolding before the core value is proven.
**Alternatives considered:** Clerk from day one.
**Trade-offs:** Cannot be safely exposed to the internet without auth. Acceptable since MVP runs on the local LAN only.

---

### [DECISION-012] Local validation before Oracle promotion
**Date:** 2026-06-22
**Status:** Decided
**Decision:** Run the full app on dokbuntu via Docker Compose for 2-4 weeks of real workflow use before migrating to Oracle A1.
**Rationale:** Avoids investing in production infrastructure (Dokploy, Traefik, Cloudflare tunnel, MariaDB migration, Infisical) before knowing whether the core workflow is worth it.
**Alternatives considered:** Deploy to Oracle immediately.
**Trade-offs:** Delayed production availability. Acceptable given the personal nature of the tool.

---

### [DECISION-013] Project deployed on Silica during development, dokbuntu for local validation
**Date:** 2026-06-22
**Status:** Decided
**Decision:** Development happens on Silica (M1 Pro MacBook Pro, headless). Local validation runs on dokbuntu. Production target is Oracle A1 Flex.
**Rationale:** Silica is the primary dev machine. Dokbuntu runs Dokploy and is the closest analog to the Oracle environment. Oracle is the eventual permanent home.
**Alternatives considered:** Developing directly on dokbuntu.
**Trade-offs:** Requires pushing changes from Silica to dokbuntu for validation testing. Standard git workflow handles this.

---

### [DECISION-014] Open Notebook installed on Silica
**Date:** 2026-06-22
**Status:** Decided
**Decision:** Open Notebook is self-hosted via Docker Compose on Silica, using the official lfnovo/open_notebook image with SurrealDB.
**Rationale:** Silica is always on and accessible on the LAN. Keeping Open Notebook on Silica means it is available to both Jikanban during development and to Claude Desktop via the MCP server.
**Alternatives considered:** Running Open Notebook on dokbuntu or Oracle.
**Trade-offs:** Open Notebook availability depends on Silica being on and reachable.

---

### [DECISION-015] Flat single repo instead of Bun workspaces monorepo
**Date:** 2026-06-22
**Status:** Decided
**Decision:** Use a flat single repo with `api/` and `web/` directories. No Bun workspaces, no `packages/` layer.
**Rationale:** The only proposed shared package was `packages/db` (Drizzle schema + migrations), but the frontend never touches the DB directly — it consumes the API over HTTP. Type sharing between API and frontend is better handled via Hono's RPC type inference than via a shared package. Monorepo workspace machinery adds overhead with no concrete benefit at this scope.
**Alternatives considered:** Bun workspaces monorepo with `apps/api`, `apps/web`, `packages/db`.
**Trade-offs:** If genuine shared business logic emerges (validators, domain types used independently of the API interface), the structure will need revisiting. Unlikely at this scope.

---

### [DECISION-016] SQLite is the database — no MariaDB design constraint
**Date:** 2026-06-22
**Status:** Decided
**Decision:** Build against SQLite only. Remove the guiding principle of designing the schema and API for MariaDB compatibility from the start. A future MariaDB migration remains possible but is not a current design concern.
**Rationale:** The "designed for MariaDB from the start" principle creates ongoing mental overhead on every schema decision without delivering value until (if) a migration ever happens. Drizzle abstracts the differences well enough that the migration — when needed — is mechanical: driver swap, connection string change, `integer` booleans become `tinyint(1)`. There is no schema logic that needs to be written differently today to make that migration easier tomorrow.
**Alternatives considered:** Keeping MariaDB compatibility as an active design constraint (previous guiding principle in implementation plan).
**Trade-offs:** If an unexpected MariaDB-incompatible pattern is introduced, it will need to be untangled at migration time rather than caught early. Acceptable given the low likelihood and low cost of that fix.
