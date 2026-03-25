# CTB-82 Spec

## Problem

CTB has planning guidance for canonical market-data contracts, freshness policy, and replay-safe ingestion, but the executable repo still lacks durable storage for raw ingest evidence, canonical accepted events, and duplicate or rejection history.

Without a persistence layer:

* replay-ready market history cannot be queried from one trusted source
* duplicate and rejection decisions are not auditable
* later runtime and operator-surface work has no durable market-data foundation

## Goal

Implement the DB-layer persistence model, repository code, and automated tests needed to store replay-ready market-data ingest history for the CTB-45, CTB-46, and CTB-47 planning chain.

## Scope

This story covers:

* issue-scoped Spec Kit artifacts under `docs/specs/ctb-82`
* Prisma models and migration assets for market-data ingest attempts, raw records, canonical events, and ingest decisions
* one shared market-data persistence package for DB-backed write and query behavior
* automated tests for durable persistence and replay-oriented retrieval

This story does not cover:

* canonical normalization or freshness policy logic
* simulator-worker ingest orchestration
* operator API or web UI rendering

## Requirements

1. CTB must persist raw ingest evidence and accepted canonical market events in a replay-safe shape.
2. CTB must retain enough metadata to explain provider source, normalization version, freshness outcome, and duplicate or rejection classification.
3. CTB must expose repository queries for recent ingest health and canonical event history retrieval.
4. Automated tests must verify durable persistence and replay-oriented query semantics.

## Success Criteria

The spec is successful when:

* Prisma and repository code agree on a durable market-data persistence model
* accepted canonical events can be queried by instrument, event family, time range, and ingest run
* duplicate and rejected ingest decisions remain visible for diagnostics and future UI/API slices

## Primary Artifacts

Persistence assets:

* `packages/market-data/src/index.ts`
* `packages/market-data/src/repository.ts`
* `prisma/schema.prisma`
* `prisma/migrations/*`
* `tests/market-data-repository.integration.ts`
