# CTB-78 Plan

## Context

`CTB-78` is the first Milestone 2 implementation story in the simulator chain, so it needs to convert the planning-only baselines from `CTB-42`, `CTB-43`, and `CTB-44` into shared code and persistence contracts that later stories can build on safely.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* canonical simulator types in `@ctb/types`
* matching Zod schemas in `@ctb/schemas`
* one new `@ctb/simulator-core` package that exposes persistence-boundary helpers
* Prisma models and a migration for the baseline simulator records
* one contract-focused test file under `tests`

## Domain Boundaries

Affected domains:

* simulator shared contracts
* canonical event and persistence shape definitions
* baseline durable model ownership in Prisma
* contract-level automated validation

Unaffected domains:

* query repositories and persisted accounting workflows planned for `CTB-79`
* deterministic replay orchestration and correctness suites planned for `CTB-80`
* presentation-layer simulator consumers

## Contracts and Interfaces

Artifacts will define:

* canonical TypeScript interfaces for simulator accounts, orders, fills, positions, portfolios, snapshots, and event payloads
* shared Zod schemas for simulator records and event envelopes
* one persistence registry that marks append-only facts versus derived views
* the first Prisma schema for canonical simulator records and their identifiers

## Rollout Constraints

This issue should stay focused on contract and persistence-shape implementation and should not:

* implement query repositories or materialized read APIs
* introduce replay engines or cross-run comparison logic
* widen into reporting, notification, or operator-surface behavior

## Risks

* If the shared contracts drift from Prisma shapes, later simulator persistence work will fork the model.
* If derived views are treated as system of record, downstream stories will inherit blurry accounting ownership.
* If event payloads are too loose, replay and correctness work will need breaking contract changes later.

## Open Questions

* `CTB-79` may refine repository interfaces around these persistence contracts once the query flows are implemented.
* `CTB-80` may add stricter ordering or replay metadata if deterministic validation needs more lineage.

## Approvals

Recommended review focus:

* completeness of the canonical simulator contract surface
* clarity of the append-only versus derived-state boundary
* consistency between TypeScript, Zod, and Prisma representations
