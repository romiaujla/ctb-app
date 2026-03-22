# CTB Strategy Rule Engine and Versioning

## Purpose

This document defines the CTB v1 strategy rule-engine boundary, trade-intent generation path, guardrail behavior, and strategy-versioning expectations.

It is the implementation-ready architecture baseline for `CTB-49`.

## Context

`CTB-48` defined the canonical strategy input contract. CTB now needs explicit strategy logic that turns those inputs into simulated trade intents in a way that is explainable, versioned, and separated from simulator execution.

## Decision

CTB will treat the v1 strategy engine as explicit business logic that:

* consumes `StrategyEvaluationInput`
* evaluates deterministic rules and guardrails
* emits either a trade intent or a no-trade decision
* records the active strategy version used for the evaluation

The strategy engine must not:

* simulate fills
* update portfolio accounting directly
* rely on hidden mutable runtime state outside the declared contract

## Domain Boundaries

### Strategy rule engine

Owns:

* rule evaluation
* signal qualification
* invalid-trade or no-trade outcomes
* trade-intent creation
* strategy-version tagging

### Simulator execution domain

Owns:

* accepting or rejecting trade intents for execution
* simulated fills
* slippage and fee behavior
* portfolio state transitions

### Version governance

Owns:

* strategy version identity
* change comparability across runs
* preserving evaluation outputs with attributable rule versions

## Contracts and Interfaces

### Strategy evaluation result

Each evaluation should produce:

* `evaluationId`
* `strategyVersion`
* `evaluationTimestamp`
* `decision`
* `decisionReason`
* `guardrailResults`
* `tradeIntent` when applicable

### Decision states

The strategy engine should produce one of:

* `emitTradeIntent`
* `skip`
* `blocked`
* `invalidInput`

### Trade intent output

A trade intent should include:

* instrument and side
* quantity or sizing result
* order-style intent metadata
* source strategy id and version
* evaluation correlation id

## Guardrail Rules

Guardrails are first-class behavior, not incidental conditionals.

They should cover:

* insufficient trusted market data
* capital allocation or exposure constraints
* session-state restrictions
* invalid sizing outcomes
* existing blocked conditions from the strategy input contract

If a guardrail prevents action, the engine should emit a non-trade decision with the reason rather than silently falling through.

## Versioning Rules

Strategy versioning should:

* identify the rule set used for an evaluation
* make later result comparisons possible
* preserve compatibility with replay and reporting

Version metadata should be attached to:

* evaluation results
* emitted trade intents
* downstream simulator and reporting evidence when those stories consume it

## Separation Rules

The strategy engine must stay separate from:

* simulator execution assumptions
* reporting calculations
* operator UI controls
* future live-broker routing

This keeps rule logic reviewable and prevents execution or reporting concerns from distorting the strategy boundary.

## Rollout Constraints

This story defines the rule-engine boundary and behavior model, not a final alpha strategy.

Do not lock in here:

* long-term parameter tuning
* multi-strategy orchestration
* live execution promotion logic

This baseline should feed:

* `CTB-50` strategy outputs and explainability trail
* later deterministic rule tests
* future promotion comparisons between strategy versions

## Risks

### Risk 1: rule outputs become inseparable from execution behavior

Mitigation:

* keep trade-intent creation separate from execution and accounting

### Risk 2: guardrail failures are silent

Mitigation:

* emit explicit blocked or skip outcomes with reasons

### Risk 3: strategy revisions cannot be compared

Mitigation:

* require version metadata on every evaluation and emitted trade intent

## Open Questions

* Exact v1 rule formulas and tunable parameters may evolve with simulation evidence.
* Future-safe version naming conventions can be refined when multiple revisions exist.

## Approvals

Approval focus:

* boundary clarity between rule evaluation and simulator execution
* sufficiency of version metadata
* explicit handling of blocked and skipped outcomes

## Recommended Next Implementation Work

This document should directly feed:

* `CTB-50` explainability and strategy-output evidence design
* replayable strategy-evaluation test cases
* later API and reporting surfaces that consume strategy outcomes
