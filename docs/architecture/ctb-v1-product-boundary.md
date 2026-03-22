# CTB v1 Product Boundary, Exclusions, and Operator Workflow Baseline

## Purpose

This document defines the reusable CTB v1 product boundary, success metrics, and operator workflow expectations.

It is the implementation-ready product baseline for `CTB-33`.

## Product Intent

CTB v1 exists to help one owner evaluate one trading strategy through simulator-first operation before any live-money planning is considered.

The product should give the owner:

* one supported control-plane view into simulator, strategy, and reporting state
* one stable daily review loop for judging whether the active strategy remains credible
* one explicit boundary that prevents scope creep into broker execution, public-user features, or multi-tenant administration

## Core Boundary

CTB v1 is intentionally:

* single-owner
* single-tenant
* simulator-only
* local-first for runtime and operational control
* evidence-driven for reporting, validation, and strategy review

These assumptions are mandatory defaults for downstream CTB stories unless a later Jira issue explicitly expands them.

## In-Scope Capabilities

CTB v1 should include:

* market-data ingestion and trust checks for simulator use
* one versioned strategy path that produces explainable trade decisions
* one simulator that models orders, fills, positions, portfolio value, and profit or loss
* one daily reporting flow that turns canonical simulator outputs into owner-readable evidence
* one operator-facing workflow for checking runtime health, strategy behavior, report status, and operational exceptions
* one minimal API and UI control plane for the owner to inspect supported runtime state
* one local notification path for owner-facing report and alert delivery
* one observable and reviewable operating model with explicit validation and release evidence

## Explicit Exclusions

CTB v1 must not include:

* live brokerage execution
* broker credential management for order placement
* public-user or customer-facing product flows
* multi-user collaboration, invitations, or role management
* tenant isolation or organization management
* autonomous live-money promotion decisions
* complex account recovery or enterprise authentication flows
* portfolio accounting derived independently by UI, reporting, or notification layers

## Boundary Rules

Downstream work should preserve these rules:

* simulator and reporting truth must remain canonical and reusable across API, UI, and notifications
* dynamic operator workflows and static published reports must stay separate surfaces
* owner trust is part of product scope, so failures and degraded states must be visible rather than implicit
* future live-trading concepts may be acknowledged only as extension points, not as hidden v1 requirements

## Primary Operator Workflow

The default owner workflow should remain simple and repeatable:

1. Open the CTB operator surface and confirm runtime health, latest run state, and open operational exceptions.
2. Inspect the active strategy version, recent decision behavior, and any blocked or skipped outcomes that need explanation.
3. Open the latest validated daily report and review profit or loss, drawdown, open positions, and strategy evidence.
4. Decide whether to continue the current strategy, request a follow-up investigation, or queue a versioned strategy change.
5. Review alerts or failed workflows and capture follow-up Jira work when trust, reporting, or data quality is degraded.

Planning rules for this workflow:

* the operator is always the same human owner in v1
* the workflow should optimize for clarity and low-friction daily review, not collaborative administration
* dynamic runtime inspection belongs in the control plane, while historical report consumption may use published static artifacts

## Success Metrics

CTB v1 should be judged by a small set of product-level outcomes:

* simulator runs complete reliably enough to produce daily evidence for the owner
* daily reports and operational alerts are available when expected
* strategy results can be reviewed with enough context to explain why CTB traded, skipped, or blocked
* the owner can decide whether to continue or revise the strategy without consulting raw logs or database tables
* downstream implementation work can state whether a feature is inside or outside the v1 boundary without re-defining the product

## Product Health Signals

Planning-level product health should be visible through:

* simulation completion rate across expected trading days
* daily report availability and validation status
* unresolved critical issues that undermine simulator, reporting, or strategy trust
* strategy-version-attributed performance evidence
* operator time-to-understand current system state from the supported UI and reports

## Downstream Reuse

Future CTB stories should reuse this document when they need to answer:

* whether a requested feature belongs in CTB v1
* whether a workflow belongs in the dynamic operator control plane or the static reporting surface
* whether a new requirement introduces multi-user, public-user, or live-money scope that should be split into later work

This baseline should directly inform:

* `CTB-34` strategy-hypothesis planning
* `CTB-35` profitability-review and strategy-switch planning
* `CTB-51` through `CTB-53` API and operator-UI delivery
