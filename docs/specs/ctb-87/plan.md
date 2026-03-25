# CTB-87 Plan

## Context

`CTB-87` is the runtime implementation slice that turns the CTB-48 through CTB-50 planning chain into executable strategy behavior using the CTB-34 hypothesis baseline.

## Decision

Deliver the story as:

* one reusable strategy engine implementation in `@ctb/simulator-core`
* one deterministic input builder that combines market history and simulator truth
* API endpoints for recent strategy evidence and on-demand strategy evaluation
* simulator-worker helper integration that reuses the same engine
* automated tests for deterministic outcomes and runtime visibility

## Domain Boundaries

Affected domains:

* strategy runtime evaluation
* API integration
* simulator-worker runtime integration

Unaffected domains:

* operator UI rendering
* report generation
* live order routing

## Contracts and Interfaces

Artifacts will define:

* a strategy evaluation request for runtime execution
* a deterministic rule engine that returns canonical evaluation records
* API routes for recent evaluations and on-demand evaluation
* worker-facing helper functions that reuse the same runtime service

## Rollout Constraints

This issue must stay runtime-scoped and must not lock in:

* multi-strategy orchestration
* advanced parameter tuning workflows
* final UI presentation details

## Risks

* Hidden coupling to provider payloads would violate the CTB-48 boundary.
* Guardrails implemented as silent fall-through would weaken explainability.
* Duplicated rule logic across API and worker code would create drift.

## Open Questions

* Additional signal complexity can be layered later without breaking the runtime boundary.
* Future action endpoints may build on this API surface without widening the current issue scope.

## Approvals

Recommended review focus:

* deterministic strategy behavior
* boundary reuse across API and worker entrypoints
* completeness of explicit blocked and skipped outcomes
