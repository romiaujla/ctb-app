# CTB Strategy Input Contract

## Purpose

This document defines the canonical CTB strategy input contract built from canonical market events, simulator truth, and risk context for deterministic strategy evaluation.

It is the implementation-ready architecture baseline for `CTB-48`.

## Context

CTB now has:

* canonical market-data contracts
* freshness and quality guardrails
* a replay-ready ingestion workflow

The next boundary is the strategy input surface. The strategy engine needs one stable contract so trade-intent generation remains testable and does not reach directly into provider payloads, ad hoc runtime state, or unrelated persistence details.

## Decision

CTB will define a single `StrategyEvaluationInput` contract that combines:

* canonical current and recent market context
* trusted simulator portfolio and cash state
* explicit risk and guardrail context
* evaluation metadata needed for deterministic replay

The strategy layer may consume this contract and derive trade intents from it, but it may not directly access:

* raw provider payloads
* ad hoc database reads outside the contract
* hidden runtime flags or mutable side channels

## Domain Boundaries

### Market-data contribution

May provide:

* canonical current market event references
* recent replay-safe market history or derived features
* freshness and trust status

May not provide:

* provider-specific transport fields
* raw payload structures

### Simulator-state contribution

May provide:

* current cash balance
* open positions
* average cost and exposure context
* latest valuation snapshot
* pending simulated order or intent constraints when relevant

May not provide:

* opaque internal implementation state with no strategy meaning
* mutable accounting internals that bypass the public contract

### Risk-context contribution

May provide:

* capital allocation limits
* per-instrument or per-strategy guardrails
* trading-session constraints
* data-trust gating results

May not provide:

* future live-broker state
* user- or tenant-specific access-control concerns outside CTB v1 scope

## Contracts and Interfaces

### StrategyEvaluationInput

The canonical strategy input should contain:

* `evaluationId`
* `strategyVersion`
* `evaluationTimestamp`
* `instrumentId`
* `symbol`
* `sessionState`
* `marketContext`
* `portfolioContext`
* `riskContext`
* `dataTrust`

### Market context

Should contain:

* latest trusted canonical event references
* recent bar, trade, or quote snapshots needed for deterministic evaluation
* freshness classification
* optional derived indicators that are explicitly versioned

### Portfolio context

Should contain:

* cash available
* current position quantity
* average cost basis
* unrealized and realized P&L context when needed
* current exposure for the instrument and overall portfolio

### Risk context

Should contain:

* max position sizing rules
* notional or capital guardrails
* session eligibility
* trade-block reasons already known before rule evaluation

### Data-trust context

Should contain:

* readiness state from market-data freshness policy
* blocked reason when data is not strategy-safe
* normalization or replay version references when needed for diagnostics

## Determinism Rules

The strategy contract must support replayable evaluation.

Rules:

* all inputs must be derivable from canonical history and simulator truth
* time-sensitive derived indicators must be versioned or explicitly defined
* hidden reads from provider-specific or operator-only state are not allowed
* blocked evaluations should be explainable from the contract alone

## Ownership Expectations

Ownership should be split as follows:

* market-data domain owns market context inputs
* simulator domain owns portfolio truth
* strategy layer owns rule evaluation against the contract
* risk and guardrail policy owns block conditions and sizing constraints

This keeps strategy logic dependent on declared inputs rather than accidental cross-domain reads.

## Rollout Constraints

This story defines the contract boundary only.

Do not decide here:

* specific strategy rules
* trade-intent generation algorithms
* UI controls for strategies
* live execution behavior

This contract should feed:

* `CTB-49` strategy rule engine design
* `CTB-50` simulator execution and risk-control coordination
* future deterministic strategy tests

## Risks

### Risk 1: strategy logic reaches around the contract

Mitigation:

* keep required fields explicit
* ban provider-specific and ad hoc reads from normal evaluation paths

### Risk 2: derived indicators become hidden business logic

Mitigation:

* version derived features
* distinguish raw canonical inputs from derived strategy features

### Risk 3: portfolio truth is re-derived differently across strategies

Mitigation:

* source simulator-state inputs from one canonical portfolio surface
* do not let strategies compute alternate accounting truth

## Open Questions

* Some indicators may belong upstream in data preparation while others remain strategy-local.
* Strategy-level configuration shape can be finalized in `CTB-49`.

## Approvals

Approval focus:

* completeness of the strategy input surface
* clarity of cross-domain ownership
* replay and deterministic-testing suitability

## Recommended Next Implementation Work

This document should directly feed:

* `CTB-49` explicit strategy rule and trade-intent generation design
* deterministic strategy-evaluation test scenarios
* later API and operator visibility work that needs strategy explanations
