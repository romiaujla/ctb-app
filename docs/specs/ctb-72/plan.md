# CTB-72 Plan

## Context

`CTB-72` is a medium-risk runtime story because it introduces the first shared local boot path for the CTB stack and establishes the operational envelope that later persistence and integration stories will depend on.

The app and package workspaces already exist, so this issue should focus on Docker-local boot behavior and service wiring rather than deeper domain logic.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* Dockerfiles for the API and simulator-worker workspaces
* one Compose stack for API, simulator worker, Postgres, and Redis
* root scripts and README guidance for fresh-clone local boot

## Domain Boundaries

Affected domains:

* Docker-local runtime assets
* startup commands and local service wiring
* placeholder dependency URLs for the API and simulator worker
* health and troubleshooting feedback for the local stack

Unaffected domains:

* Prisma schema and migrations
* typed environment validation
* Redis-backed job coordination or integration tests

## Contracts and Interfaces

Artifacts will define:

* the local stack composition for API, simulator-worker, Postgres, and Redis
* the runtime environment variables the placeholder services read today
* the health and dependency checks contributors can use to confirm the stack booted

## Rollout Constraints

This issue must stay focused on local runtime setup and must not pre-implement:

* Prisma-backed database bootstrapping from `CTB-73`
* Redis-backed runtime flows and integration harnesses from `CTB-74`

## Risks

* If the Dockerfiles diverge from workspace reality, local boot will drift from the monorepo graph.
* If health feedback is weak, local troubleshooting will remain trial-and-error.
* If dependency URLs are implicit, later config validation work will have to unwind ad hoc runtime assumptions.

## Open Questions

* Later issues may split more services into the Compose stack as executable behavior expands.
* Docker image optimization can wait until the runtime contract is stable.

## Approvals

Recommended review focus:

* correctness of the Compose stack and Dockerfiles
* clarity of the startup and health workflow for a fresh clone
* alignment between local runtime wiring and the planned CTB service boundaries
