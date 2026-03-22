# CTB Market Data Freshness Guardrails and Failure Visibility

## Purpose

This document defines CTB freshness rules, timestamp guardrails, stale-data handling, and ingestion failure-visibility expectations for simulator-safe market data consumption.

It is the implementation-ready architecture baseline for `CTB-46`.

## Context

`CTB-45` established the canonical market data event contract and normalization boundaries. CTB now needs a clear quality bar for deciding when market data is safe to consume, when it should be treated as stale or invalid, and how operators should be informed when feed trust degrades.

The freshness policy must protect:

* simulator correctness
* strategy evaluation trustworthiness
* replay integrity
* downstream operator response workflows

## Decision

CTB will treat market data freshness as an explicit policy layer that evaluates canonical market events after normalization and before simulator or strategy consumption.

The policy rules are:

* freshness is determined from canonical timestamps, not raw provider heuristics alone
* stale, delayed, partial, and invalid conditions are first-class outcomes
* trading-session context affects freshness evaluation
* consumers fail safe when data quality falls below the configured trust threshold
* operator visibility must distinguish feed silence, delayed data, malformed data, and policy-enforced consumption blocks

## Domain Boundaries

### Normalization boundary

Owns:

* parsing provider timestamps
* preserving provider, observed, and normalized times
* emitting quality hints from schema validation

Does not own:

* final freshness classification for runtime policy decisions
* alert severity
* simulator halt or degrade policy

### Freshness policy boundary

Owns:

* acceptable age thresholds by event family and session state
* timestamp consistency validation
* stale and delayed data classification
* consumer-facing readiness states

Does not own:

* provider transport recovery
* ingestion scheduling
* persistence strategy

### Operator visibility boundary

Owns:

* alert taxonomy for feed trust issues
* dashboard signals for delayed or failed market ingestion
* escalation expectations for unsafe market inputs

Does not own:

* UI rendering details
* notification transport details

## Contracts and Interfaces

### Freshness evaluation input

Freshness checks should consume:

* canonical `eventType`
* `providerTimestamp`
* `observedTimestamp`
* `normalizedTimestamp`
* `sessionState`
* normalization `quality`
* provider identity

### Freshness evaluation output

CTB should classify each canonical event into one of these states:

* `ready`
* `delayed`
* `stale`
* `partial`
* `invalid`
* `unavailable`

Definitions:

* `ready`: safe for normal simulator and strategy use
* `delayed`: still usable for limited observability or controlled workflows, but not ideal
* `stale`: too old for trusted strategy evaluation
* `partial`: structurally incomplete for the intended event family
* `invalid`: failed timestamp or schema safety checks
* `unavailable`: expected updates are missing for the active session or required instrument set

### Consumer readiness policy

The simulator and strategy layers should consume data based on an explicit policy:

* `ready`: allow normal processing
* `delayed`: allow only when a configured degradation policy permits it
* `stale`, `partial`, `invalid`, `unavailable`: block strategy evaluation and record the reason

### Failure visibility signals

Downstream observability should distinguish:

* provider feed interruption
* increasing event latency
* malformed payload rate
* session-state mismatch
* blocked strategy evaluation due to untrusted market data

## Timestamp Guardrails

### Required timestamp lineage

CTB must preserve:

* provider event time
* observed ingest time
* normalized ordering time

### Guardrail rules

1. Provider timestamps must not be in the future beyond a small configurable clock-skew allowance.
2. Observed timestamps must not precede normalized timestamps.
3. Events missing required timestamps for their family must be marked `invalid`.
4. Large gaps between provider and observed timestamps must surface as `delayed` or `stale`, not be silently accepted.
5. Out-of-order events may still be stored for replay but must not be treated as implicitly current.

### Clock-skew handling

CTB should tolerate small, explicit clock skew while recording it for diagnostics.

If skew exceeds the tolerated range:

* classify the event as `invalid` or `delayed` depending on the failure mode
* expose the condition to operator tooling

## Freshness Rules

### Session-aware policy

Freshness should be evaluated relative to market session:

* `regular`: strictest freshness expectations
* `preMarket` and `afterHours`: slightly wider delay tolerance when expected liquidity is lower
* `closed`: no expectation of continuous price updates, but late-arriving session-close artifacts must still validate cleanly

### Event-family policy

Freshness windows should be configured separately for:

* quotes
* trades
* bars
* status events

Reason:

* event cadence and trust requirements differ by family

### Delayed-data policy

Delayed data should remain visible and diagnostically useful, but the default strategy policy should not treat it as trustworthy market input.

### Stale-data policy

When data becomes stale for an active instrument or required market segment:

* block new strategy evaluation for the impacted scope
* preserve the last trusted event reference for diagnostics
* record the reason in simulator or ingestion state

## Stale and Malformed Data Handling

### Stale data

Handling requirements:

* do not silently reuse stale events as current truth
* mark the impacted instrument or feed as degraded
* allow operators to distinguish stale data from total feed loss

### Partial data

Handling requirements:

* keep diagnostically useful metadata when safe
* prevent downstream consumers from assuming missing fields are zero or unchanged
* count partial events in quality monitoring

### Invalid or malformed data

Handling requirements:

* reject unsafe downstream consumption
* capture the failure category
* expose invalid-event trends to observability dashboards

## Failure Visibility and Observability

The market-data freshness layer should feed the existing CTB observability model with:

* freshness-age metrics by provider and event family
* stale-event counts
* invalid-event counts
* unavailable-feed windows
* strategy-block reasons tied to market-data trust

Alert classes should support:

* warning-level delayed-data conditions
* error-level stale or unavailable feed conditions
* elevated malformed-data conditions when event validity degrades materially

## Rollout Constraints

This story should define policy, not implementation-specific infra.

Do not decide here:

* scheduler cadence
* persistent storage model
* exact dashboard UI
* notification routing

This policy should directly feed:

* `CTB-47` replay-ready ingestion workflow
* later simulator runtime guardrails
* operator UI status surfaces in `CTB-52` and `CTB-53`

## Risks

### Risk 1: freshness windows are too rigid across sessions

Mitigation:

* make thresholds configurable by event family and session state
* keep the contract explicit without overfitting to one provider

### Risk 2: stale data is visible but still accidentally consumed

Mitigation:

* separate diagnostic visibility from consumer-readiness policy
* require explicit allow rules for degraded use

### Risk 3: operators cannot tell whether the problem is delay, silence, or malformed data

Mitigation:

* define distinct failure states and alert signals
* keep blocked-consumer reasons explicit

## Open Questions

* Exact freshness thresholds should be finalized when a concrete provider and polling model are chosen.
* Alert thresholds for warning versus error conditions may be refined with real feed behavior.

## Approvals

Approval focus:

* architecture review for readiness-state semantics
* implementation review for guardrail placement in the ingestion pipeline
* observability review for alert taxonomy and operator usefulness

## Recommended Next Implementation Work

This document should directly feed:

* `CTB-47` replay-safe ingestion stages and idempotent capture design
* simulator guardrail implementation stories that enforce strategy-block behavior
* operator-facing health surfaces for market data trust

Related follow-on baseline:

* `docs/architecture/ctb-market-data-ingestion-replay-workflow.md`
