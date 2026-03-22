# CTB Profitability Review and Strategy-Switch Policy

## Purpose

This document defines the reusable CTB baseline for evaluating simulator profitability, running repeatable review cadences, and deciding whether the active strategy version should continue, be revised, or be paused.

It is the implementation-ready review-policy baseline for `CTB-35`.

## Review Goals

CTB review should:

* judge strategy performance from canonical simulator and reporting evidence rather than intuition
* separate normal short-term variance from strategy failure or trust failure
* make review cadence predictable for the single-owner operating model
* require explicit evidence before a strategy version is continued or changed
* keep strategy-switch decisions versioned and reviewable rather than ad hoc

## Evidence Hierarchy

The owner should evaluate strategy performance in this order:

1. trust and data integrity
2. risk and drawdown behavior
3. profitability and consistency
4. explainability and operational discipline

Planning rule:

* profitable results do not count as acceptable when trust, correctness, or reporting integrity is unresolved

## Required Review Evidence

Every formal review should use:

* the current strategy version identifier
* validated daily reports for the window being reviewed
* cumulative realized and unrealized profit or loss for the review window
* ending net liquidation value versus starting net liquidation value
* drawdown observations for the review window
* counts and top reasons for emitted, skipped, blocked, and invalid strategy outcomes
* open issue or anomaly notes that affect simulator, data, reporting, or strategy trust

## Review Cadence

CTB should use three review layers.

### 1. Daily close review

Run after each validated daily report is available.

The owner should confirm:

* the simulator completed as expected for the day
* the daily report is present and trustworthy
* the day did not breach any risk or trust-protection threshold
* unusual blocked, skipped, or invalid counts have an explanation

### 2. Weekly operating review

Run after each completed trading week using the most recent five trading days of evidence.

The owner should review:

* cumulative weekly realized profit or loss
* the largest daily drawdown or loss event
* reporting coverage and any unresolved operational anomalies
* whether the strategy behavior still matches the intended hypothesis

### 3. Formal strategy review window

Run whenever one of these occurs:

* every completed `20` trading days
* a material drawdown or trust breach
* a repeated strategy-quality concern that suggests the current version is no longer credible

The formal review window is the minimum baseline for deciding whether to continue the active strategy version or queue a versioned change.

## Profitability Evaluation Rules

The active strategy version should be considered healthy only when all of the following are true for the formal review window:

* ending net liquidation value is above the window starting value
* cumulative realized profit or loss is positive after modeled fees and slippage
* gains are not dominated by one isolated outlier day
* report coverage exists for at least `95%` of expected trading days in the window
* there is no unresolved issue that undermines simulator, market-data, or reporting trust

If profitability is only marginally positive while trust or reporting quality is weak, CTB should treat the strategy as not yet proven.

## Risk and Trust-Protection Rules

The owner should treat the strategy as requiring intervention when any of these occur:

* review-window drawdown exceeds `12%` of starting equity
* any single trading day loses more than `5%` of starting equity without a documented explanation
* repeated blocked or invalid outcomes indicate the strategy is operating outside its intended assumptions
* unresolved correctness, stale-data, or reporting-integrity issues affect the review window

These rules should override headline profitability if they indicate the evidence cannot be trusted.

## Strategy-Quality Signals

In addition to profit or loss, the owner should look for:

* stable use of one declared strategy version
* understandable reasons for emitted, skipped, blocked, and invalid outcomes
* no pattern of excessive churn, repeated stop-outs, or rule-conflict behavior
* evidence that the strategy still matches the intent defined in `docs/architecture/ctb-v1-strategy-hypothesis.md`

## Decision Outcomes

Formal strategy review should end in one of four outcomes.

### Continue current version

Choose this when:

* profitability and trust thresholds are satisfied
* no major drawdown or correctness breach occurred
* strategy behavior remains aligned with the current hypothesis

### Continue under observation

Choose this when:

* evidence is mixed but not yet invalidating
* no hard trust or drawdown threshold has been breached
* the owner wants one more review window before making a version change

### Queue a versioned strategy change

Choose this when:

* the formal review window is net negative
* results rely too heavily on one outlier day
* repeated blocked, invalid, or rule-conflict outcomes show the current strategy is mismatched to market conditions
* the strategy remains understandable, but the hypothesis needs a material rule adjustment

### Pause and investigate

Choose this when:

* trust or correctness issues make the evidence unreliable
* a drawdown or daily-loss threshold is breached
* the system cannot explain material strategy behavior

## Strategy-Switch Rules

When a strategy change is approved:

* the change must be recorded as a new strategy version
* the previous version’s review evidence must remain available for comparison
* the formal review window resets for the new version
* later promotion or governance work must treat the new version as a fresh evaluation baseline

Strategy changes must not be treated as silent parameter drift.

## Reporting and Observability Guidance

Future reporting and observability work should make these review signals visible:

* strategy version active for each report and review window
* cumulative realized and unrealized profit or loss
* current review-window drawdown
* daily-report coverage for the active window
* counts and top reasons for emitted, skipped, blocked, and invalid outcomes
* unresolved trust or anomaly flags affecting review credibility

## Explicit Exclusions

This policy does not define:

* automated strategy switching
* live-money promotion approval
* dashboard implementation details
* notification transport logic

## Downstream Reuse

Future CTB work should reuse this policy when defining:

* report contents and summary metrics
* operator-facing strategy review workflows
* observability alerts tied to drawdown, trust, or missing-evidence conditions
* promotion-readiness gates that require version-stable profitability evidence
