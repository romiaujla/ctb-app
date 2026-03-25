# CTB-82 Tasks

## Specify

- [x] Capture the DB-layer market-data persistence problem, scope, and success criteria.
- [x] Identify the repository, Prisma, and test artifacts required for the story.

## Plan

- [x] Define the durable record set for ingest runs, raw records, canonical events, and ingest decisions.
- [x] Define the repository query surface needed for replay-style retrieval and ingest diagnostics.
- [x] Keep normalization logic, worker orchestration, and UI scope deferred to later issues.

## Implement

- [x] Add the `@ctb/market-data` package with persistence inputs, repository code, and exports.
- [x] Add the Prisma models and migration for replay-ready market-data persistence.
- [x] Add automated integration coverage for persistence and retrieval semantics.

## Validate

- [x] Run `pnpm typecheck`.
- [x] Run `pnpm test`.
- [ ] Run `pnpm test:integration`.
- [x] Run `pnpm prisma validate`.
