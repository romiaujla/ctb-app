# CTB Promotion Readiness Gates

## Purpose

This document defines the reusable CTB baseline for the first promotion-readiness gate between simulator-only operation and any future live-money planning.

It builds on:

* `docs/process/ctb-agent-governance.md`
* `docs/process/ctb-observability-dashboards-and-alerts.md`
* `docs/process/ctb-profitability-review-and-strategy-switch-policy.md`
* `docs/process/ctb-validation-matrix.md`
* `docs/architecture/ctb-simulator-architecture.md`

## Gate Goals

The initial promotion gate should:

* require durable profitability evidence rather than short favorable runs
* keep drawdown and trust-protection limits explicit
* depend on reporting and observability evidence, not just headline return
* reset confidence when material strategy or execution assumptions change
* unlock later governance review rather than imply automatic live-money progression

## Promotion Stage Model

The promotion-readiness chain should be treated as:

1. threshold gate
2. governance and approval review
3. final checklist and evidence package
4. separate future program for any live-money planning

This document defines only the first stage.

## Review-Window Expectations

Promotion consideration should require one review window that is long enough to show stability rather than luck.

Minimum review-window expectations:

* at least `30` consecutive calendar days of simulator operation
* at least `20` days with completed simulation activity and end-of-day evidence
* evidence drawn from one stable strategy version and one stable execution-model assumption set
* the review window resets when strategy logic, major risk rules, or execution assumptions change materially

The review window should also include at least one period of visibly mixed market behavior so the evidence is not based only on unusually calm conditions.

## Profitability Gate

The initial profitability threshold for promotion consideration should require:

* positive ending net liquidation value versus the starting balance
* positive cumulative realized P&L after modeled fees and slippage
* no dependence on one isolated outlier day for the majority of gains

Planning rule:

* if the result is only nominally positive while reporting quality, alerting, or run consistency is weak, the threshold should be treated as not satisfied

This gate should be interpreted as a minimum entry condition for later review, not as proof that CTB is ready for live-money work.

## Drawdown and Trust-Protection Limits

Profitability evidence should be rejected when downside behavior shows the current setup is not yet trustworthy.

Initial drawdown and trust-protection limits:

* peak-to-trough drawdown during the review window should stay within `12%` of starting equity
* no single-day loss should exceed `5%` of starting equity without a documented explanation and follow-up review
* unresolved simulator correctness, reporting integrity, or market-data trust issues invalidate the review window

If a drawdown limit is breached, the promotion clock should stop until the underlying strategy or system concern is understood and a new clean review window is established.

## Required Supporting Evidence

Threshold review should use explicit evidence from adjacent CTB operating systems.

Minimum supporting evidence:

* daily reports exist for at least `95%` of expected review-window days
* observability evidence shows no unresolved critical alerts that undermine simulator trust for the reviewed period
* validation notes confirm there is no known blocker affecting portfolio calculations, reporting accuracy, or strategy-output interpretation
* any missing evidence is called out explicitly and treated as a blocker rather than ignored

The goal is to avoid promotion decisions based on partial or operationally untrustworthy data.

## Non-Automatic Progression Rule

Meeting the threshold gate does not approve live-money planning.

Threshold satisfaction only means:

* CTB may enter the next governance-review stage
* strategy comparison and architecture review can be requested
* future planning may be considered under new Jira scope and explicit approval

Threshold satisfaction does not mean:

* CTB can trade real money
* broker integration work is implicitly approved
* live execution risk has been accepted

## Reuse Rules

Future CTB promotion and governance work should:

* reuse this baseline as the first entry gate for promotion consideration
* inherit the review evidence and version-reset expectations from `docs/process/ctb-profitability-review-and-strategy-switch-policy.md`
* extend the remaining promotion stages without weakening the threshold gate
* treat live execution as a separate approved program rather than an automatic backlog continuation
