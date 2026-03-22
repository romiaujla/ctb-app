# CTB-33 Plan

## Context

`CTB-33` is a medium-risk product-foundation story because it sets the scope boundary that downstream strategy, reporting, API, and UI work must preserve.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus a reusable product-boundary baseline.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reusable CTB v1 product-boundary baseline under `docs/architecture`
* a README link so the baseline is discoverable from the repository contract list

## Domain Boundaries

Affected domains:

* product scope and exclusions
* operator workflow expectations
* planning-level success metrics
* handoff guidance for downstream strategy and control-plane stories

Unaffected domains:

* concrete strategy rules
* promotion-readiness thresholds
* detailed API endpoint contracts
* UI component implementation

## Contracts and Interfaces

Artifacts will define:

* the canonical CTB v1 product boundary
* explicit in-scope and out-of-scope capability classes
* the primary owner workflow CTB v1 should support
* initial product-level success and health signals

## Rollout Constraints

This issue must stay product-level and must not pre-commit CTB to:

* a detailed strategy formula
* implementation-specific UI layouts
* live-money or multi-user expansion work
* numeric profitability gates that belong in later review-policy stories

## Risks

* If the v1 boundary stays vague, downstream stories may reintroduce live-money or multi-user assumptions implicitly.
* If the operator workflow is underspecified, API and UI stories may invent incompatible control-plane flows.
* If success metrics are too abstract, future reporting and review work may optimize for the wrong evidence.

## Open Questions

* Strategy-specific rules remain intentionally open for `CTB-34`.
* Profitability-review and strategy-switch policy remain intentionally open for `CTB-35`.

## Approvals

Recommended review focus:

* clarity of the v1 scope boundary
* quality of the operator workflow handoff
* usefulness of the product-level success metrics for later reporting and control-plane work
