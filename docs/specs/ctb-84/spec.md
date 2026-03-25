# CTB-84 Spec

## Problem

CTB now has a DB-backed market-data persistence baseline, but the repo still lacks executable shared contracts, normalization rules, freshness classification, idempotency handling, and runtime ingestion logic that writes canonical history through that baseline.

## Goal

Implement the canonical market-data contract, shared schemas, normalization and freshness logic, and simulator-worker ingestion service needed to turn the CTB-45, CTB-46, and CTB-47 planning chain into executable domain code.

## Scope

This story covers:

* issue-scoped Spec Kit artifacts under `docs/specs/ctb-84`
* shared market-data TypeScript contracts in `@ctb/types`
* matching market-data Zod schemas in `@ctb/schemas`
* normalization, freshness, and idempotency helpers in `@ctb/market-data`
* simulator-worker ingestion helpers that persist accepted canonical history via the shared repository path
* automated unit tests for contract parsing, normalization, freshness, and duplicate handling

This story does not cover:

* operator-facing API endpoints or UI rendering
* live-provider credential wiring
* dashboard or page-level status presentation

## Requirements

1. Canonical market-data contracts for quote, trade, bar, and status events must exist as shared types and schemas.
2. Normalization logic must derive stable event identity, explicit quality classification, and quote-derived fields such as `midPrice`.
3. Freshness logic must classify events into CTB readiness states using timestamp lineage and session-aware thresholds.
4. Simulator-worker ingestion logic must persist accepted canonical events and duplicate or rejected decisions through `@ctb/market-data`.

## Success Criteria

The spec is successful when:

* downstream code can import one canonical market-data contract from shared workspaces
* normalization and freshness behavior are verified by automated tests
* simulator-worker market-data ingestion writes replay-ready history without duplicating canonical events

## Primary Artifacts

Domain assets:

* `packages/types/src/index.ts`
* `packages/schemas/src/index.ts`
* `packages/market-data/src/index.ts`
* `packages/market-data/src/ingestion.ts`
* `apps/simulator-worker/src/market-data.ts`
* `tests/market-data-ingestion.test.ts`
