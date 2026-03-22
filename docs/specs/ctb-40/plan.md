# CTB-40 Plan

## Context

`CTB-40` is a medium-risk runtime-foundation story because it defines the shared persistence and typed configuration contract that later CTB services, workers, and tests must reuse.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus a reusable data-and-config baseline that extends the local runtime envelope without prematurely implementing schemas or config-loading code.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reusable local data-and-config baseline under `docs/architecture`
* small cross-document link updates so downstream runtime work can discover the canonical baseline

## Domain Boundaries

Affected domains:

* local Postgres direction
* Prisma and migration planning
* typed runtime configuration validation
* shared persistence and config boundaries for API and worker services

Unaffected domains:

* executable Prisma setup or migrations
* concrete domain-table design
* Redis queue and dedupe policy
* production deployment or secret-management implementation

## Contracts and Interfaces

Artifacts will define:

* the canonical local Postgres database direction for CTB
* Prisma's role in schema ownership and migration workflow
* the typed runtime-config validation contract for shared CTB services
* the handoff boundary between this story and the Redis/testcontainers planning work in `CTB-41`

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* final schema shape for simulator, reporting, or notification domains
* one exact migration command surface or CLI wrapper
* production database-hosting choices
* secrets-management implementation details outside the shared config contract

## Risks

* If the database direction is vague, later services will create inconsistent local persistence assumptions.
* If Prisma and migrations are underspecified, implementation work may fork into incompatible schema workflows.
* If typed configuration boundaries are unclear, services may drift into ad hoc environment parsing and hidden runtime defaults.

## Open Questions

* Exact model definitions will be refined by later domain stories.
* Final bootstrap scripts, `.env` ergonomics, and runtime secret delivery mechanics remain implementation work.

## Approvals

Recommended review focus:

* clarity of the Postgres and Prisma baseline for local CTB work
* usefulness of the typed config contract across API and worker services
* consistency with the `CTB-39` runtime envelope and the `CTB-38` workspace plan
