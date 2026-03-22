# CTB-41 Plan

## Context

`CTB-41` is a medium-risk runtime-foundation story because it completes the local runtime chain by defining transient-state rules and the integration-test harness direction for runtime dependencies.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus a reusable runtime-state policy baseline that extends the existing runtime and data foundations without prematurely implementing queues or tests.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reusable runtime-state and integration-test policy baseline under `docs/architecture`
* small cross-document link updates so downstream runtime and test work can discover the completed foundation chain

## Domain Boundaries

Affected domains:

* Redis usage policy
* queue, cache, retry, and dedupe planning boundaries
* integration-test harness direction for Postgres and Redis dependencies
* local runtime-state ownership rules for API and worker services

Unaffected domains:

* executable Redis client or queue implementation
* concrete integration-test code
* observability or deployment rollout mechanics
* durable domain-schema design

## Contracts and Interfaces

Artifacts will define:

* what Redis may own in CTB and what it must not own
* how queue, retry, dedupe, and cache responsibilities should be bounded
* why testcontainers is the preferred integration-test harness direction
* the handoff boundary from the runtime-foundation chain into later implementation issues

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* one exact queue library or transport implementation
* one final cache key scheme or retry algorithm
* one exact test helper API or test runner integration
* production infrastructure assumptions for Redis or test execution

## Risks

* If Redis boundaries are vague, later services may persist durable business truth in transient stores.
* If queue and dedupe concerns are underspecified, worker implementations may blur cache, retry, and orchestration responsibilities.
* If the integration-test harness direction is unclear, runtime-dependent tests may fragment across incompatible local setups.

## Open Questions

* Exact queue mechanics and retry strategies will be refined in later worker implementation work.
* Final test helper ergonomics and fixture composition remain implementation details for future test setup.

## Approvals

Recommended review focus:

* clarity of what Redis should and should not own
* usefulness of the queue, retry, cache, and dedupe boundaries for future runtime work
* consistency with the `CTB-39` runtime envelope and `CTB-40` data-and-config baseline
