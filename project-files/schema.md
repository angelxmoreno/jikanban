# Jikanban (JKB) — Database Schema

## Overview

MVP uses SQLite via Drizzle ORM. All tables use `text` primary keys (nanoid/cuid). Timestamps are stored as ISO 8601 strings. The schema is designed to migrate cleanly to MariaDB for the Oracle production deployment.

---

## Tables

### workspaces

Top-level grouping. A workspace represents a project or organizational boundary. Boards, settings, and AI configuration live inside a workspace.

| Column | Type | Notes |
|---|---|---|
| id | text | Primary key |
| name | text | e.g. "Jikanban" |
| slug | text | URL-friendly identifier |
| created_by | text | FK → users.id |
| settings | text | JSON blob — see **Workspace settings** below |
| created_at | text | ISO 8601 |
| updated_at | text | ISO 8601 |

**Workspace settings** (stored as JSON on `settings`):

| Field | Type | Notes |
|---|---|---|
| ollama_base_url | string | OpenAI-compatible endpoint for this workspace |
| ollama_model | string | e.g. "qwen3:8b" |
| open_notebook_base_url | string | Open Notebook instance URL |
| open_notebook_notebook | string | Notebook ID/name to sync into |

Settings are workspace-scoped so different projects can point at different models or notebooks.

---

### users

Manually seeded in MVP. No auth layer yet.

| Column | Type | Notes |
|---|---|---|
| id | text | Primary key |
| name | text | Display name |
| email | text | Unique |
| created_at | text | ISO 8601 |

---

### boards

Each board represents a type of work (e.g. Development, Blog Post). Boards live inside a workspace.

| Column | Type | Notes |
|---|---|---|
| id | text | Primary key |
| workspace_id | text | FK → workspaces.id |
| name | text | e.g. "Development" |
| description | text | Optional |
| created_by | text | FK → users.id |
| created_at | text | ISO 8601 |
| updated_at | text | ISO 8601 |

---

### columns

Each board has an ordered list of columns. Backlog and Complete are flagged as special — they are always the first and last columns respectively.

| Column | Type | Notes |
|---|---|---|
| id | text | Primary key |
| board_id | text | FK → boards.id |
| name | text | e.g. "PR Open", "Draft" |
| position | integer | Ordered position within the board |
| is_backlog | integer | Boolean flag (0/1). Only one per board |
| is_complete | integer | Boolean flag (0/1). Only one per board |
| created_at | text | ISO 8601 |

---

### cards

The core unit of work.

| Column | Type | Notes |
|---|---|---|
| id | text | Primary key |
| board_id | text | FK → boards.id |
| column_id | text | FK → columns.id — current column |
| title | text | |
| description | text | Optional |
| priority | text | enum: low, medium, high |
| due_date | text | ISO 8601 date — when card must reach Complete |
| created_by | text | FK → users.id |
| assigned_by | text | FK → users.id — nullable |
| assigned_to | text | FK → users.id — nullable |
| work_started_at | text | Stamped when card leaves Backlog. Nullable |
| completed_at | text | Stamped when card enters Complete. Nullable |
| created_at | text | ISO 8601 |
| updated_at | text | ISO 8601 |

---

### card_milestones

Optional per-stage target dates for a card. Each row ties a card to a column with a target date.

| Column | Type | Notes |
|---|---|---|
| id | text | Primary key |
| card_id | text | FK → cards.id |
| column_id | text | FK → columns.id — the target column |
| target_date | text | ISO 8601 date — must be before card.due_date |
| created_at | text | ISO 8601 |

**Constraints:**
- `target_date` must be before the parent card's `due_date`
- Milestone dates across a card's columns must be in chronological order matching column position
- A card cannot have a milestone for its Backlog or Complete columns (those are tracked separately)

---

### card_transitions

Immutable log of every column change a card goes through. Never updated or deleted.

| Column | Type | Notes |
|---|---|---|
| id | text | Primary key |
| card_id | text | FK → cards.id |
| from_column_id | text | FK → columns.id — nullable (null on first move out of Backlog) |
| to_column_id | text | FK → columns.id |
| transitioned_by | text | FK → users.id |
| transitioned_at | text | ISO 8601 |

---

## Relationships

```
users
  └── workspaces (created_by)
  └── boards (created_by)
  └── cards (created_by, assigned_by, assigned_to)
  └── card_transitions (transitioned_by)

workspaces
  └── boards (workspace_id)

boards
  └── columns (board_id)
  └── cards (board_id)

columns
  └── cards (column_id — current column)
  └── card_milestones (column_id)
  └── card_transitions (from_column_id, to_column_id)

cards
  └── card_milestones (card_id)
  └── card_transitions (card_id)
```

---

## Open Notebook Sync Payload

When syncing to Open Notebook, the following is serialized per board and POSTed as a source document:

- Board name and description
- All columns in order
- All cards with: title, description, priority, due date, current column, assigned user
- All milestone dates per card
- All card transitions (full history)
- Overdue cards (due date passed, not in Complete)
- Missed milestones (target date passed, card not yet in that column)

---

## Notes

- Drizzle relations will be defined for all FK relationships
- SQLite does not enforce FK constraints by default — `PRAGMA foreign_keys = ON` must be set on connection
- On migration to MariaDB, `text` PKs remain valid; `integer` booleans become `tinyint(1)`
