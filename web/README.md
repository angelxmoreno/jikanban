# Jikanban — web

React + Vite + Radix Themes frontend for Jikanban.

Part of the flat single repo (no workspaces). This package owns its own `package.json`. Root tooling (Biome, lefthook, fallow) covers this directory.

## Develop

```bash
cd web
bun install
bun dev
```

Dev server runs on http://localhost:5173.

## Typecheck

Root `bun check:types` typechecks both the root project and this one via `tsc -b web/tsconfig.json`. To typecheck only this package:

```bash
cd web
tsc -b
```

## Status

Phase 0 scaffold. App shell renders a placeholder via Radix Themes. Dummy data and board views land in Phase 1 — see `../project-files/implementation-plan.md`.