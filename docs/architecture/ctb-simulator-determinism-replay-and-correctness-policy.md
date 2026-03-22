# CTB Simulator Determinism, Replay, and Correctness Policy

## Purpose

This document defines the CTB simulator-core confidence policy for deterministic behavior, replay-safe event processing, and correctness-focused validation.

It is the implementation-ready architecture baseline for `CTB-44`.

## Context

`CTB-42` defined the canonical simulator domain model and `CTB-43` defined the accounting and event-history relationship. Future implementation now needs one explicit policy that states what it means for the simulator core to be trustworthy across repeat execution, replay, debugging, and validation.

This document narrows that trust requirement into a reusable planning contract for:

* deterministic state-transition rules
* replay-safe processing expectations
* debugging and auditability requirements
* correctness-focused validation priorities

## Decision

CTB will treat determinism, replayability, and explainability as first-class simulator-core requirements rather than as optional diagnostics. Future implementation should preserve enough event lineage, ordering discipline, and validation depth that repeated execution over the same accepted inputs can be explained and trusted.

The design rules are:

* accepted inputs and recorded events must produce deterministic simulator state transitions
* replay must reconstruct equivalent accounting and portfolio outcomes from canonical history
* event lineage must remain explicit enough to explain why an outcome occurred
* correctness-focused tests take precedence over convenience tests that only exercise incidental code paths
* performance optimizations must not weaken auditability or reproducibility

## Deterministic Processing Rules

### Rule 1: ordering is explicit

Simulator processing should use an explicit ordering model within a simulation-account context.

The ordering model should preserve:

* event timestamp lineage
* deterministic sequence keys when timestamps alone are insufficient
* stable tie-break behavior for events that arrive with the same business time

### Rule 2: state transitions are pure relative to accepted inputs

Given the same accepted canonical inputs, configuration version, and execution-model assumptions, simulator state transitions should produce equivalent accounting outcomes.

This applies to:

* cash balance changes
* order and fill status outcomes
* position quantities and cost basis
* realized and unrealized P&L
* portfolio snapshot summaries

### Rule 3: hidden mutable shortcuts are not allowed

Future implementation should avoid hidden mutations that make state transitions difficult to reproduce.

This means:

* side effects must not silently rewrite canonical history
* derived views must remain regenerable from canonical records
* convenience caches must not become untracked truth

## Replay-Safe Processing Expectations

### Canonical replay source

Replay should consume canonical simulator history rather than downstream projections.

The canonical replay source should include:

* accepted simulator events
* order and fill records
* valuation inputs required for unrealized P&L
* configuration and execution-model version identifiers

### Replay guarantees

Replay workflows should be able to:

* reconstruct a simulation timeline
* explain why an order was accepted, rejected, filled, or canceled
* regenerate equivalent position and portfolio outcomes
* support comparison between original and replayed outcomes when investigating anomalies

### Replay boundary rules

Rules:

* replay must not depend on presentation-layer artifacts
* replay should tolerate derived projection rebuilds because canonical history remains authoritative
* replay should surface any missing lineage or ordering ambiguity as a correctness problem rather than hiding it

## Debugging and Auditability Requirements

Future implementation should preserve enough evidence to answer:

* what inputs were accepted
* what ordering rules were applied
* what event or decision caused a state change
* what configuration or execution-model version governed the result
* how a reported portfolio value was derived

Required evidence categories:

* canonical event identifiers
* correlation and causation links where available
* configuration and execution-model version references
* timestamps needed to reconstruct processing order
* references from derived snapshots back to canonical accounting history

## Correctness-Focused Validation Priorities

Future validation should prioritize simulator trust properties over incidental implementation details.

### Priority 1: accounting correctness

Tests should verify:

* fills change cash and quantity correctly
* positions and P&L derive from canonical fill and valuation history
* derived portfolio snapshots stay consistent with ledger-backed state

### Priority 2: deterministic outcomes

Tests should verify:

* repeated processing of the same accepted inputs yields equivalent outputs
* ordering tie-break rules remain stable
* configuration-version changes are explicit rather than implicit

### Priority 3: replay explainability

Tests should verify:

* replay reconstructs equivalent portfolio outcomes
* missing lineage or corrupted ordering is surfaced clearly
* debugging evidence remains sufficient to explain state transitions

### Priority 4: edge and failure conditions

Tests should verify:

* partial fills and cancellations preserve accounting integrity
* stale or incomplete upstream inputs fail in visible and explainable ways when later policies require that behavior
* projection rebuilds do not change canonical accounting truth

## Downstream Trust Boundary

Reporting, notification, observability, and API consumers inherit trust from simulator-core outputs only when those outputs preserve deterministic and replay-safe behavior.

Downstream consumers may assume:

* canonical portfolio outputs are explainable from simulator history
* accounting outcomes are reproducible under equivalent accepted inputs
* derived projections can be rebuilt without changing business truth

They must not assume:

* unexplained deviations are acceptable if outputs look plausible
* downstream caches or projections can replace canonical replay sources
* simulator correctness can be inferred solely from report or notification artifacts

## Risks and Constraints

### Risk 1: nondeterministic ordering produces inconsistent outcomes

Mitigation:

* require explicit sequence behavior and stable tie-break rules
* preserve configuration and execution-model version references

### Risk 2: replay loses explanatory power

Mitigation:

* keep canonical history authoritative
* require lineage and timestamp preservation
* surface ambiguity as a correctness issue

### Risk 3: tests optimize for coverage without protecting trust

Mitigation:

* prioritize accounting, determinism, replay, and edge-condition validation
* keep auditability expectations explicit in the architecture baseline

## Recommended Next Implementation Work

This baseline should directly feed:

* future `packages/simulator-core` implementation for deterministic state transitions and replay-safe accounting behavior
* future simulator validation and integration-test work for correctness-focused evidence
* downstream reporting and notification stories that rely on trustworthy simulator outputs
