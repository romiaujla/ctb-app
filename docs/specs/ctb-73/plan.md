# CTB-73 Plan

## Context

`CTB-73` is a high-signal foundation story because it defines the first durable database contract and the shared runtime config loader that later application behavior will rely on.

The Docker-local stack is already in place, so this issue should focus on schema, migration, and config validation rather than queue or test-harness concerns.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* Prisma schema and tracked migration assets
* shared Zod-backed runtime config loading in `@ctb/config`
* service updates that consume the shared config loader
* root commands for Prisma generation and migration application

## Domain Boundaries

Affected domains:

* runtime env parsing
* Prisma schema and migration assets
* service startup config loading
* local database initialization workflow

Unaffected domains:

* Redis-backed queue coordination
* integration-test harnesses
* seed data and full bootstrap automation

## Contracts and Interfaces

Artifacts will define:

* the shared runtime env shape used by services
* the initial Postgres-backed Prisma model set
* the root workflow commands for generating and applying the database baseline

## Rollout Constraints

This issue must stay focused on config validation and persistence setup and must not pre-implement:

* Redis runtime-flow mechanics from `CTB-74`
* deeper domain-specific database models beyond the baseline runtime heartbeat record

## Risks

* If env validation is inconsistent, service behavior may diverge between local and containerized startup.
* If the Prisma schema is too broad, later issues may need noisy foundational migration rewrites.
* If migration commands are unclear, fresh-clone setup will still be fragile.

## Open Questions

* Later stories will likely add more domain tables as executable behavior expands.
* Config loading may gain service-specific overrides once more runtimes exist.

## Approvals

Recommended review focus:

* correctness of the runtime env schema
* clarity and minimalism of the Prisma baseline
* usefulness of the documented migration workflow for a fresh clone
