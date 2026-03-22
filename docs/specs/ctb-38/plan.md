# CTB-38 Plan

## Context

`CTB-38` is a medium-risk repository-foundation story because it turns the top-level monorepo baseline into a concrete workspace-target plan that future implementation stories must inherit.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus an update to the reusable monorepo baseline that records the planned workspaces and ownership intent.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one updated reusable monorepo-structure baseline with concrete workspace targets
* small cross-document link updates so downstream planning can reference the completed foundation chain

## Domain Boundaries

Affected domains:

* planned app workspace targets
* planned shared-package targets
* workspace-role definitions
* ownership and review-routing intent

Unaffected domains:

* actual workspace creation in code
* exact toolchain implementation inside the workspaces
* domain behavior inside simulator, reporting, notification, or API modules
* deployment rollout specifics

## Contracts and Interfaces

Artifacts will define:

* the initial app workspace target list
* the initial shared-package target list
* workspace roles and intended responsibilities
* ownership intent aligned to the existing CTB agent and architecture guidance

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* immediate creation of all workspaces in the repository
* final internal module structure within each workspace
* implementation details that belong in later build stories

## Risks

* If the workspace list is incomplete, later implementation stories will recreate new targets ad hoc.
* If ownership intent is vague, review routing and boundary decisions will drift.
* If this story starts creating code structure, it will widen beyond the Jira contract.

## Open Questions

* Final file and package manifests will be determined when setup stories create the real workspaces.
* Internal module boundaries inside each workspace can evolve as implementation stories become concrete.

## Approvals

Recommended review focus:

* completeness of the workspace target list
* clarity of workspace roles and ownership intent
* consistency with the `CTB-36` and `CTB-37` foundation baselines
