# CTB-79 Tasks

## Specify

- [x] Capture the persisted simulator-accounting and query requirements.
- [x] Identify the repository, Prisma, and integration-test artifacts required for the story.

## Plan

- [x] Define the current and historical simulator query contracts.
- [x] Define the consistency rules between append-only facts and derived views.
- [x] Keep deterministic replay and presentation-layer work scoped to later stories.

## Implement

- [x] Add the simulator accounting repository contracts to `@ctb/types`.
- [x] Add the Prisma-backed repository implementation to `@ctb/simulator-core`.
- [x] Add query-integrity schema constraints and automated integration coverage.

## Validate

- [x] Run `pnpm validate`.
- [x] Run `pnpm test:integration`.
- [x] Run `POSTGRES_URL='postgresql://ctb:ctb@localhost:5432/ctb_app' pnpm prisma validate`.
