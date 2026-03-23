# CTB-74 Plan

## Context

`CTB-74` turns the Milestone 1 scaffold into something that can validate runtime-sensitive behavior instead of only checking importability and conventions.

The architecture baseline already commits CTB to transient Redis coordination, durable Postgres truth, and Testcontainers for runtime-sensitive integration tests.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* shared Testcontainers helpers in `@ctb/test-utils`
* simulator-worker Redis dedupe and queue reservation helpers
* one integration test that proves API startup, Postgres access, and Redis duplicate suppression
* local bootstrap and runtime seed scripts
* CI updates for the integration lane

## Domain Boundaries

Affected domains:

* runtime dependency provisioning
* transient Redis worker coordination
* local developer bootstrap commands
* CI validation coverage

Unaffected domains:

* business-domain queue semantics
* richer workflow orchestration or scheduling frameworks
* production deployment topology

## Contracts and Interfaces

Artifacts will define:

* one reusable runtime dependency harness that returns Postgres and Redis connection URLs
* one Redis reservation helper for simulator-worker dedupe and queue coordination
* one baseline seed command for `RuntimeHeartbeat`
* one integration lane for local and CI use

## Rollout Constraints

This issue should stay additive and should not:

* introduce durable workflow truth into Redis
* require always-on local infrastructure for non-integration validation
* expand the current Prisma baseline beyond what the integration harness needs

## Risks

* Docker may be unavailable on some local machines, so the integration lane should skip cleanly when the runtime is missing.
* Testcontainers startup time can slow CI, so the integration test should stay narrow and deterministic.
* Redis coordination helpers must remain clearly transient to avoid blurring the Postgres vs. Redis boundary.

## Open Questions

* Later worker stories will likely replace the simple queue payload with richer domain references.
* Additional integration fixtures may move into `@ctb/test-utils` as more runtimes gain executable behavior.

## Approvals

Recommended review focus:

* whether the Redis helper respects the documented transient-state boundary
* whether the integration lane is stable enough for CI
* whether bootstrap and seed commands are clear for a fresh clone
