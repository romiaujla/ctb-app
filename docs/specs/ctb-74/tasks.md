# CTB-74 Tasks

## Specify

- [x] Capture the runtime-harness, Redis coordination, and bootstrap requirements.
- [x] Identify the shared test-utils, simulator-worker, CI, and script artifacts required for the story.

## Plan

- [x] Define the Testcontainers harness boundary for Postgres and Redis.
- [x] Define the first simulator-worker dedupe and queue-reservation contract.
- [x] Keep durable queue semantics and wider workflow orchestration out of scope.

## Implement

- [x] Add shared Testcontainers-based Postgres and Redis helpers.
- [x] Add simulator-worker Redis reservation helpers and integration coverage.
- [x] Add bootstrap and runtime-seed scripts plus CI integration-lane execution.

## Validate

- [x] Run `pnpm install` after adding Redis and Testcontainers dependencies.
- [x] Run `pnpm validate`.
- [x] Run `pnpm test:integration`.
