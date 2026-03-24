# CTB-78 Tasks

## Specify

- [x] Capture the executable simulator-domain and persistence-contract requirements.
- [x] Identify the shared types, schemas, Prisma, and test artifacts required for the story.

## Plan

- [x] Define the canonical simulator entity and event contract surface.
- [x] Define the append-only fact versus derived-view persistence boundary.
- [x] Keep query-flow and deterministic replay implementation work scoped to later stories.

## Implement

- [x] Add canonical simulator entity and event types to `@ctb/types`.
- [x] Add matching Zod schemas and payload validation to `@ctb/schemas`.
- [x] Add `@ctb/simulator-core` persistence helpers plus the baseline Prisma models and migration.
- [x] Add automated tests for contract parsing and persistence-boundary assumptions.

## Validate

- [x] Run `pnpm typecheck`.
- [x] Run `pnpm test`.
- [x] Run `pnpm prisma validate`.
