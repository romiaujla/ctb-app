# CTB-69 Plan

## Context

`CTB-69` is a medium-risk repository bootstrap story because it establishes the executable monorepo shape that every later Milestone 1 implementation ticket will build on.

The repo is moving from docs-only planning toward runnable code, so the implementation for this issue is an issue-scoped Spec Kit plus the initial workspace scaffold itself.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* root workspace wiring with pnpm and shared TypeScript configuration
* initial application workspace manifests and TypeScript entrypoints
* placeholder package, infra, and scripts locations that lock in the approved monorepo shape

## Domain Boundaries

Affected domains:

* repository root workspace wiring
* application workspace scaffolding
* shared package location reservation
* bootstrap install ergonomics

Unaffected domains:

* repository linting, formatting, and CI automation
* runtime infrastructure and local Docker boot
* Prisma schema, migrations, and typed config loaders
* Redis-backed runtime coordination and integration tests

## Contracts and Interfaces

Artifacts will define:

* a root workspace manifest and package-manager contract
* baseline TypeScript configuration shared by scaffolded workspaces
* the initial `apps/*` workspace entrypoints
* reserved `packages/*`, `infra`, and `scripts` locations for later implementation stories

## Rollout Constraints

This issue must stay limited to repository scaffolding and must not pre-implement:

* CI enforcement that belongs to `CTB-70`
* shared package implementations that belong to `CTB-71`
* runtime dependency boot that belongs to `CTB-72` through `CTB-74`

## Risks

* If the root workspace contract is inconsistent, later stories may need to rework the repo foundation.
* If app manifests are invalid, fresh-clone installs will fail before runtime work begins.
* If placeholder package locations are omitted, downstream stories may drift into ad hoc repository structure.

## Open Questions

* Later tooling stories may introduce additional root automation once lint, format, and CI commands are finalized.
* Build orchestration may evolve beyond direct pnpm recursion as the executable codebase grows.

## Approvals

Recommended review focus:

* correctness of the root workspace wiring
* alignment to the approved monorepo structure
* fresh-clone install ergonomics for Milestone 1 bootstrap work
