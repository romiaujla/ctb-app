# CTB-80 Tasks

## Specify

- [x] Capture the deterministic replay and correctness-coverage requirements.
- [x] Identify the shared replay, schema, and test artifacts required for the story.

## Plan

- [x] Define the replay input, output, and verification contracts.
- [x] Define the deterministic ordering and drift-detection rules.
- [x] Keep non-test presentation and operational work out of scope.

## Implement

- [x] Add replay contracts to `@ctb/types` and `@ctb/schemas`.
- [x] Add deterministic replay and verification helpers to `@ctb/simulator-core`.
- [x] Add unit and integration coverage for replay determinism and correctness failures.

## Validate

- [x] Run `pnpm validate`.
- [x] Run `pnpm test:integration`.
- [x] Run `POSTGRES_URL='postgresql://ctb:ctb@localhost:5432/ctb_app' pnpm prisma validate`.
