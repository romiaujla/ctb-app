# CTB-71 Plan

## Context

`CTB-71` is a medium-risk workspace-integration story because it converts the repo from a scaffold of package slots into the first real workspace graph that later runtime and persistence tickets will extend.

The monorepo root and shared tooling baseline already exist, so this issue should focus on package boundaries and runnable placeholder app behavior only.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* four shared package workspaces with importable TypeScript entrypoints
* updated app workspace manifests that depend on those shared packages
* placeholder API and simulator-worker runtime behavior suitable for local development and CI smoke tests

## Domain Boundaries

Affected domains:

* workspace package manifests
* shared package source layout
* app-to-package import boundaries
* placeholder API and worker startup behavior

Unaffected domains:

* Docker runtime orchestration
* database schema and migrations
* typed environment validation
* Redis-backed queues, dedupe, and integration harnesses

## Contracts and Interfaces

Artifacts will define:

* shared runtime descriptor and dependency types
* baseline schemas for workspace runtime payloads
* shared local dependency defaults for placeholder app behavior
* test helper utilities reused by the workspace smoke tests

## Rollout Constraints

This issue must stay focused on workspace skeletons and must not pre-implement:

* Docker Compose and service containers from `CTB-72`
* Prisma and env-validation mechanics from `CTB-73`
* Redis-backed runtime state and integration harnesses from `CTB-74`

## Risks

* If package exports are inconsistent, workspace imports will fail in CI and local startup.
* If the API placeholder is too thin, later runtime stories may need to rework the app surface immediately.
* If app and package responsibilities blur, downstream stories may duplicate config or schema logic.

## Open Questions

* Later stories may add more shared packages once domain logic starts to land.
* The web workspace will likely switch to a richer frontend stack once UI implementation begins.

## Approvals

Recommended review focus:

* correctness of shared package boundaries
* app usage of workspace dependencies instead of local ad hoc imports
* local startability of the API and simulator worker placeholders
