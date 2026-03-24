# CTB-79 Spec

## Problem

CTB now has canonical simulator contracts and persistence shapes, but it still lacks a repository layer that actually stores event history, updates derived accounting state, and returns queryable portfolio views from durable records.

## Goal

Implement the Prisma-backed simulator accounting repository and integration coverage needed to persist event history, maintain queryable portfolio state, and return current plus historical simulator views.

## Scope

This story covers:

* issue-scoped Spec Kit artifacts under `docs/specs/ctb-79`
* repository contracts for persisted simulator accounting and history queries
* Prisma-backed persistence and query implementation in `@ctb/simulator-core`
* schema and migration updates needed for query integrity
* automated tests for consistency rules between append-only facts and derived portfolio state

This story does not cover:

* deterministic replay comparison logic
* market-data ingestion or strategy execution flows
* reporting or notification presentation behavior

## Requirements

1. Event history must persist durably with identifiers and ordering fields needed for later replay.
2. Current portfolio state for balances, positions, fills, and snapshots must remain queryable after persistence.
3. Repository contracts must expose current and historical simulator views without redefining accounting semantics.
4. Consistency rules between append-only event history and derived state must be enforced and tested.

## Success Criteria

The spec is successful when:

* simulator accounting writes persist both immutable facts and derived views
* current and historical query paths return balances, positions, fills, snapshots, and event history
* automated tests prove inconsistent derived records are rejected instead of being stored silently

## Primary Artifacts

Accounting persistence assets:

* `packages/simulator-core/src/repository.ts`
* `packages/types/src/index.ts`
* `packages/schemas/src/index.ts`
* `prisma/schema.prisma`
* `tests/simulator-accounting-repository.integration.ts`
