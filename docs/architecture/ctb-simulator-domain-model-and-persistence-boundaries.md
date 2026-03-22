# CTB Simulator Domain Model and Persistence Boundaries

## Purpose

This document defines the canonical CTB simulator domain model, simulator event contract boundary, and persistence ownership rules for simulator-first implementation.

It is the implementation-ready architecture baseline for `CTB-42`.

## Context

`CTB-13` established the top-level simulator architecture and identified the core domains, but downstream implementation still needs one explicit simulator-domain baseline that defines what the simulator owns as canonical truth.

This document narrows that architecture into a reusable planning contract for:

* canonical simulator entities
* simulator event families and shared metadata
* schema ownership intent for future packages
* persistence boundaries between simulator truth and downstream read models

## Decision

CTB will treat the simulator core as the sole owner of canonical trading-state truth. Future implementation should centralize the model in `packages/simulator-core` and expose shared types and schemas through `packages/types` and `packages/schemas`.

The design rules are:

* simulator truth is recorded as immutable facts plus explicit derived snapshots
* downstream domains consume simulator truth but must not redefine core simulator entities independently
* event contracts stay canonical and simulator-owned even when published to workers or APIs
* persistence separates immutable event history from derived operational views
* raw provider payloads, reporting artifacts, and notification delivery state remain outside the simulator truth boundary

## Domain Boundaries

### Simulator core boundary

Owns:

* simulation accounts
* orders and fills
* positions and portfolio snapshots
* simulator event history
* execution and valuation metadata needed to explain state transitions

Must not own:

* provider-specific raw market payloads
* rendered reports
* notification transport state
* future live-broker credentials or broker reconciliation state

### Downstream consumer boundary

Reporting, notification, observability, and API layers may consume canonical simulator truth to produce downstream outputs.

They may derive:

* report artifacts
* user-facing summaries
* dashboards and alerts
* operational read models

They must not:

* create alternative definitions of cash, position, order, or fill entities
* patch canonical simulator truth by writing directly into simulator-owned records
* recompute business truth from raw market payloads when canonical simulator records already exist

## Canonical Entity Set

The simulator domain should use the following canonical entities.

### Simulation account

Purpose:

* identifies one simulator ledger context and its configuration boundary

Core fields:

* `simulationAccountId`
* `baseCurrency`
* `startingBalance`
* `currentCashBalance`
* `status`
* `createdTimestamp`
* `configurationVersion`

### Portfolio

Purpose:

* represents the active holdings and aggregate financial state for a simulation account

Core fields:

* `portfolioId`
* `simulationAccountId`
* `netLiquidationValue`
* `grossExposure`
* `realizedPnl`
* `unrealizedPnl`
* `valuationTimestamp`

### Position

Purpose:

* represents the current holdings for one instrument derived from accepted fills

Core fields:

* `positionId`
* `simulationAccountId`
* `instrumentId`
* `quantity`
* `averageEntryCost`
* `marketValue`
* `realizedPnl`
* `unrealizedPnl`
* `lastUpdatedTimestamp`

### Simulated order

Purpose:

* records the accepted request boundary between trade intent and fill activity

Core fields:

* `simulatedOrderId`
* `simulationAccountId`
* `tradeIntentId`
* `instrumentId`
* `side`
* `orderType`
* `requestedQuantity`
* `acceptedQuantity`
* `status`
* `submittedTimestamp`
* `executionModelVersion`

### Simulated fill

Purpose:

* records executed quantity, price, fees, and timestamps used by the accounting model

Core fields:

* `simulatedFillId`
* `simulatedOrderId`
* `simulationAccountId`
* `instrumentId`
* `fillQuantity`
* `fillPrice`
* `simulatedFeeAmount`
* `slippageAmount`
* `fillTimestamp`

### Portfolio snapshot

Purpose:

* records a point-in-time derived financial view used for reporting, replay inspection, and auditability

Core fields:

* `snapshotId`
* `simulationAccountId`
* `cashBalance`
* `grossExposure`
* `netLiquidationValue`
* `realizedPnl`
* `unrealizedPnl`
* `timestamp`

### Simulator event

Purpose:

* captures immutable facts that explain why simulator state changed

Core fields:

* `simulatorEventId`
* `simulationAccountId`
* `eventType`
* `eventTimestamp`
* `sequenceKey`
* `correlationId`
* `causationId`
* `payload`
* `schemaVersion`

## Simulator Event Contract

The simulator event model should use one canonical envelope shared across simulator-owned event families.

Every simulator event should include:

* `simulatorEventId`: stable identifier for replay and traceability
* `simulationAccountId`: owning ledger context
* `eventType`: canonical simulator event classification
* `eventTimestamp`: business timestamp of the event
* `recordedTimestamp`: timestamp when CTB persisted the event
* `sequenceKey`: deterministic ordering field within the simulation account context
* `correlationId`: links related events across a single workflow
* `causationId`: references the immediate prior event or command when known
* `schemaVersion`: contract version for payload interpretation
* `payload`: event-family-specific fact data

### Canonical event families

The simulator should support a narrow, explicit event set such as:

* `tradeIntentAccepted`
* `tradeIntentRejected`
* `orderSubmitted`
* `orderPartiallyFilled`
* `orderFilled`
* `orderCanceled`
* `positionRevalued`
* `portfolioSnapshotted`
* `accountAdjusted`

Future stories may refine event names, but they must preserve one canonical envelope and simulator-owned semantics.

## Schema Ownership Expectations

Downstream implementation should align packages as follows:

* `packages/types`: shared TypeScript interfaces and enums for simulator entities and event families
* `packages/schemas`: Zod validation schemas for external inputs and persisted simulator records where validation is required
* `packages/simulator-core`: entity invariants, state-transition logic, and derived-state rules

Rules:

* external or cross-package inputs validate before simulator business logic consumes them
* shared contracts are defined once and reused rather than copied per consumer
* downstream packages may add projection-specific shapes, but they must map from canonical simulator entities instead of replacing them

## Persistence Boundaries

### Canonical persistence

Simulator-owned persistence should store:

* immutable simulator event history
* current order and fill records
* current positions
* portfolio snapshots
* account-level configuration and status

This boundary represents canonical simulator truth.

### Derived persistence

Downstream domains may store:

* read-optimized report inputs
* notification delivery records
* observability summaries
* API-facing query models

These stores are derived consumers of simulator truth and must be replaceable from canonical simulator records when needed.

### Boundary rules

Rules:

* immutable event history is the audit foundation for simulator truth
* snapshots accelerate reads and reporting, but do not replace event-history explainability
* downstream projections must not become the source of truth for portfolio state
* provider raw data persistence remains in the market-data boundary, not the simulator-core boundary

## Risks and Constraints

### Risk 1: parallel simulator models emerge

Mitigation:

* define one canonical entity set
* require downstream consumers to map from simulator truth rather than redefine it

### Risk 2: persistence ownership drifts across domains

Mitigation:

* distinguish canonical persistence from derived projections
* keep report and notification state outside the simulator-owned model

### Risk 3: contract sprawl weakens future implementation

Mitigation:

* keep the event-family set narrow
* centralize shared types and schemas
* defer physical storage mechanics to later build stories

## Recommended Next Implementation Work

This baseline should directly feed:

* `CTB-43` for the accounting model, event-history relationship, and portfolio-state derivation rules
* `CTB-44` for determinism, replay-safe processing, and correctness-focused testing expectations
* future simulator-core package implementation in `packages/simulator-core`
* future API, reporting, and notification work that consumes canonical simulator truth
