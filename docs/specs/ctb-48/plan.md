# CTB-48 Plan

## Context

`CTB-48` starts the strategy-engine planning chain by defining what the strategy layer is allowed to see when producing trade intents.

## Decision

Deliver the story as:

* one implementation-ready architecture note for the strategy input contract
* one issue-scoped spec
* one issue-scoped task list
* small documentation links from the replay-ready ingestion baseline

## Domain Boundaries

Affected domains:

* market-data consumption
* simulator portfolio truth
* strategy evaluation
* guardrail and risk context

Unaffected domains:

* strategy rule implementation details
* UI management flows
* live broker execution

## Contracts and Interfaces

Artifacts will define:

* the canonical strategy evaluation input shape
* ownership of market, portfolio, and risk inputs
* determinism requirements for replay-safe strategy evaluation

## Rollout Constraints

This issue must stay contract-level and must not lock in:

* specific alpha rules
* feature-calculation placement beyond boundary guidance
* API or UI exposure details

## Risks

* Hidden cross-domain reads would weaken determinism.
* Poorly separated derived features would hide business logic.
* Re-deriving portfolio truth in the strategy layer would create drift.

## Open Questions

* Final ownership split for some derived indicators remains open.
* Strategy configuration shape will be refined in later stories.

## Approvals

Recommended review focus:

* contract completeness
* ownership clarity
* deterministic replay suitability
