# CTB-80 Plan

## Context

`CTB-80` closes the Milestone 2 simulator chain by proving the persisted model from `CTB-79` is replay-safe and correctness-oriented rather than only durable.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* replay-state and verification contracts in shared types and schemas
* one deterministic replay helper in `@ctb/simulator-core`
* unit tests for deterministic replay outputs and drift detection
* integration assertions that replay matches the persisted simulator repository

## Domain Boundaries

Affected domains:

* deterministic simulator replay
* correctness-oriented accounting verification
* replay-driven validation against persisted portfolio views

Unaffected domains:

* new simulator persistence repositories or schema ownership changes
* market-data, API, UI, reporting, or notification behavior
* non-test observability workflows

## Contracts and Interfaces

Artifacts will define:

* one replayable simulator-state input contract
* one deterministic replay result contract with a stable digest
* one verification helper that compares replay output to current views and snapshots

## Rollout Constraints

This issue should stay focused on replay and correctness evidence and should not:

* re-implement repository storage behavior already handled by `CTB-79`
* widen into production operational workflows
* hide drift behind permissive fallback behavior

## Risks

* If replay ordering is underspecified, the same event stream may produce unstable results.
* If replay ignores persisted snapshots or fills, drift can remain invisible until later stories.
* If correctness tests allow silent mismatch, Milestone 2 trust claims will be weak.

## Open Questions

* Later strategy or market-data stories may expand the replay fixture surface beyond these canonical simulator records.
* More granular replay diagnostics may be added later if debugging needs a richer trace format.

## Approvals

Recommended review focus:

* determinism of the replay ordering and digest
* usefulness of the drift-detection failures
* alignment between replay verification and the persisted simulator repository
