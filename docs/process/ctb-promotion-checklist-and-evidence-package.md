# CTB Promotion Checklist and Evidence Package

## Purpose

This document defines the final CTB promotion checklist, required evidence package, and hard boundary that keeps simulator-first success separate from unapproved live execution work.

It builds on:

* `docs/process/ctb-promotion-readiness-gates.md`
* `docs/process/ctb-promotion-governance-and-adr-workflow.md`
* `docs/process/ctb-release-readiness-gates.md`
* `docs/process/ctb-observability-dashboards-and-alerts.md`

## Checklist Goals

The final promotion checklist should:

* gather the evidence needed for a deliberate go or no-go review
* make cross-domain trust visible across simulator, reporting, validation, and governance inputs
* prevent readiness language from being mistaken for approval to build live execution
* require a clean handoff into a separately approved future program if progression is accepted

## Entry Rule

The final checklist may be used only when:

* the threshold gate has been satisfied
* the governance and ADR workflow has completed with an outcome of `Eligible for Final Promotion Checklist Review`
* the underlying evidence remains current enough to trust the review

If those conditions are not met, the checklist is not ready to be used.

## Final Promotion Checklist

Before any go or no-go promotion review, CTB should confirm:

* the reviewed simulator window still satisfies the profitability, drawdown, and evidence thresholds
* the approved strategy comparison and governance review are linked and still current
* the required ADR is complete and linked from Jira
* reporting evidence is complete enough to explain day-level performance and missing-data exceptions
* validation evidence shows no known blocker affecting simulator correctness, portfolio interpretation, or reporting trust
* observability evidence shows no unresolved critical trust issue for the reviewed operating window
* residual risks, follow-up constraints, and unresolved questions are named explicitly

Any unchecked item should block a promotion-ready conclusion.

## Evidence Package Contents

The final promotion review should use one evidence package that brings together the relevant operating history.

Minimum evidence package contents:

* threshold summary: review-window dates, profitability outcome, drawdown outcome, and any reset events
* reporting summary: daily report coverage, material anomalies, and explanation of any missing days
* validation summary: known limitations, manual substitutes for missing automation, and unresolved blockers
* observability summary: critical alerts, trust-impacting incidents, and whether reviewed periods remain trustworthy
* governance summary: strategy-comparison outcome, named approvers, approval decision, and linked ADR
* residual-risk summary: what remains uncertain even if promotion progression is accepted

The package may be lightweight, but it must be explicit enough that reviewers are not reconstructing the decision from scattered sources.

## Review Outcomes

The final promotion review should result in one of three outcomes:

* `No-Go`
* `Go for Separate Live-Money Planning Program`
* `Go with Preconditions for Separate Live-Money Planning Program`

These outcomes authorize planning posture only. They do not authorize execution delivery.

## Hard Boundary Against Unapproved Live Execution

Even a positive promotion review does not approve:

* live broker connectivity
* real-money order execution
* funding, custody, or deployment changes for live trading
* production operations for live-money workflows

Those items require:

* a separate Jira epic or program
* separate architecture scope and approval
* separate implementation stories
* separate release and operational controls

## Future Program Rule

Any future live-money initiative must be framed as a new approved program rather than as the next unchecked task in the simulator-first backlog.

That future program should begin only after:

* the promotion checklist outcome is recorded
* the linked ADR is approved
* new Jira scope is created for the live-money initiative
* architecture and operational controls for execution work are defined separately

## Reuse Rules

Future CTB promotion reviews should:

* use this document as the final checklist and evidence-package baseline
* keep the evidence package explicit and reviewable
* preserve the hard boundary between simulator success and execution implementation approval
