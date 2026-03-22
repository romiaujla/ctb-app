# CTB-55 Plan

## Context

`CTB-55` is a medium-risk reporting story because it defines the generation path and validation gates for daily simulator evidence that later publication and notification flows will depend on.

The repo is still docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus an implementation-ready update to the reporting architecture baseline.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reporting architecture update that defines the generation pipeline and validation contract in implementation-ready detail

## Domain Boundaries

Affected domains:

* simulator portfolio outputs
* strategy evidence outputs
* reporting-core artifact shaping
* reporting-worker orchestration and validation
* GitHub Pages publication handoff

Unaffected domains:

* live execution
* notification transport implementation
* operator-facing interactive UI controls

## Contracts and Interfaces

Artifacts will define:

* canonical upstream inputs required before a report can build
* report package structure shared between JSON and HTML outputs
* stage-specific validation gates and failure classifications
* publish-readiness rules that downstream publication must respect

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* a rendering library or templating engine
* a scheduler implementation beyond the reporting window contract
* UI-specific component designs
* notification delivery mechanics

## Risks

* If report generation is allowed to pull from non-canonical inputs, reporting can diverge from simulator truth.
* If validation gates are underspecified, partial artifacts may be published as complete.
* If artifact contracts drift between JSON and HTML outputs, downstream publication and notification flows will become brittle.

## Open Questions

* Exact HTML presentation styling can still evolve as long as the semantic sections and validation contract remain stable.
* Additional observability hooks may be expanded by later reporting and notification stories.

## Approvals

Recommended review focus:

* correctness of canonical reporting dependencies
* clarity of stage boundaries between shaping, rendering, validation, and publication
* sufficiency of publish-readiness checks for partial and failed outcomes
