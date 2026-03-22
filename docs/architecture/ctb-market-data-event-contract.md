# CTB Market Data Event Contract and Normalization Boundary

## Purpose

This document defines the canonical CTB market data event contract, provider abstraction model, and normalization boundaries for simulator-first market ingestion.

It is the implementation-ready architecture baseline for `CTB-45`.

## Context

CTB needs a stable market event contract before market data ingestion can support the simulator and strategy engine without leaking provider-specific payload details into downstream domains.

The simulator architecture already establishes that:

* provider adapters belong to the market data domain
* simulator logic must consume canonical market events only
* freshness metadata and replayability are first-class requirements

This document narrows that architecture into the concrete contract boundary that downstream ingestion, strategy-input, and validation work must inherit.

## Decision

CTB will standardize market ingestion around a canonical `MarketDataEvent` contract owned by `packages/market-data` and shared through `packages/types` and `packages/schemas` when the repo bootstrap work creates those workspaces.

The design rules are:

* providers emit raw payloads into edge adapters only
* adapters normalize raw payloads into canonical CTB market events before any simulator or strategy consumption
* downstream domains may use canonical fields, metadata, and quality annotations, but may not depend on raw provider field names
* normalization is deterministic, replay-safe, and explicit about symbol, timestamp, price, and volume transformations
* unknown provider fields stay in adapter-local raw records or debug metadata rather than expanding the canonical contract casually

## Domain Boundaries

### Provider adapter boundary

Owns:

* provider authentication and transport details
* raw payload capture
* provider-specific parsing
* provider symbol and field mapping

Must not own:

* simulator decisions
* strategy input derivation
* portfolio calculations

### Canonical market event boundary

Owns:

* normalized instrument identity
* normalized market price fields
* timestamp lineage
* event type and source metadata
* quality and freshness annotations

Consumers may rely on:

* canonical field names
* explicit nullability rules
* event-type semantics
* freshness and validation outcomes

Consumers may not rely on:

* provider payload shape
* transport-specific sequence formats
* venue-specific symbol conventions unless mapped into canonical metadata

### Downstream consumer boundary

The simulator and strategy layers should consume canonical market events through shared contracts only.

They may derive:

* best executable price
* latest valuation input
* time-window analytics
* strategy features built from canonical history

They must not:

* parse raw provider payloads directly
* branch on provider identity for normal operation
* reinterpret timestamps or symbols inconsistently across domains

## Contracts and Interfaces

### Canonical event families

CTB should support a small set of canonical market event families:

* `quote`
* `trade`
* `bar`
* `status`

The canonical contract should use one shared envelope plus event-family-specific payload fields.

### Canonical envelope

Every market event should contain:

* `eventId`: stable event identifier for replay and deduplication
* `eventType`: `quote`, `trade`, `bar`, or `status`
* `instrumentId`: CTB canonical instrument identifier
* `symbol`: normalized display symbol used across CTB
* `provider`: provider identifier such as `polygon`, `alpaca`, or future equivalents
* `providerEventId`: optional provider-native identifier when available
* `providerTimestamp`: event time reported by the provider
* `observedTimestamp`: time CTB received the raw payload
* `normalizedTimestamp`: timestamp CTB assigns to the canonical event for ordering and replay
* `sessionState`: market session classification such as `preMarket`, `regular`, `afterHours`, or `closed`
* `quality`: quality classification such as `valid`, `partial`, `stale`, or `invalid`
* `sourceLatencyMs`: optional latency measurement derived from provider and observed timestamps
* `rawReference`: pointer or correlation id for the raw payload record when retained
* `normalizationVersion`: version string for the mapping rules used

### Quote payload

Canonical quote events should contain:

* `bidPrice`
* `askPrice`
* `bidSize`
* `askSize`
* `midPrice`: derived when both bid and ask are present
* `lastTradePrice`: optional carry-through when bundled by the provider

### Trade payload

Canonical trade events should contain:

* `tradePrice`
* `tradeSize`
* `tradeCondition`: optional normalized classification
* `exchange`: optional normalized venue code

### Bar payload

Canonical bar events should contain:

