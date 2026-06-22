# CLAUDE.md

Guidance for Claude Code working in this repository. Read this first.

## Project

Jikanban (JKB) is a self-hosted, AI-assisted kanban board that integrates bidirectionally with [Open Notebook](https://www.open-notebook.ai/). It helps solo builders and small teams manage work across multiple disciplines (backend, content, customer communication, research) without letting any one area go stale.

**Status:** In planning. Documentation complete. Development starting. Repo is currently a `bun init` stub — no application code yet.

The full project documentation lives in `project-files/`:

- `overview.md` — what it is, key features, tech stack, default boards
- `project-brief.md` — problem, solution, audience
- `project-idea.md` — origin, vision, post-MVP roadmap, explicit descopes
- `implementation-plan.md` — phased build plan (Phase 0 → Phase 9)
- `schema.md` — database schema, relationships, Open Notebook sync payload
- `decisions-log.md` — ADR-style record of every significant decision (DECISION-001 → DECISION-016)

Treat `project-files/` as the source of truth for product and architecture. Update the relevant doc when a decision changes — do not let them drift from the code.

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Backend | Hono |
| Frontend | React + Vite |
| UI | Radix UI + Radix Themes (no Tailwind — deliberate preference) |
| ORM | Drizzle |
| Database (MVP) | SQLite |
| Database (production) | MariaDB |
| LLM (MVP) | Ollama (on Omen, RTX 3060, via LAN IP) |
| LLM (production) | BYOK, OpenAI-compatible interface |
| Containerization | Docker + Docker Compose |

## Repo layout (target)

Flat single repo — **not** a Bun workspaces monorepo (see DECISION-015). Shared business logic lives in the API; the frontend consumes it over HTTP and shares types via Hono RPC type inference, not a shared package.

```
api/   — Bun + Hono backend (owns Drizzle schema + migrations)
web/   — React + Vite frontend
project-files/   — product + architecture docs (source of truth)
```

These directories do not exist yet. Phase 0 creates them.

## Commands

```bash
bun install                # install deps (runs `lefthook install` via prepare)
bun run index.ts           # run the current stub entrypoint
bun lint                   # turbo run lint  (turbo.json not yet present)
bun lint:fix              # biome check --write .
bun check                 # lint:fix + check:types + dead-code + dupes + health
bun check:types           # tsc --noEmit
bun check:dead-code       # fallow dead-code
bun check:dupes           # fallow dupes
bun check:health          # fallow health
bun check:audit           # fallow audit
```

Lefthook runs on pre-commit: `lint`, `check:types`, `check:dead-code`, `check:dupes`, `check:health` (all skipped on merge/rebase). On commit-msg: `commitlint`.

## Code style (Biome)

Enforced via `biome.json` and the pre-commit hook:

- Indent: 4 spaces
- Line width: 120
- Quotes: single
- Trailing commas: es5
- Semicolons: always
- `noUnusedVariables`: error
- Imports auto-organized by Biome assist

## Commits

Conventional Commits only — enforced by `@commitlint/config-conventional` via `lefthook.yml` commit-msg hook. Examples: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`. Non-conventional messages are rejected.

## Key architectural decisions

Read `project-files/decisions-log.md` for full rationale. Short version:

- **SQLite for MVP** (DECISION-001). Build against SQLite only — do **not** design for MariaDB from the start (DECISION-016 reversed that earlier principle). Migration later is a mechanical Drizzle driver swap.
- **Ollama for MVP LLM** (DECISION-002), behind an **OpenAI-compatible interface from day one** (DECISION-003). Swapping to a cloud BYOK provider later is a config change, not a refactor.
- **Docker-first** (DECISION-004) — everything runs in Docker Compose from day one; no bare-metal dev servers.
- **Boards are the primary grouping unit** (DECISION-006). All boards share `Backlog` (first) and `Complete` (last); middle columns are board-specific.
- **Three user roles per card**: `created_by`, `assigned_by`, `assigned_to` (DECISION-007).
- **Milestones are per-column, not per-card** (DECISION-008) — a `card_milestones` table ties a card to a column + target date.
- **`card_transitions` is an immutable log** (DECISION-009) — append-only, never update or delete a row.
- **Open Notebook sync is on-demand + nightly** for MVP (DECISION-010), not event-driven.
- **No auth in MVP** (DECISION-011) — users seeded manually, current user hardcoded in config.
- **Local validation on dokbuntu before Oracle promotion** (DECISION-012). Dev on Silica; production target is Oracle A1 Flex via Dokploy + Traefik + Cloudflare tunnel.

## Working in this repo

- Before making a non-trivial decision, check `project-files/decisions-log.md` — it may already be decided.
- When a decision is made or revisited, append a `DECISION-NNN` entry to `decisions-log.md` following the format at the top of that file.
- When adding a dependency, prefer the stack already in use (Hono, Drizzle, Radix Themes, Ollama-compatible HTTP). Justify anything new.
- Schema changes go in `api/src/db/schema` (once it exists) and must keep `PRAGMA foreign_keys = ON` for SQLite.
- Do not add Tailwind. Use Radix Themes.
- Do not introduce Bun workspaces / a `packages/` layer.