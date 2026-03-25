# CTB-86 Tasks

## Specify

- [x] Capture issue-scoped persistence requirements for strategy evaluations and emitted trade intents.
- [x] Identify the production files and repository boundary required for delivery.

## Plan

- [x] Define the canonical persistence records for strategy evaluations, explainability evidence, and emitted trade intents.
- [x] Bound the issue to Prisma, shared contracts, repository support, and automated tests.
- [x] Record the rollout constraints for later API and UI stories.

## Implement

- [x] Add Prisma schema and migration support for strategy evaluation persistence.
- [x] Add shared TypeScript and Zod contracts for strategy evidence records.
- [x] Implement a Prisma-backed strategy evidence repository in `@ctb/simulator-core`.
- [x] Add schema and integration tests for decision-state storage and trade-intent linkage.

## Validate

- [x] Run targeted validation for strategy contracts and repository persistence.
- [x] Confirm branch, commit, and PR metadata follow the engineering constitution.
- [ ] Capture validation notes in the PR description when the PR is opened.
