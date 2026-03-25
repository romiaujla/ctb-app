# CTB-90 Plan

## Context

`CTB-90` is a medium-risk API completion story because it turns the control-plane planning baseline into a concrete runtime contract that later UI work must trust.

The repository already has partial market-data and strategy reads, so this issue should extend the current API without replacing proven implementation paths.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* shared control-plane response contracts in `packages/types` and `packages/schemas`
* API runtime updates in `apps/api`
* automated tests for the new API and `/docs` surface

## Domain Boundaries

Affected domains:

* operator-facing API overview and status reads
* simulator and strategy summary reads
* report and notification availability surfaces
* OpenAPI and `/docs` contract discovery

Unaffected domains:

* operator UI route implementation
* report-generation pipelines
* notification delivery pipelines
* new persistence ownership boundaries

## Contracts and Interfaces

Artifacts will define:

* one shared operator overview payload
* one shared set of control-plane summary payloads for simulator, strategy, reports, and notifications
* one supported OpenAPI document route and `/docs` HTML surface
* one consistent status vocabulary for healthy, warning, degraded, empty, and unavailable operator states

## Rollout Constraints

This issue must:

* preserve existing market-data and strategy endpoints and tests
* keep unavailable upstream domains explicit rather than fabricating business truth
* avoid widening into UI implementation or unrelated worker features

## Risks

* If the new status shapes drift from current code, the upcoming UI work may build against unstable payloads.
* If `/docs` is too thin or inconsistent, the contract surface will remain under-specified.
* If unavailable report or notification states are vague, operators will not be able to distinguish missing features from runtime failure.

## Open Questions

* Reports and notifications may remain explicitly unavailable until their runtime producers exist.
* A later story may refine the OpenAPI detail level once more downstream consumers exist.

## Approvals

Recommended review focus:

* clarity and stability of the new response contracts
* usefulness of the overview surface for downstream UI work
* accuracy of `/docs` and the OpenAPI payload
