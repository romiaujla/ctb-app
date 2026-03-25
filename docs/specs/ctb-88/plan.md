# CTB-88 Plan

## Context

`CTB-88` is the final operator-facing implementation slice for the CTB strategy engine chain and depends on the new API/runtime evidence delivered by `CTB-87`.

## Decision

Deliver the story as:

* one strategy operator view model in the web workspace
* one API-loading helper for recent strategy evaluations
* one scaffold update that renders strategy status and explainability text with clear labels
* automated tests for emitted, skipped, blocked, and no-evidence strategy states

## Domain Boundaries

Affected domains:

* web-facing operator strategy view models
* API consumption for strategy evidence
* scaffold rendering of strategy status

Unaffected domains:

* strategy persistence
* strategy rule execution
* reporting layouts outside the current web scaffold

## Contracts and Interfaces

Artifacts will define:

* a strategy operator view model for recent evaluation summaries
* API-backed loading helpers for recent strategy evidence
* scaffold rendering output for strategy status and reasons

## Rollout Constraints

This issue must stay operator-facing and must not lock in:

* a framework migration beyond the current workspace
* report-generation workflows
* backend behavior changes to the strategy engine

## Risks

* Weak labeling would make blocked and skipped outcomes hard to understand.
* UI code that bypasses the API would break the intended control-plane boundary.
* Missing empty-state handling would weaken operator trust in the dashboard.

## Open Questions

* Later UI delivery may upgrade the visual shell while preserving this operator-facing information model.
* Future report links can be added without changing the strategy summary contract.

## Approvals

Recommended review focus:

* clarity of operator-facing strategy status
* correctness of API-backed data loading
* visible text treatment for blocked and skipped states
