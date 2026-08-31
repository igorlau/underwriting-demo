# Underwriting Workspace

A clickable frontend prototype of a private credit underwriting workspace, built around the deal
team's workflow: **Deals → Securities → Due Diligence → IC Memo**.

Frontend only — all data is seeded and deterministic. No backend, database, auth, or LLM calls.

## Running it

Requires [pnpm](https://pnpm.io) 10+ and Node 24 (pinned in `.nvmrc`).

```bash
nvm use            # or: nvm install
pnpm install
pnpm dev           # http://localhost:5173
```

| Command          | What it does                           |
| ---------------- | -------------------------------------- |
| `pnpm dev`       | Start the Vite dev server on port 5173 |
| `pnpm build`     | Type-check and build for production    |
| `pnpm typecheck` | Type-check every workspace package     |
| `pnpm lint`      | Biome lint and format check            |
| `pnpm format`    | Apply Biome fixes                      |

## What to click

Open **ACME Inc.** from the pipeline, then move through Overview → Security → Due Diligence →
IC Memo and generate the memo. ACME is developed end to end; the other two deals carry pipeline
and overview data only.

## Structure

```
apps/web/          React + Vite + Tailwind + shadcn-style components
packages/types/    Shared domain contracts (@uw/types)
```

Components never import seed data — they go through `services/underwriting.ts`, which defines the
`UnderwritingService` interface and exports a single instance. Swapping the local mock for a real
backend (`apps/api`) is one assignment at the bottom of that file.
