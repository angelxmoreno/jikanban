# Jikanban (JKB) — Project Overview

## What It Is

Jikanban is a self-hosted, AI-assisted kanban board that integrates bidirectionally with [Open Notebook](https://www.open-notebook.ai/). It helps solo builders and small teams manage work across multiple disciplines — backend development, content creation, customer communication, research — without losing track of any one area while focused on another.

## The Problem It Solves

Solo developers and small teams tend to hyperfocus on one type of work (e.g. backend engineering) while neglecting others (content, customer emails, research). Generic kanban tools have no awareness of your project goals or history. This app connects your task board directly to your project knowledge base so that creating tickets, reviewing progress, and analyzing patterns are all informed by the context you've already captured.

## Key Features

- **Multi-board support** — each board defines its own column stages for different types of work
- **Shared structure** — all boards enforce Backlog as the first column and Complete as the last
- **Milestone dates** — optional per-stage target dates, all before the card's due date
- **Activity tracking** — automatic timestamps for when a card starts, completes, and every column transition in between
- **Calendar view** — cards plotted by due date with milestone markers and overdue indicators
- **Todos view** — every card assigned to the current user, sorted by due date
- **AI ticket assistant** — turns a rough idea into a fleshed-out card using Ollama + Open Notebook context
- **Open Notebook sync** — pushes board state, card history, and milestone data into Open Notebook for analysis and querying

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Backend framework | Hono |
| Frontend | React + Vite |
| UI components | Radix UI + Radix Themes |
| ORM | Drizzle |
| Database (MVP) | SQLite |
| Database (production) | MariaDB |
| LLM (MVP) | Ollama |
| LLM (production) | BYOK (OpenAI-compatible interface) |
| Containerization | Docker + Docker Compose |

## Integrations

- **Ollama** — local LLM inference for AI ticket assistant. Runs on Omen (RTX 3060) and is accessed via LAN IP
- **Open Notebook** — bidirectional integration. Notebook context is pulled into the AI assistant; board state and history are pushed back for analysis

## Deployment

| Phase | Target |
|---|---|
| MVP | Local Docker Compose, Ollama on Omen via LAN |
| Production | Oracle A1 Flex VM via Dokploy + Traefik + Cloudflare tunnels |

## Default Boards

| Board | Columns |
|---|---|
| Development | Backlog → In Progress → PR Open → Complete |
| Blog Post | Backlog → Draft → Editorialized → Announced → Complete |
| Customer Email | Backlog → Replied → Waiting on Response → Complete |
