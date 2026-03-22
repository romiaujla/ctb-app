# CTB-42 Plan

## Context

`CTB-42` starts the simulator-core planning chain by narrowing the top-level simulator architecture into a concrete canonical domain model and persistence-boundary baseline.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus a reusable simulator-domain baseline rather than executable package code.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reusable simulator-domain and persistence-boundary baseline under `docs/architecture`
* small cross-document link updates so downstream simulator stories can discover the new baseline

## Domain Boundaries

Affected domains:

* canonical simulator entities
* simulator event contracts
* schema ownership intent
* persistence boundaries for canonical truth versus downstream projections

Unaffected domains:

* fill-accounting rules and P&L recognition
* replay-processing mechanics
* executable storage implementation
* UI and notification delivery behavior

## Contracts and Interfaces

Artifacts will define:

* the canonical simulator entity set and ownership rules
* the shared event envelope and event-family expectations
* future package placement expectations for types, schemas, and domain logic
* the persistence boundary between immutable simulator facts and derived consumer views

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* one exact database table design
* one message transport or queue mechanism
* one final ORM or storage library
* detailed accounting logic that belongs in `CTB-43`
* determinism and replay safeguards that belong in `CTB-44`

## Risks

* If canonical entities are vague, later implementation can splinter into incompatible state models.
* If event boundaries are underspecified, downstream services may invent local truth instead of consuming shared simulator facts.
* If persistence ownership is blurry, reporting and notification workflows may bypass the simulator core.

## Open Questions

* Exact physical storage layout remains open for future build stories.
* Event publication mechanics remain open pending worker and runtime implementation.

## Approvals

Recommended review focus:

* completeness of the canonical simulator entity set
* clarity of the persistence boundary between simulator truth and downstream consumers
* consistency with the existing simulator-first architecture baseline
