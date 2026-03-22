# CTB Simulator Architecture and Real-Time Market Data Model

## Purpose

This document defines the initial product architecture for Crown Trade Bot as a simulator operating against real-time market data rather than live brokerage execution.

It is the implementation-ready architecture baseline for `CTB-13`.

## Architecture Goals

The initial CTB architecture should:

* simulate trading decisions against real-time or near-real-time market data
* begin with a default virtual balance of `$2000`
* preserve clean boundaries between simulator logic and future live-execution logic
* support deterministic replay and auditability of simulation runs
* provide clear inputs to daily reporting, notification, and observability workflows

## System Boundary

CTB starts as a **simulation platform**, not a live trading executor.

Included in the initial boundary:

* market data ingestion or subscription
* strategy decision input
* order simulation
* position tracking
* portfolio valuation
* realized and unrealized P&L calculation
* simulation event history
* report-ready outputs

Explicitly excluded from the initial boundary:

* live broker order placement
* custody or fund movement
* real account synchronization
* production credential handling for order execution
* broker-side reconciliation beyond future adapter design assumptions

## High-Level Domain Model

The initial simulator architecture should separate the following domains.

### 1. Market Data Domain

Owns:

* provider adapters
* quote and candle normalization
* timestamp and sequence handling
* data freshness evaluation

Responsibilities:

* ingest raw provider data
* normalize provider payloads into canonical CTB market events
* publish time-stamped market updates to the simulator domain

### 2. Strategy Input Domain

Owns:

* strategy signals or user-defined decisions
* normalized trade intent requests
* simulation constraints consumed by the execution model

Responsibilities:

* produce trade intents from strategies, rules, or manual input
* keep strategy logic separate from fill and portfolio accounting logic

### 3. Simulation Engine Domain

Owns:

* order acceptance rules
* fill simulation rules
* slippage modeling
* fees and execution assumptions
* simulation state transitions

Responsibilities:

* evaluate trade intents against portfolio state and market conditions
* simulate fills using the configured execution model
* emit immutable simulation events for downstream consumers

### 4. Portfolio and Ledger Domain

Owns:

* cash balance
* positions
* average cost basis
* realized P&L
* unrealized P&L
* portfolio valuation snapshots

Responsibilities:

* treat portfolio state as the derived result of simulation events
* provide consistent accounting outputs for reporting and notifications

### 5. Reporting Domain

Owns:

* daily portfolio summaries
* P&L breakdowns
* publishable report artifacts

Responsibilities:

* consume canonical ledger and valuation outputs
* generate report-ready snapshots without recalculating business logic independently

### 6. Notification Domain

Owns:

* owner-facing message generation
* delivery orchestration
* failure and retry status

Responsibilities:

* consume reporting and alert events
* deliver messages without owning portfolio calculations

### 7. Future Execution Adapter Domain

Owns:

* future live broker connectivity
* order translation to provider-specific formats
* execution reconciliation

Responsibilities:

* remain outside the simulator core until explicitly introduced in a future story

## Core Data Flow

The default system flow should be:

1. Market data provider emits raw updates.
2. Market data domain normalizes those updates into canonical CTB price events.
3. Strategy input domain produces a trade intent.
4. Simulation engine evaluates the trade intent using current portfolio state and configured execution assumptions.
5. Simulation engine emits simulation events such as `orderAccepted`, `fillSimulated`, `positionUpdated`, and `valuationUpdated`.
6. Portfolio and ledger domain derives balances, positions, and P&L from those events.
7. Reporting domain generates daily outputs.
8. Notification domain sends owner-facing summaries or alerts.

## Canonical Entities

The initial architecture should assume the following core entities.

### Simulation Account

Fields:

* simulation account id
* base currency
* starting balance
* current cash balance
* created timestamp
* configuration version

Default assumption:

* starting balance = `$2000`

### Market Instrument

Fields:

* instrument id
* symbol
* venue or provider symbol
* asset class
* quote currency
* trading status

### Market Tick

Fields:

* instrument id
* provider timestamp
* ingestion timestamp
* bid
* ask
* last trade price
* volume when available
* source provider id

### Trade Intent

Fields:

* trade intent id
* strategy source
* instrument id
* side
* order type
* requested quantity
* limit or stop parameters when applicable
* created timestamp

