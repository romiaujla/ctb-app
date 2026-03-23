# CTB-71 Spec

## Problem

The monorepo has valid workspace slots, but the shared package locations are still placeholders and the app workspaces do not yet exercise real workspace-to-workspace boundaries.

## Goal

Implement the first runnable workspace skeletons for the CTB apps and shared packages so local development starts from real modules instead of placeholder folders.

## Scope

This story covers:

* shared package workspaces for `types`, `schemas`, `config`, and `test-utils`
* workspace-to-workspace imports across apps and packages
* a placeholder HTTP runtime for the API workspace
* a placeholder simulator-worker runtime that reports local dependency usage

This story does not cover:

* Docker-local orchestration
* Prisma schema, migrations, or environment validation
* Redis-backed runtime coordination or integration tests

## Requirements

1. Shared packages must exist as valid workspaces with importable TypeScript entrypoints.
2. App workspaces must consume shared packages through explicit workspace dependencies.
3. The API workspace must start as a placeholder HTTP runtime.
4. At least one worker workspace must start with placeholder behavior against the local dependency contract.

## Success Criteria

The spec is successful when:

* the shared packages are importable from app workspaces
* the API and simulator worker expose runnable placeholder behavior
* workspace naming and dependency boundaries align with the approved monorepo plan

## Primary Artifacts

Executable workspace skeleton assets:

* `packages/types`
* `packages/schemas`
* `packages/config`
* `packages/test-utils`
* updated app workspace manifests and runtime entrypoints
