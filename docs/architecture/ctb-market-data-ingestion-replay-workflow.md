# CTB Replay-Ready Market Data Ingestion Workflow

## Purpose

This document defines the CTB market data ingestion workflow, idempotent capture model, replay-ready retention intent, and validation stages for canonical market events.

It is the implementation-ready architecture baseline for `CTB-47`.

## Context

`CTB-45` defined the canonical market event contract, and `CTB-46` defined freshness and failure-visibility rules. CTB now needs a repeatable ingestion workflow that can fetch, normalize, validate, retain, and replay market data without duplicate or ambiguous state.

## Decision

CTB will treat market-data ingestion as a staged pipeline with explicit handoff points:

1. provider fetch or subscription receive
2. raw payload capture
3. adapter normalization into canonical events
4. schema and quality validation
5. idempotency and duplicate evaluation
6. canonical event persistence
7. replay and downstream consumption exposure

Each stage should record enough metadata to explain how an event entered the system, whether it was accepted, and what canonical form downstream consumers relied on.

## Domain Boundaries

### Edge ingestion

Owns:

* provider polling or subscription reads
* retryable transport errors
* raw payload capture timing

### Canonical ingestion pipeline

Owns:

* normalization
* freshness and quality validation
* idempotency checks
* canonical persistence decisions

### Replay surface

Owns:

* historical retrieval of canonical events
* event ordering metadata
* auditability for simulation and strategy debugging

Does not own:

* strategy decisions
* report generation
* notification delivery

## Contracts and Interfaces

### Raw payload record

CTB should retain a raw-ingest record when feasible with:

* provider id
* fetch or receive timestamp
* provider payload reference
* ingest attempt id
* adapter version

### Canonical acceptance record

Each accepted canonical event should include:

* canonical event id
* ingest batch or stream correlation id
* normalization version
* freshness evaluation outcome
* idempotency key or duplicate classification
* persistence timestamp

### Replay query surface

Replay consumers should be able to ask for:

* events by instrument
* events by time range
* events by event family
* events by ingest batch or run

## Ingestion Workflow Stages

### Stage 1: Receive

Capture provider payloads and assign receive metadata.

### Stage 2: Normalize

Map raw payloads to the CTB canonical market event contract.

### Stage 3: Validate

Run schema and timestamp validation plus freshness classification.

### Stage 4: Deduplicate

Use explicit idempotency keys so repeated fetches or reconnects do not create ambiguous history.

### Stage 5: Persist

Persist accepted canonical events and supporting ingest metadata in replay-safe order.

### Stage 6: Expose

Make accepted canonical events available to simulator and strategy workflows through one trusted history.

## Idempotency and Duplicate Handling

CTB should define idempotency around a deterministic key derived from:

* provider
* provider event identity when available
* canonical instrument
* event family
* canonical event time window

Rules:

* duplicate raw receives should not create duplicate canonical history
* duplicates should be visible diagnostically
* updates that materially change canonical truth must be versioned or superseded explicitly rather than silently overwritten

## Replay-Ready Retention Intent

Replay storage should preserve enough evidence to:

* reconstruct accepted canonical history
* explain event ordering
* identify dropped or duplicate events
* trace a canonical event back to its ingest source and normalization version

Retention priorities:

* canonical accepted events are mandatory
* raw payload retention is strongly preferred when operationally feasible
* duplicate and rejected-event metadata should be retained at least long enough for debugging and validation

## Data-Quality Validation Path

Validation should occur before canonical persistence is treated as trusted downstream history.

Required checks:

* schema validity
* timestamp lineage integrity
* freshness policy outcome
* duplicate classification
* required instrument identity mapping

Recommended validation layers for implementation:

* unit tests for normalization and idempotency helpers
* integration tests for ingest-stage handoffs
* contract checks for canonical event schemas
* replay-oriented scenario tests for duplicate and out-of-order inputs

## Rollout Constraints

This story defines workflow intent, not final infrastructure.

Do not lock in here:

* queue technology
* storage engine
* worker scheduling cadence
* retention duration policy

This workflow should feed:

* future `apps/simulator-worker` design and implementation
* replay-driven simulator validation
* strategy input history assumptions in `CTB-48`

## Risks

### Risk 1: duplicate events create ambiguous simulator history

Mitigation:

* explicit idempotency keys
* visible duplicate classification

### Risk 2: replay history cannot explain why an event was accepted or rejected

Mitigation:

* persist ingest and validation metadata with canonical events
* retain raw references where feasible

### Risk 3: downstream consumers introduce alternate market-data sources

Mitigation:

* define the canonical replay surface as the trusted history source
* require simulator and strategy workflows to consume it

## Open Questions

* Polling cadence and subscription mode can be finalized later.
* Raw payload retention depth can be tuned when storage and debugging needs are better known.

## Approvals

Approval focus:

* ingestion-stage completeness
* replay and idempotency traceability
* validation layering sufficiency for future implementation

## Recommended Next Implementation Work

This document should directly feed:

* `CTB-48` strategy input contracts built on replay-safe canonical history
* simulator-worker implementation stories
* historical-correctness validation scenarios

Related follow-on baseline:

* `docs/architecture/ctb-strategy-input-contract.md`