* `open`
* `high`
* `low`
* `close`
* `volume`
* `vwap`: optional when provided or safely derivable
* `barStartTimestamp`
* `barEndTimestamp`
* `barResolution`

### Status payload

Canonical status events should contain:

* `tradingStatus`
* `haltReason`: optional
* `tradable`: boolean

### Validation schema expectations

Downstream implementation should provide:

* shared TypeScript types in `packages/types`
* Zod schemas in `packages/schemas`
* normalization helpers in `packages/market-data`

External inputs must validate before simulator or strategy logic consumes them.

## Normalization Rules

### Symbol normalization

CTB should distinguish:

* provider symbol
* canonical symbol
* canonical instrument id

Rules:

* provider adapters may accept provider-native symbols
* canonical events must emit a normalized display symbol such as `AAPL`
* instrument identity should not depend on event-family-specific fields
* symbol mapping rules must be versioned when provider coverage expands

### Timestamp normalization

CTB must preserve three distinct times:

* provider event time
* observed ingestion time
* normalized ordering time

Rules:

* provider timestamps remain immutable once parsed
* observed timestamps are assigned by CTB at ingest time
* normalized timestamps are used for deterministic ordering and replay
* later stories may reject stale events, but they must not erase timestamp lineage

### Price normalization

Rules:

* all prices use decimal-safe numeric handling in implementation
* price fields must preserve the semantic meaning of the source event
* quote-derived values such as `midPrice` are marked as derived, not raw
* simulator fill logic should choose executable prices from the appropriate canonical event family rather than from provider-specific fallbacks

### Volume normalization

Rules:

* preserve provider volume when available
* treat missing volume explicitly as `null` rather than `0`
* distinguish trade size from aggregate bar volume
* do not fabricate volume values during normalization

### Nullability and partial data

Rules:

* canonical events may be `partial` when required fields for the event family are incomplete but still diagnostically useful
* events must be `invalid` when they fail schema requirements for safe downstream consumption
* partial or invalid classification belongs in `quality`, not in hidden adapter behavior

## Replay and Ownership Expectations

The market data domain owns:

* the raw-to-canonical mapping logic
* normalization versioning
* quality annotations attached during normalization

Replay expectations:

* a normalized event must be reproducible from retained raw payload and normalization version
* downstream consumers should be able to reconstruct event order from canonical timestamps and event ids
* duplicate suppression and freshness policy are deferred to follow-on stories, but this contract must support both without structural change

## Rollout Constraints

This contract should land before:

* freshness guardrails in `CTB-46`
* replay-ready ingestion flow in `CTB-47`
* strategy input contract work in `CTB-48`

Implementation constraints:

* do not bootstrap provider SDK choice into the shared contract
* do not let raw payload retention requirements block the canonical contract shape
* keep the contract narrow enough to support multiple providers without provider-flag branching

## Risks

### Risk 1: canonical contract grows around one provider

Mitigation:

* isolate provider-specific fields in adapter-local raw payload records
* require explicit review before adding new top-level canonical fields

### Risk 2: timestamps become ambiguous across replay and runtime

Mitigation:

* preserve provider, observed, and normalized timestamps separately
* document their downstream usage clearly

### Risk 3: strategy and simulator consumers reintroduce provider coupling

Mitigation:

* expose canonical schemas from shared packages only
* ban direct raw-payload usage outside adapter boundaries

## Open Questions

* Which provider will be implemented first remains intentionally flexible.
* Raw payload retention depth and storage format can be finalized in `CTB-47`.
* Exchange and condition-code normalization may need a small controlled vocabulary once a concrete provider is chosen.

## Approvals

Approval requirements:

* solution architecture review for the canonical contract boundary
* implementation review for shared schema and package placement once repo bootstrap begins

Human approval is recommended before widening the event families beyond the four listed here.

## Recommended Next Implementation Work

This document should directly feed:

* `CTB-46` freshness, stale-data handling, and failure visibility rules
* `CTB-47` replay-ready ingestion workflow and idempotent capture behavior
* `CTB-48` strategy input contracts that consume canonical market events only

Related follow-on baseline:

* `docs/architecture/ctb-market-data-freshness-and-failure-visibility.md`
