# CTB-59 Plan

## Context

`CTB-59` is a medium-risk delivery-control story because it defines the secret-handling, validation, and audit expectations that make local notification transport safe and reviewable.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus an implementation-ready update to the notification architecture baseline.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one notification architecture update that defines transport configuration, template validation, failure handling, and delivery audit expectations

## Domain Boundaries

Affected domains:

* local transport configuration and secret loading
* message-template validation before dispatch
* notification delivery failure classification
* delivery evidence and observability outputs

Unaffected domains:

* canonical notification event classes
* public subscription models
* provider-specific transport implementation details

## Contracts and Interfaces

Artifacts will define:

* required transport configuration and secret rules
* template validation gates before delivery
* delivery failure classes and response expectations
* audit record structure and observability alignment

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* one final SMTP provider or relay vendor
* a specific template engine library
* cloud-hosted secret storage
* public-facing delivery preferences

## Risks

* If transport configuration is underspecified, later implementations may handle secrets unsafely.
* If template validation is omitted, malformed or misleading alerts may reach the owner.
* If failure handling and audit rules are weak, delivery debugging and observability will be unreliable.

## Open Questions

* Final provider selection can remain flexible until implementation.
* Template-copy depth can evolve as long as validation and class boundaries stay stable.

## Approvals

Recommended review focus:

* clarity of secret and transport configuration expectations
* sufficiency of template validation rules
* usefulness of the failure and audit contract for security and observability follow-on work
