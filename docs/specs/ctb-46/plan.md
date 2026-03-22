# CTB-46 Plan

## Context

`CTB-46` is a medium-risk policy and architecture story because it defines the safety bar for consuming canonical market data in the simulator and strategy chain.

## Decision

Deliver the story as:

* one implementation-ready architecture note for freshness policy and failure visibility
* one issue-scoped spec
* one issue-scoped task list
* small documentation links from the existing market-data contract baseline

## Domain Boundaries

Affected domains:

* market data quality policy
* simulator consumption guardrails
* observability and operator diagnostics

Unaffected domains:

* persistence implementation
* report generation logic
* UI layout decisions

## Contracts and Interfaces

Artifacts will define:

* freshness input fields and output states
* timestamp validation rules
* consumer readiness policy
* operator visibility expectations

## Rollout Constraints

This issue must stay planning-level and must not lock in:

* exact provider-specific timing thresholds
* scheduler cadence
* storage retention mechanics
* UI-specific rendering details

## Risks

* Collapsing all bad data into one failure class would reduce operator usefulness.
* Over-specifying thresholds before provider choice would create false precision.
* Blending ingestion mechanics into this issue would widen scope beyond the Jira contract.

## Open Questions

* Final freshness thresholds will be calibrated later with real provider behavior.
* Alert severities can be tuned once runtime observability exists.

## Approvals

Recommended review focus:

* clarity of readiness-state semantics
* safe downstream block behavior
* alignment with the CTB observability model
