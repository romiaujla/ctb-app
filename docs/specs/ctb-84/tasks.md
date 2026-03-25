# CTB-84 Tasks

## Specify

- [x] Capture the executable market-data contract and ingestion-service requirements.
- [x] Identify the shared contract, schema, runtime, and test artifacts required for the story.

## Plan

- [x] Define the canonical shared event and normalization-input contract surface.
- [x] Define freshness and duplicate-handling behavior that can run on the shared contract.
- [x] Keep operator-surface work deferred to the follow-on UI issue.

## Implement

- [x] Add shared market-data types to `@ctb/types`.
- [x] Add matching market-data schemas to `@ctb/schemas`.
- [x] Add normalization, freshness, idempotency, and ingestion helpers to `@ctb/market-data`.
- [x] Add simulator-worker helpers and unit coverage for the ingestion path.

## Validate

- [x] Run `pnpm validate`.
- [x] Run `POSTGRES_URL='postgresql://ctb:ctb@localhost:5432/ctb_app' pnpm prisma validate`.
