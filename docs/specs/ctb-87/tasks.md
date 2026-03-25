# CTB-87 Tasks

## Specify

- [x] Capture issue-scoped runtime requirements for deterministic strategy evaluation and runtime integration.
- [x] Identify the reusable engine and runtime entrypoints needed for delivery.

## Plan

- [x] Define the strategy evaluation request, deterministic input builder, and rule-engine boundary.
- [x] Bound the issue to engine logic, API routes, worker hooks, and automated tests.
- [x] Record rollout constraints for later UI and reporting stories.

## Implement

- [x] Add a reusable strategy engine and deterministic evaluation service in `@ctb/simulator-core`.
- [x] Integrate recent-evaluation and on-demand strategy routes into the API workspace.
- [x] Add simulator-worker strategy helper integration that reuses the shared engine.
- [x] Add automated tests for deterministic rule behavior and API integration.

## Validate

- [x] Run repo validation and targeted integration coverage for the new strategy runtime paths.
- [x] Confirm branch, commit, and PR metadata follow the engineering constitution.
- [ ] Capture validation notes in the PR description when the PR is opened.
