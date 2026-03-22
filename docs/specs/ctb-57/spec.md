# CTB-57 Spec

## Problem

CTB does not yet define one canonical notification event and delivery model, which would make owner-facing alerts inconsistent and harder to audit as simulator, reporting, and local delivery evolve.

## Goal

Define canonical notification events, message classes, delivery evidence expectations, and retry or dedupe policy for CTB local notification workflows.

## Scope

This story covers:

* canonical notification event classes for report delivery, failures, and major P&L alerts
* owner-facing message classes and message-shaping boundaries
* delivery evidence and audit expectations
* retry, suppression, and dedupe intent at a planning level

This story does not cover:

* cloud push infrastructure
* public notification delivery
* recalculating simulator or reporting metrics inside notification logic

## Requirements

1. CTB must define canonical notification event classes for report delivery, failures, and major P&L alerts.
2. CTB must keep notification logic downstream of simulator and reporting truth.
3. CTB must define delivery evidence and audit expectations for notification attempts and outcomes.
4. CTB must define retry and dedupe intent clearly enough to avoid noisy or duplicate alerts.
5. CTB must preserve the separation between canonical notification events and transport-specific behavior.

## Success Criteria

The spec is successful when:

* later notification-worker implementation can consume one explicit event model
* delivery evidence is concrete enough for observability and audit follow-on work
* retry and dedupe behavior can be implemented without inventing new alert semantics

## Primary Artifact

Implementation-ready design note update:

* `docs/architecture/ctb-local-notification-agent.md`
