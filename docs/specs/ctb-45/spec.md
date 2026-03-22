# CTB-45 Spec

## Problem

CTB does not yet have a canonical market data contract that downstream ingestion, simulator, and strategy work can share safely.

Without that boundary:

* provider payload details can leak into simulator logic
* symbol and timestamp handling can drift by consumer
* later freshness, replay, and validation work will have no stable contract to target

## Goal

Define the canonical CTB market data event contract, provider abstraction boundary, and normalization rules so downstream work can ingest market data without provider-specific branching.

## Scope

This story covers:

* canonical event families and shared envelope fields
* provider adapter versus downstream consumer boundaries
* normalization rules for symbols, timestamps, price fields, and volume
* ownership and replay expectations for the market data contract

This story does not cover:

* freshness window thresholds
* duplicate suppression policy
* ingestion scheduler or persistence mechanics
* strategy rule logic

## Requirements

### Functional requirements

1. CTB must define a canonical market event envelope shared across market data consumers.
2. CTB must separate provider adapters from internal market event consumers.
3. CTB must define normalization rules for symbol identity, timestamps, prices, and volume.
4. CTB must define canonical event families for quote, trade, bar, and status data.
5. CTB must make quality classification explicit enough for later stale-data and validation work.

### Non-functional requirements

1. The contract must support deterministic replay.
2. The contract must remain provider-agnostic.
3. The contract must be narrow enough to avoid casual field sprawl.
4. The contract must be suitable for future shared TypeScript and Zod definitions.

## Success Criteria

The spec is successful when:

* downstream stories can consume one canonical market event model
* provider-specific field names are no longer needed outside adapters
* timestamp lineage is explicit enough for replay and freshness checks
* normalization rules are clear enough to support later implementation without reinterpretation

## Primary Artifact

Implementation-ready design note:

* `docs/architecture/ctb-market-data-event-contract.md`
