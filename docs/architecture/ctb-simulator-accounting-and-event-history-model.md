# CTB Simulator Accounting and Event-History Model

## Purpose

This document defines the canonical CTB simulator accounting model, the relationship between immutable event history and derived portfolio state, and the downstream accounting outputs that other CTB domains may trust.

It is the implementation-ready architecture baseline for `CTB-43`.

## Context

`CTB-42` established the canonical simulator entity set and persistence boundaries, but future implementation still needs one explicit accounting baseline that defines how the simulator ledger should behave across orders, fills, positions, and snapshots.

This document narrows the simulator domain model into a reusable planning contract for:

* simulation account and ledger responsibilities
* accounting records for orders, fills, positions, and snapshots
* event-history-derived portfolio state
* downstream trust boundaries for reporting, notification, and API consumers

## Decision

CTB will treat simulator accounting as event-derived ledger behavior owned by the simulator core. Immutable event history explains what happened, while positions and portfolio snapshots provide explicit derived state for current operations and downstream consumers.

The design rules are:

* fills, not trade intents alone, change balances and positions
* event history is the explanation path for accounting changes
* positions and portfolio snapshots are derived accounting views, not independent sources of truth
* reporting and notification consumers rely on canonical accounting outputs rather than recalculating portfolio logic
* the simulator account boundary keeps cash, exposure, and P&L responsibilities within one owned ledger model

## Accounting Responsibilities

### Simulation account

Owns:

* base currency and starting balance
* current cash balance
* account-level status and configuration version
* the ledger context for all related orders, fills, positions, and snapshots

Rules:

* one simulation account owns one accounting timeline
* account state must be explainable from immutable events and accepted derived updates

### Ledger and event history

Owns:

* immutable accounting facts
* the causal sequence of order, fill, valuation, and adjustment events
* the explanation path for current and historical state

Rules:

* the ledger records facts rather than patched balances
* any balance, position, or P&L change must be explainable from ledger history
* later consumers must prefer canonical ledger-backed outputs over locally reconstructed arithmetic

## Accounting Record Model

### Orders

Orders represent accepted execution requests.

They should capture:

* requested quantity and side
* accepted quantity and current status
* submission time and execution-model version
* linkage to the originating trade intent and later fills

Rules:

* order acceptance alone does not change cash or position quantities
* order status transitions must remain traceable through event history

### Fills

Fills represent executed quantity and are the primary accounting trigger.

They should capture:

* executed quantity
* execution price
* simulated fees
* modeled slippage
* fill timestamp

Rules:

* buy fills decrease cash and increase owned quantity
* sell fills increase cash and decrease owned quantity
* fills are the only normal path that mutates quantity ownership
* fee and slippage effects must remain explicit rather than hidden in aggregate balances

### Positions

Positions represent current holdings for one instrument.

They should capture:

* current quantity
* average entry cost
* realized P&L attributed to closed quantity
* unrealized P&L from latest trusted valuation
* last valuation timestamp

Rules:

* positions are derived from fill history plus valuation updates
* positions must not advance from trade intents or order submission alone
* realized and unrealized P&L must remain distinguishable

### Portfolio snapshots

Portfolio snapshots provide explicit derived portfolio state for downstream consumers.

They should capture:

* cash balance
* gross exposure
* net liquidation value
* realized P&L
* unrealized P&L
* snapshot timestamp

Rules:

* snapshots summarize state at a point in time
* snapshots accelerate reads and explainability, but do not replace ledger history
* downstream consumers may trust snapshots as canonical derived outputs when they remain traceable to ledger events

## Event History to Derived State

The simulator accounting model should treat event history as the source explanation path and derived state as the operational view.

### Required derivation path

The accounting path should follow this sequence:

1. trade intent is accepted or rejected
2. accepted intent produces an order record
3. fill events record executed quantity, price, fees, and timing
4. position state updates from the accepted fill history
5. valuation events update unrealized P&L and market value
6. portfolio snapshots summarize the resulting account and position state

### Derivation rules

Rules:

* current cash balance derives from the starting balance plus adjustments, fees, and fill outcomes
* positions derive from fill activity and valuation updates
* realized P&L derives from closing fills against the relevant open quantity basis
* unrealized P&L derives from current holdings against the latest trusted valuation
* portfolio-level metrics derive from canonical position and cash outputs rather than ad hoc downstream arithmetic

## Downstream Trust Boundary

Reporting, notification, observability, and API consumers may rely on:

* account cash balance
* position state
* realized and unrealized P&L
* portfolio snapshots
* ledger-backed event references used for explanation

They must not:

* compute competing position or P&L truth from raw fills without the simulator-core rules
* bypass canonical accounting outputs by stitching together local data shortcuts
* overwrite simulator-owned accounting records to satisfy presentation concerns

## Accounting Invariants

Future implementation and validation work should preserve the following invariants.

### Invariant 1: fills drive quantity ownership

Position quantity changes only from accepted fill records and explicit account adjustments.

### Invariant 2: event history explains derived state

Current balances, positions, and portfolio snapshots must remain explainable from canonical event history.

### Invariant 3: reporting stays downstream of simulator truth

Reporting and notification flows consume canonical accounting outputs and do not recreate business logic independently.

### Invariant 4: P&L categories remain explicit

Realized and unrealized P&L remain separate so downstream artifacts do not blur closed gains with current valuation changes.

## Risks and Constraints

### Risk 1: accounting logic leaks into downstream consumers

Mitigation:

* define explicit downstream trust boundaries
* keep portfolio and P&L logic inside the simulator-core accounting model

### Risk 2: derived state loses its audit trail

Mitigation:

* preserve ledger-backed event history as the explanation path
* require snapshots and positions to remain derivable from canonical facts

### Risk 3: order and fill semantics become ambiguous

Mitigation:

* distinguish accepted orders from executed fills
* treat fills as the normal trigger for accounting changes

## Recommended Next Implementation Work

This baseline should directly feed:

* `CTB-44` for determinism, replay-safe processing, and correctness-focused simulator validation expectations
* future `packages/simulator-core` implementation for accounting and derived-state behavior
* future reporting and notification stories that consume canonical simulator accounting outputs
