# CTB-78 Spec

## Problem

CTB now has planning guidance for simulator entities, accounting boundaries, and replay safety, but the executable monorepo still lacks canonical shared contracts that later simulator, persistence, and replay code can import directly.

## Goal

Implement the canonical simulator entities, event contracts, persistence-shape baseline, and contract tests needed to make the simulator domain model executable inside the repository.

## Scope

This story covers:

* issue-scoped Spec Kit artifacts under `docs/specs/ctb-78`
* canonical simulator entity and event types in `@ctb/types`
* Zod-backed simulator contract schemas in `@ctb/schemas`
* simulator persistence-boundary helpers in `@ctb/simulator-core`
* Prisma persistence models and migration scaffolding for the canonical simulator records
* automated tests for the contract and persistence-shape baseline

This story does not cover:

* persisted accounting query flows beyond the baseline model contract
* replay execution orchestration or deterministic comparison harnesses
* downstream API, UI, reporting, or notification read models

## Requirements

1. Canonical simulator entities and event envelopes derived from `CTB-42` must be implemented as shared types and schemas.
2. Persistence contracts must distinguish append-only event history from derived portfolio and position views.
3. Durable identifiers and system-of-record ownership must be explicit for canonical simulator facts.
4. Automated tests must verify the contract and persistence-shape assumptions without depending on downstream business logic.

## Success Criteria

The spec is successful when:

* downstream simulator code can import one canonical set of entity and event contracts
* the repository encodes which simulator records are append-only facts versus derived views
* Prisma and tests agree on the persistence-shape baseline for future accounting work

## Primary Artifacts

Domain-contract assets:

* `packages/types/src/index.ts`
* `packages/schemas/src/index.ts`
* `packages/simulator-core/src/index.ts`
* `prisma/schema.prisma`
* `tests/simulator-domain-contracts.test.ts`
