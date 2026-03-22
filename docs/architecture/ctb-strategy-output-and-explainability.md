# CTB Strategy Output and Explainability Trail

## Purpose

This document defines the strategy evaluation outputs, explainability trail, and future-safe strategy-switch hooks that should accompany CTB v1 strategy execution.

It is the implementation-ready architecture baseline for `CTB-50`.

## Context

`CTB-49` defined the v1 strategy rule-engine boundary and versioned trade-intent generation. CTB now needs a durable evidence model so strategy behavior can be reviewed, compared, reported, and evolved without reverse-engineering the engine after the fact.

## Decision

Every strategy evaluation should emit an explicit evidence record that captures:

* what was evaluated
* what decision was reached
* which rule or guardrail drove the outcome
* which strategy version produced the result
* whether a trade intent was emitted, skipped, or blocked

This evidence record should be the source of truth for downstream reporting, observability, and future strategy comparison work.

## Domain Boundaries

### Strategy output domain

Owns:

* evaluation result records
* explainability fields
* strategy-version attribution
* skip and block reasons

### Downstream consumer domain

Reporting, observability, and operator-review workflows may consume strategy evidence directly, but they should not reconstruct it from raw engine internals.

### Future strategy-switch boundary

CTB v1 remains single-strategy, but the evidence model should support future strategy replacement by preserving stable identifiers and version attribution without introducing active multi-strategy orchestration now.

## Contracts and Interfaces

### StrategyEvidenceRecord

Each evaluation should emit:

* `evaluationId`
* `strategyId`
* `strategyVersion`
* `evaluationTimestamp`
* `inputReference`
* `decisionState`
* `signalSummary`
* `guardrailSummary`
* `decisionReason`
* `tradeIntentReference` when emitted

### Decision states

Supported states:

* `tradeIntentEmitted`
* `skipped`
* `blocked`
* `invalidInput`

### Explainability requirements

The evidence trail should make clear:

* what signal or condition qualified the setup
* what guardrails were checked
* why a trade was skipped or blocked
* what version of the strategy produced the outcome

## Strategy-Switch Hooks

To stay future-safe without adding v1 complexity:

* preserve stable `strategyId` separate from `strategyVersion`
* make evidence records attributable to one active strategy instance
* avoid hard-coding downstream consumers to a single unnamed strategy forever

This supports future replacement or comparison work without introducing concurrent multi-strategy portfolio management into v1.

## Reporting and Observability Alignment

Downstream consumers should be able to use strategy evidence for:

* daily summaries of emitted versus skipped opportunities
* profitability review tied to strategy version
* debugging unexpected no-trade or blocked outcomes
* observability signals around strategy behavior drift

## Rollout Constraints

This story defines the evidence model, not final presentation.

Do not decide here:

* full operator UI layout for strategy explanations
* public analytics presentation
* automated strategy promotion or switching

This baseline should feed:

* `CTB-51` API surface design
* `CTB-52` operator UI information architecture
* `CTB-54` daily report schema design

## Risks

### Risk 1: downstream teams rebuild strategy evidence inconsistently

Mitigation:

* define one canonical strategy evidence record

### Risk 2: blocked or skipped outcomes are hard to debug

Mitigation:

* require explicit decision states and reasons

### Risk 3: future strategy changes force a contract rewrite

Mitigation:

* separate stable strategy identity from version metadata

## Open Questions

* Explanation detail can be tuned later for operator readability.
* Future comparison depth across strategy versions can expand outside v1.

## Approvals

Approval focus:

* sufficiency of strategy evidence for reporting and review
* clarity of explainability requirements
* future-safe but v1-scoped strategy identity design

## Recommended Next Implementation Work

This document should directly feed:

* `CTB-51` operator-facing API boundaries for strategy evidence
* `CTB-52` UI views that summarize strategy behavior
* `CTB-54` report schema sections tied to strategy outcomes
