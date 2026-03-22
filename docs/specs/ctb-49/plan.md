# CTB-49 Plan

## Context

`CTB-49` advances the strategy chain from input-contract design into explicit rule-engine behavior and versioned trade-intent generation.

## Decision

Deliver the story as:

* one implementation-ready architecture note for the strategy rule engine
* one issue-scoped spec
* one issue-scoped task list
* small documentation links from the strategy input contract baseline

## Domain Boundaries

Affected domains:

* strategy evaluation
* guardrail policy
* trade-intent generation
* strategy version governance

Unaffected domains:

* simulator execution
* reporting aggregation
* live order routing

## Contracts and Interfaces

Artifacts will define:

* evaluation result states
* trade-intent output rules
* guardrail outcomes
* version metadata expectations

## Rollout Constraints

This issue must stay boundary-level and must not lock in:

* production tuning values
* multi-strategy orchestration
* live promotion workflow

## Risks

* Hidden coupling to execution would muddy ownership.
* Silent guardrail failures would weaken explainability.
* Missing version metadata would undermine later comparisons.

## Open Questions

* Final rule formulas remain tunable.
* Version naming detail can be refined later.

## Approvals

Recommended review focus:

* separation from simulator execution
* completeness of decision states
* sufficiency of version metadata
