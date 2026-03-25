# CTB-86 Plan

## Context

`CTB-86` is the persistence implementation slice for the strategy-engine planning chain defined by `CTB-48`, `CTB-49`, and `CTB-50`.

## Decision

Deliver the story as:

* Prisma schema and migration support for strategy evaluations and emitted trade intents
* shared strategy persistence contracts in `@ctb/types` and `@ctb/schemas`
* one Prisma-backed repository for storing and reading recent strategy evidence
* automated tests for schema parsing, persistence linkage, and query behavior

## Domain Boundaries

Affected domains:

* strategy evidence persistence
* shared contracts
* repository access for downstream strategy consumers

Unaffected domains:

* strategy rule formulas
* API transport
* operator UI presentation

## Contracts and Interfaces

Artifacts will define:

* strategy evaluation input and evidence record shapes
* emitted trade-intent persistence shape
* recent evaluation query options
* repository methods for persisting and reading strategy evidence

## Rollout Constraints

This issue must stay persistence-scoped and must not lock in:

* final strategy runtime orchestration
* endpoint payload design
* operator-facing layout decisions

## Risks

* Over-coupling to simulator execution would blur strategy ownership.
* Weak trade-intent linkage would make explainability hard to trust.
* Missing explicit decision states would force downstream reconstruction.

## Open Questions

* Additional explainability depth can be layered on later without breaking the persistence contract.
* Replay consumers may later need expanded query shapes beyond recent evaluations.

## Approvals

Recommended review focus:

* evidence-contract completeness
* separation from simulator execution records
* referential integrity for emitted trade intents
