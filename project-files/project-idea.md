# Jikanban (JKB) — Project Idea

## Origin

The idea came from a concrete personal problem: as a solo developer working across multiple disciplines simultaneously — backend engineering, content creation, customer communication — it's easy to enter a hyperfocus state on one type of work and not notice that other areas have gone completely stale for days or weeks.

Generic kanban tools like Trello solve the "where is this task" problem but not the "am I working on the right things" problem. They have no awareness of project goals, no ability to help write tickets from context, and no way to analyze patterns in how you work.

The insight was that Open Notebook — an open-source, self-hosted alternative to Google NotebookLM — already stores project goals, research, and notes. If a kanban board could talk to that knowledge base bidirectionally, the two tools together would become something closer to a genuine project intelligence layer.

## The Vision

A task board that acts as a cognitive partner for your work — not just tracking what you're doing, but helping you decide what to do next, flagging when you're drifting from your goals, and building a historical record of how your projects actually progress over time.

Concretely, the long-term vision is:

- Open a new card, type a rough idea, and have the AI draft a proper ticket by querying your project goals notebook
- Ask Open Notebook "what patterns do I see in my completed development work?" and get an actual answer because the board has been syncing its history
- Get a weekly podcast-style retrospective (Open Notebook's podcast feature) summarizing what moved, what stalled, and what's overdue
- Have the Todos view serve as a daily briefing — your assigned cards, sorted by urgency, so every morning starts with clarity

## Why Open Notebook

Open Notebook was chosen over a cloud-based alternative (Notion AI, etc.) because:

- Self-hosted — all data stays local or on personal infrastructure
- Open source — can be extended and contributed to
- Has a REST API and MCP server — programmatically accessible
- Aligns philosophically with owning your own toolchain

A feature request has been submitted to the Open Notebook Discord for this kanban integration to eventually be built natively into Open Notebook itself.

## Post-MVP Roadmap

### Auth
- Clerk for multi-user auth once the workflow is validated locally
- Each user gets their own Todos view and card assignments

### BYOK LLM
- The AI ticket assistant is coded against an OpenAI-compatible interface from day one
- Swapping from Ollama to a cloud provider (Anthropic, OpenAI, etc.) is a config change, not a refactor
- Users supply their own API key

### Oracle A1 Deployment
- Move Docker Compose into Dokploy on Oracle A1 Flex VM
- Expose via Traefik + Cloudflare tunnel
- Swap SQLite for MariaDB, update Drizzle connection string
- Wire secrets through Infisical

### Richer Open Notebook Sync
- Event-driven sync in addition to nightly scheduled push
- Every card stage transition logged and synced in near-real time
- Open Notebook queries can drive board suggestions ("you have 3 blog posts stuck in Draft — want me to create a writing session ticket?")

### Notifications
- When a card is assigned to a user, notify them
- Telegram or SMS via the existing notify() abstraction pattern

### Todos View Enhancements
- Filter by board, priority, overdue
- Daily digest view

## Explicit MVP Descopes

These were discussed and deliberately left out of the first version:

- User auth (users seeded manually in DB)
- BYOK / cloud LLM providers
- Event-driven Open Notebook sync (on-demand + nightly only)
- Multi-board dashboards / cross-board analytics
- Card comments or file attachments
- Notifications
- Mobile view
