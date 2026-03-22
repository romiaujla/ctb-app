# CTB-36 Plan

## Context

`CTB-36` is a medium-risk repository-foundation story because it establishes the top-level structure that later tooling, workspace-planning, and implementation stories must inherit.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus a reusable architecture baseline for the monorepo layout.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reusable monorepo-structure baseline under `docs/architecture`
* small cross-document link fixes so follow-on stories can reference the correct foundation issue

## Domain Boundaries

Affected domains:

* repository top-level structure
* planning-level workspace-category ownership
* architecture-to-repository alignment
* follow-on repository-foundation handoffs

Unaffected domains:

* shared tooling command choices
* CI implementation details
* concrete app or package workspace definitions
* runtime or product behavior

## Contracts and Interfaces

Artifacts will define:

* the canonical top-level monorepo layout
* the intended responsibility of each workspace category
* the boundary between this story and follow-on tooling or workspace-definition stories
* the handoff path from `CTB-36` to `CTB-37` and `CTB-38`

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* a specific package manager or workspace toolchain
* a concrete CI workflow implementation
* a full application or shared-package catalog that belongs in `CTB-38`

## Risks

* If the top-level layout is vague, downstream stories may create competing repository patterns.
* If this story defines tooling or concrete workspaces, it will collapse the repository-foundation chain into one oversized scope.
* If stale issue references remain, future stories may inherit the wrong planning lineage.

## Open Questions

* The exact tooling stack remains intentionally open for `CTB-37`.
* The concrete workspace list and ownership routing remain intentionally open for `CTB-38`.

## Approvals

Recommended review focus:

* clarity of the top-level repository boundaries
* strength of the scope boundary between `CTB-36`, `CTB-37`, and `CTB-38`
* consistency with the simulator-first architecture direction
