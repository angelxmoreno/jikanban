# Jikanban (JKB)

A self-hosted, AI-assisted kanban board that integrates bidirectionally with [Open Notebook](https://www.open-notebook.ai/). It helps solo builders and small teams manage work across multiple disciplines — backend development, content creation, customer communication, research — without losing track of any one area while focused on another.

## Why

Solo developers and small teams tend to hyperfocus on one type of work (e.g. backend engineering) while other areas (content, customer emails, research) go stale for days or weeks. Generic kanban tools track *what* you're doing but have no awareness of your project goals or history. Jikanban connects the task board directly to your project knowledge base so that creating tickets, reviewing progress, and analyzing patterns are all informed by the context you've already captured.

## Key features

- **Multi-board support** — each board defines its own column stages for different types of work
- **Shared structure** — all boards enforce `Backlog` as the first column and `Complete` as the last
- **Milestone dates** — optional per-stage target dates, all before the card's due date
- **Activity tracking** — automatic timestamps for card start, completion, and every column transition
- **Calendar view** — cards plotted by due date with milestone markers and overdue indicators
- **Todos view** — every card assigned to the current user, sorted by due date
- **AI ticket assistant** — turns a rough idea into a fleshed-out card using Ollama + Open Notebook context
- **Open Notebook sync** — pushes board state, card history, and milestone data into Open Notebook for analysis and querying

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Backend | Hono |
| Frontend | React + Vite |
| UI | Radix UI + Radix Themes |
| ORM | Drizzle |
| Database (MVP) | SQLite |
| Database (production) | MariaDB |
| LLM (MVP) | Ollama |
| LLM (production) | BYOK (OpenAI-compatible interface) |
| Containerization | Docker + Docker Compose |

## Default boards

| Board | Columns |
|---|---|
| Development | Backlog → In Progress → PR Open → Complete |
| Blog Post | Backlog → Draft → Editorialized → Announced → Complete |
| Customer Email | Backlog → Replied → Waiting on Response → Complete |

## Status

In planning. Documentation complete; development starting. This repository is currently a scaffold — no application code yet.

## Documentation

Full product and architecture documentation lives in [`project-files/`](./project-files):

- [`overview.md`](./project-files/overview.md) — what it is, key features, tech stack, default boards
- [`project-brief.md`](./project-files/project-brief.md) — problem, solution, audience
- [`project-idea.md`](./project-files/project-idea.md) — origin, vision, post-MVP roadmap, explicit descopes
- [`implementation-plan.md`](./project-files/implementation-plan.md) — phased build plan (Phase 0 → Phase 9)
- [`schema.md`](./project-files/schema.md) — database schema, relationships, Open Notebook sync payload
- [`decisions-log.md`](./project-files/decisions-log.md) — ADR-style record of every significant decision

## Development

> Requires [Bun](https://bun.com).

```bash
bun install        # install dependencies (also installs git hooks via lefthook)
bun run index.ts  # run the current stub entrypoint
```

Quality checks:

```bash
bun check           # lint:fix + typecheck + dead-code + dupes + health
bun check:types     # tsc --noEmit
bun lint:fix        # biome check --write .
```

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/) — enforced by commitlint via a `commit-msg` git hook. Examples: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.

## Deployment

| Phase | Target |
|---|---|
| MVP | Local Docker Compose, Ollama on Omen via LAN |
| Production | Oracle A1 Flex VM via Dokploy + Traefik + Cloudflare tunnels |

See [`project-files/implementation-plan.md`](./project-files/implementation-plan.md) for the full phased plan.