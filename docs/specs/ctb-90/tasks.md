# CTB-90 Tasks

## Specify

- [x] Confirm the remaining API runtime gaps from `CTB-51` and `CTB-53`.
- [x] Identify the shared response contracts needed by downstream UI work.

## Plan

- [x] Define the overview, simulator, strategy, report, and notification summary payloads.
- [x] Define the `/docs` and OpenAPI runtime surface for the current contract.
- [x] Keep the story scoped to API completion without widening into UI implementation.

## Implement

- [x] Add shared control-plane contracts in `packages/types` and `packages/schemas`.
- [x] Extend `apps/api/src/index.ts` with the new overview, status, simulator, strategy, report, notification, and docs routes.
- [x] Add or update automated tests for the new API behavior and `/docs`.

## Validate

- [x] Run targeted tests for the API control-plane surface.
- [x] Run repo validation appropriate to the changed files.
- [ ] Capture validation notes in the PR description when the PR is opened.
