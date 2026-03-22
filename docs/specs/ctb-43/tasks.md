# CTB-43 Tasks

## Specify

- [x] Capture issue-scoped simulator accounting and event-history requirements.
- [x] Identify the primary implementation artifact for the story.

## Plan

- [x] Define the account, ledger, order, fill, position, and snapshot responsibilities.
- [x] Record how event history and derived portfolio state must relate.
- [x] Identify the minimal repository link updates needed so downstream simulator work can discover `CTB-43`.

## Implement

- [x] Create `docs/architecture/ctb-simulator-accounting-and-event-history-model.md` as the reusable baseline for `CTB-43`.
- [x] Update small cross-document references so downstream simulator stories can discover the accounting baseline.
- [x] Keep the deliverable scoped to `CTB-43` without folding in `CTB-44` replay-safety policy.

## Validate

- [ ] Review the accounting baseline for Jira acceptance-criteria alignment.
- [ ] Confirm branch, commit, and PR metadata follow the engineering constitution.
- [ ] Capture validation notes in the PR description when the PR is opened.
