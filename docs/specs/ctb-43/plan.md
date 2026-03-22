# CTB-43 Plan

## Context

`CTB-43` continues the simulator-core planning chain by turning the canonical domain model from `CTB-42` into an explicit accounting baseline for simulator balances, fills, positions, snapshots, and event-derived state.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus a reusable accounting-model baseline rather than executable simulator-core code.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reusable accounting and event-history baseline under `docs/architecture`
* small cross-document link updates so downstream simulator stories can discover the accounting baseline

## Domain Boundaries

Affected domains:

* simulation account and ledger responsibilities
* orders, fills, positions, and portfolio snapshots
* event-history-to-state derivation rules
* accounting outputs trusted by downstream consumers

Unaffected domains:

* deterministic replay-processing mechanics
* exact physical persistence design
* strategy evaluation behavior
* report rendering and notification transport logic

## Contracts and Interfaces

Artifacts will define:

* the simulator ledger responsibility split across account, events, orders, fills, positions, and snapshots
* the derivation path from immutable events to current portfolio state
* accounting invariants that future package code and tests must preserve
* the downstream read boundary for reporting, notification, and API consumers

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* one exact storage schema or snapshot cadence
* one event bus or queue implementation
* exact replay-processing safeguards that belong in `CTB-44`
* strategy or market-data logic outside the simulator accounting boundary

## Risks

* If account and ledger responsibilities are vague, later implementation may duplicate accounting logic across services.
* If event-derived state rules are weak, portfolio outputs may stop being explainable from canonical history.
* If downstream boundaries are unclear, reports and notifications may quietly recalculate P&L logic independently.

## Open Questions

* Snapshot frequency remains an implementation concern for later build stories.
* Exact fee, slippage, and valuation storage precision remains open pending package implementation.

## Approvals

Recommended review focus:

* clarity of the event-history relationship to positions and portfolio snapshots
* usefulness of the accounting invariants for downstream reporting trust
* consistency with the `CTB-42` simulator domain baseline
