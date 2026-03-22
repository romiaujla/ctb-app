# CTB-58 Spec

## Problem

CTB does not yet define one explicit local notification worker path for turning canonical notification events into owner-facing delivery from the Mac mini runtime.

## Goal

Define the local notification worker responsibilities, execution flow, and local-delivery boundaries for CTB report delivery, operational failure alerts, and major profit-and-loss signals.

## Scope

This story covers:

* worker responsibilities for report, failure, and P&L-triggered notifications
* local-worker execution flow from canonical event intake through transport dispatch
* retry, dedupe, and delivery-evidence behavior at the worker boundary
* Mac mini local-runtime assumptions for owner-operated delivery

This story does not cover:

* iMessage UI scripting
* public alert subscriptions
* transport-provider-specific implementation details

## Requirements

1. CTB must define explicit local notification worker responsibilities for report delivery, failure alerts, and major P&L-triggered messages.
2. CTB must keep delivery local-worker-based and aligned with the v1 owner-operated Mac mini model.
3. CTB must keep transport logic downstream of canonical notification events and worker policy decisions.
4. CTB must plan worker behavior with retry, dedupe, and delivery-evidence requirements in mind.
5. CTB must make the worker execution path concrete enough to guide later implementation and integration testing.

## Success Criteria

The spec is successful when:

* later implementation can build one explicit notification-worker flow without mixing in business logic from simulator or reporting
* local-delivery assumptions are concrete enough to prevent drift toward unsupported cloud-notification patterns
* integration and validation stories can target clear worker responsibilities and handoff points

## Primary Artifact

Implementation-ready design note update:

* `docs/architecture/ctb-local-notification-agent.md`
