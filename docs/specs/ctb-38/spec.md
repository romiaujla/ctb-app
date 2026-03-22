# CTB-38 Spec

## Problem

CTB now has a top-level monorepo baseline and shared tooling baseline, but it still does not identify the concrete app and shared-package workspace targets that future implementation stories should use.

## Goal

Define the initial CTB application and shared-package workspace set, including workspace roles and ownership intent, so downstream implementation work lands in the correct targets.

## Scope

This story covers:

* the planned application workspaces for web, api, simulator-worker, reporting-worker, and notification-worker
* the planned shared packages for reusable CTB concerns
* workspace-role descriptions aligned to the monorepo and simulator-first architecture baselines
* ownership intent visible enough to guide planning and review routing

This story does not cover:

* creating the actual directories or package files in code
* detailed runtime design inside each workspace
* domain implementation logic

## Requirements

1. CTB must identify the planned application workspaces for web, api, simulator-worker, reporting-worker, and notification-worker.
2. CTB must identify the planned shared packages for reusable CTB concerns.
3. CTB must align workspace roles to the existing monorepo and architecture guidance.
4. CTB must make ownership intent visible enough to guide future planning and review routing.
5. CTB must complete the repository-foundation planning chain without creating implementation code.

## Success Criteria

The spec is successful when:

* future implementation stories can name their intended workspace without ambiguity
* the workspace list is complete enough to cover the planned CTB v1 architecture
* reviewers can infer the expected role and ownership intent of each workspace from one reusable baseline

## Primary Artifact

Implementation-ready architecture baseline:

* `docs/architecture/ctb-monorepo-structure.md`
