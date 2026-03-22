# CTB-47 Plan

## Context

`CTB-47` completes the market-data planning chain by turning the canonical contract and freshness policy into a replay-safe ingestion workflow.

## Decision

Deliver the story as:

* one implementation-ready architecture note for replay-safe ingestion
* one issue-scoped spec
* one issue-scoped task list
* small documentation links from the prior market-data baselines

## Domain Boundaries

Affected domains:

* provider ingest edges
* canonical market-data pipeline
* replay and validation surface

Unaffected domains:

* strategy evaluation logic
* reporting outputs
* UI interactions

## Contracts and Interfaces

Artifacts will define:

* ingest-stage handoffs
* raw and canonical record expectations
* idempotency behavior
* validation layers for replay trust

## Rollout Constraints

This issue must stay planning-level and must not hard-code:

* queue technology
* database selection
* scheduler cadence
* retention duration values

## Risks

* Weak idempotency rules would undermine replay correctness.
* Missing validation-stage definitions would make later automation shallow.
* Alternate downstream history sources would break simulator consistency.

## Open Questions

* Storage backend selection remains open.
* Raw payload retention depth remains adjustable.

## Approvals

Recommended review focus:

* workflow stage completeness
* replay traceability
* validation depth for future implementation
