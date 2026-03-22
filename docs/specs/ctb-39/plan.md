# CTB-39 Plan

## Context

`CTB-39` is a medium-risk runtime-foundation story because it establishes the local execution envelope that future API, worker, database, and runtime-state implementation stories must share.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus a reusable runtime-stack baseline that defines the planned Docker-local operating model without locking CTB into premature image or deployment details.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reusable local-runtime-stack baseline under `docs/architecture`
* small cross-document link updates so follow-on foundation stories can discover the runtime baseline

## Domain Boundaries

Affected domains:

* local Docker runtime composition
* service-to-dependency role definitions
* local-first development and validation expectations
* handoff boundaries into the database, config, and Redis foundation stories

Unaffected domains:

* executable Docker or Compose assets
* concrete Prisma schema or migration implementation
* queue implementation details
* hosted environment or production rollout design

## Contracts and Interfaces

Artifacts will define:

* the planned local CTB service and dependency stack
* the role of API and each worker process in the local runtime
* the persistence and transient-state responsibilities of Postgres and Redis
* the boundary between this story and the follow-on implementation-readiness stories

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* one exact Docker image layout or base image choice
* final `docker-compose` syntax or startup command details
* production infrastructure assumptions
* worker-specific internals that belong in later domain stories

## Risks

* If the runtime stack is vague, later services will adopt inconsistent local setup patterns.
* If this story chooses too many implementation details, follow-on runtime work will inherit brittle assumptions.
* If service roles are unclear, Postgres and Redis can become catch-all dependencies instead of bounded runtime components.

## Open Questions

* Exact Dockerfile, Compose, and bootstrap command details remain implementation work.
* The precise Prisma schema, Redis queue structure, and typed config contract are intentionally handed to `CTB-40` and `CTB-41`.

## Approvals

Recommended review focus:

* clarity of the local runtime service boundaries
* usefulness of the runtime baseline for downstream setup work
* consistency with the `CTB-38` workspace-target plan and the local-first CTB direction