### Simulated Order

Fields:

* simulated order id
* originating trade intent id
* instrument id
* side
* requested quantity
* accepted quantity
* status
* execution model version
* submitted timestamp

### Simulated Fill

Fields:

* simulated fill id
* simulated order id
* fill quantity
* fill price
* slippage amount
* simulated fee amount
* fill timestamp

### Position

Fields:

* instrument id
* current quantity
* average entry cost
* realized P&L
* unrealized P&L
* last valuation timestamp

### Portfolio Snapshot

Fields:

* snapshot id
* cash balance
* gross exposure
* net liquidation value
* realized P&L
* unrealized P&L
* timestamp

## Market Data Model Assumptions

### Canonical event timing

CTB should distinguish:

* provider event time
* ingestion time
* simulation decision time
* simulated fill time

This allows latency analysis and deterministic replay.

### Freshness rules

Every market update should carry freshness metadata.

The simulator should classify data as:

* `fresh`
* `stale`
* `unavailable`

Trade-intent evaluation should be configurable to reject or delay execution when data is stale.

### Normalization rule

Provider-specific payloads must be normalized before reaching simulator logic.

The simulation engine should never depend directly on raw provider field names or transport formats.

## Execution and Fill Model

The simulation engine should use an explicit execution model rather than hidden assumptions.

Initial execution model assumptions:

* market orders fill using the best known executable price from the canonical market event
* configurable slippage is applied based on order side and selected model
* fees are modeled explicitly, even if initially set to zero
* partial fills are allowed by design, even if the initial implementation starts with full-fill simplifications

Execution models should be versioned so historical simulations remain interpretable.

## Portfolio Accounting Model

Portfolio accounting should be event-derived.

Rules:

* cash decreases on buy fills and increases on sell fills
* positions update only from simulated fills, not from trade intents alone
* realized P&L is recognized on closing quantity
* unrealized P&L uses the latest valid market valuation
* report generation must consume canonical portfolio outputs rather than recalculate independently

## Auditability and Replay

Replay is a first-class requirement for the simulator.

The architecture should preserve:

* normalized market events
* trade intents
* simulation decisions
* fill outputs
* portfolio snapshots
* report-generation inputs

Replay goals:

* reconstruct a simulation timeline
* explain why a simulated order was accepted or rejected
* explain how a daily report value was derived
* support debugging of strategy and reporting discrepancies

## Future Live-Trading Boundary

The simulator architecture should explicitly reserve a clean seam for future live execution without coupling current simulator behavior to broker APIs.

Design rule:

* strategies produce trade intents
* simulation engine consumes trade intents for simulated fills
* future live execution adapters will also consume trade intents, but through a separate execution boundary

This prevents simulator logic from being contaminated by broker-specific implementation concerns.

## Risks and Constraints

### Risk 1: inaccurate market timing assumptions

Mitigation:

* preserve provider and ingestion timestamps
* make freshness explicit
* document latency assumptions in the execution model

### Risk 2: reporting logic drifts from portfolio logic

Mitigation:

* keep reporting downstream of canonical portfolio snapshots
* avoid duplicate calculation paths

### Risk 3: future live execution leaks into simulator design too early

Mitigation:

* isolate future execution behind a separate domain boundary
* do not introduce live broker credentials or direct order placement into the simulator core

### Risk 4: simulation outputs cannot be explained

Mitigation:

* preserve event history
* version execution assumptions
* keep replay and auditability as non-negotiable requirements

## Recommended Next Implementation Work

The architecture in this document should directly feed:

* `CTB-45` canonical market data contract and normalization boundaries in `docs/architecture/ctb-market-data-event-contract.md`
* `CTB-46` freshness, stale-data handling, and failure visibility rules
* `CTB-47` replay-ready ingestion workflow and idempotent capture behavior
* `CTB-14` monorepo structure and domain ownership
* `CTB-15` daily P&L reporting and GitHub Pages publication design in `docs/architecture/ctb-daily-reporting-and-github-pages.md`
* `CTB-16` local notification agent design in `docs/architecture/ctb-local-notification-agent.md`
* future implementation stories for market data adapters, simulation engine, and ledger services
