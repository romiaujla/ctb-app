# CTB v1 Initial Strategy Hypothesis and Guardrail Baseline

## Purpose

This document defines the planning-level CTB v1 trading strategy hypothesis, entry and exit rules, guardrails, and versioning policy.

It is the implementation-ready strategy baseline for `CTB-34`.

## Strategy Objective

CTB v1 should begin with one conservative, explainable, long-only intraday strategy that tests whether CTB can capture continuation moves in liquid instruments without relying on hidden discretionary judgment.

The first strategy should optimize for:

* rule clarity over signal complexity
* explainable no-trade outcomes over forced activity
* bounded downside and low portfolio stress over aggressive capital deployment
* versioned comparability so later changes can be judged against a stable baseline

## Strategy Family

The initial CTB v1 strategy should be:

* long-only
* single-strategy
* single-position-at-a-time
* regular-session focused
* intraday rather than swing or overnight

The strategy hypothesis is:

* CTB can generate useful simulator evidence by trading only when a liquid instrument shows confirmed upward momentum, then pauses into a controlled pullback, and resumes in the original direction while risk remains bounded.

## Eligible Instrument Rules

An instrument is eligible only when all of the following are true:

* it is a liquid US-listed equity or ETF supported by CTB market-data inputs
* it is actively tradable during the current regular session
* price and volume inputs are fresh enough to satisfy market-data trust rules
* CTB does not already hold an open position
* the instrument is not leveraged, inverse, halted, or otherwise outside the intended v1 simplicity boundary

Planning rule:

* CTB should prefer one clean opportunity over broad symbol coverage in v1

## Evaluation Inputs

The strategy should evaluate:

* trusted intraday price and volume inputs
* current portfolio cash and position state
* strategy version and current session context
* guardrail states such as stale data, trading cutoff windows, and blocked re-entry conditions

The strategy must not rely on:

* manual override decisions hidden from the evaluation record
* live brokerage state
* portfolio calculations re-derived outside canonical simulator truth

## Entry Rules

CTB should emit a long trade intent only when every entry rule is satisfied.

### Session and timing gate

The strategy may consider entries only:

* after the first `15` minutes of the regular market session
* before the final `60` minutes of the regular market session

### Trend confirmation gate

The instrument must show all of the following:

* price trading above session VWAP
* short-term trend above medium-term trend
* a recent breakout above the session opening range high or the latest intraday swing high

### Pullback confirmation gate

After the breakout, the strategy should wait for one controlled pullback where:

* price remains above VWAP
* price remains above the breakout level
* the pullback does not invalidate the broader upward structure

### Trigger gate

CTB should emit a buy trade intent only when:

* a new upward confirmation candle closes after the pullback
* the trigger price is above the confirmation candle high
* all guardrails pass at the moment of evaluation

## Position Sizing Rules

The initial strategy should size trades conservatively.

Default planning limits:

* at most one open position at a time
* at most `25%` of current portfolio value allocated to one position
* at most `1%` of starting equity risked on the initial stop distance

If the computed position size violates any limit or rounds to zero, CTB must produce a no-trade outcome rather than forcing a reduced-but-unclear order.

## Exit Rules

CTB should close the v1 position when the first applicable exit condition occurs.

Primary exit conditions:

* stop loss at the lower of the pullback low or `1%` below entry
* profit target at `2R` from the entry, where `R` is the initial stop distance
* trend-failure exit if a post-entry confirmation closes back below VWAP
* time-based exit before the regular session closes

Planning rule:

* CTB v1 should not carry positions overnight

## Guardrail Rules

Guardrails are mandatory and should produce explicit blocked or skipped decisions.

The initial strategy should block trades when:

* market data is stale, missing, or inconsistent
* spread, volatility, or liquidity conditions make the setup untrustworthy
* the trade would exceed position-size or risk limits
* CTB already has an open position
* the instrument has already produced one stopped-out attempt for the same session
* entry timing falls outside the approved session window

## Invalid-Trade Conditions

The strategy should return `invalid` or `blocked` instead of a trade intent when:

* required inputs are missing
* the instrument does not satisfy the eligibility rules
* the breakout and pullback sequence is incomplete or contradictory
* the stop distance cannot be computed credibly
* the expected reward-to-risk is below `2:1`

## Versioning Policy

The initial strategy baseline should be recorded as `ctb-v1.0.0`.

Version-change rules:

* major version changes alter the strategy family, market participation model, or risk model
* minor version changes alter entry, exit, sizing, or guardrail behavior in a way that can change trade selection materially
* patch version changes fix implementation defects without intentionally changing business behavior

Version metadata must be attached to:

* every evaluation result
* every emitted trade intent
* downstream simulator, reporting, and review evidence that consumes strategy outcomes

## Explicit Exclusions

This baseline does not introduce:

* short-selling
* multi-position portfolio management
* overnight holding
* automated strategy switching
* complex parameter optimization or machine-learning-driven signal generation

## Downstream Reuse

Future CTB work should reuse this baseline when defining:

* the strategy rule engine and evaluation contracts
* strategy explainability records
* reporting metrics for emitted, skipped, blocked, and invalid outcomes
* profitability review rules for deciding whether this strategy version should continue

This baseline should feed:

* `CTB-35` profitability-review and strategy-switch policy
* `CTB-49` strategy rule-engine and versioning design
* `CTB-50` strategy-output and explainability design
