# CTB-45 Plan

## Context

`CTB-45` is a medium-risk architecture story because it establishes a durable contract boundary that later ingestion and strategy issues must inherit.

The repo is currently docs-first, so the implementation for this issue is the architecture baseline and issue-scoped Spec Kit artifacts rather than package code.

## Decision

Deliver the story as:

* one implementation-ready architecture document
* one issue-scoped spec
* one issue-scoped task list
* small repo links so follow-on stories can reuse the new baseline

## Domain Boundaries

Affected domains:

* market data
* simulator input surface
* future strategy input surface
* shared contracts and schema packages

Unaffected domains:

* portfolio accounting
* reporting
* notification delivery
* UI rendering

## Contracts and Interfaces

Artifacts will define:

* canonical event envelope
* canonical event-family payloads
* normalization rules and ownership
* shared package placement expectations

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* a single provider SDK
* a persistence backend
* freshness thresholds that belong in `CTB-46`
* replay storage mechanics that belong in `CTB-47`

## Risks

* Over-designing around a single provider would weaken later adapter flexibility.
* Blending freshness or persistence policy into this issue would widen scope beyond the Jira contract.
* Leaving timestamp lineage ambiguous would create replay and validation drift in follow-on issues.

## Open Questions

* First-provider selection remains open by design.
* Raw payload retention depth remains open for `CTB-47`.

## Approvals

Recommended review focus:

* contract completeness for future market-data work
* boundary clarity between adapters and consumers
* consistency with simulator-first architecture rules
