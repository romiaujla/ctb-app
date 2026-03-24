# CTB-79 Plan

## Context

`CTB-79` follows the canonical contract baseline from `CTB-78` and turns it into executable persistence behavior. This is the point where simulator event history and derived portfolio state become durable, queryable repository outputs instead of only shared shapes.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* expanded repository contracts in `@ctb/types`
* Prisma-backed simulator accounting persistence and query code in `@ctb/simulator-core`
* query-integrity Prisma constraints and indexes
* integration tests that prove durable writes and read paths

## Domain Boundaries

Affected domains:

* simulator event-history persistence
* derived accounting-state storage
* current and historical portfolio queries
* database-level consistency constraints

Unaffected domains:

* deterministic replay comparison and drift detection planned for `CTB-80`
* presentation layers that consume simulator outputs
* market-data and strategy workflows

## Contracts and Interfaces

Artifacts will define:

* one `SimulatorAccountingRepository` contract for persisting and querying simulator state
* one Prisma implementation that keeps append-only facts separate from derived views
* one history query path for events, fills, and snapshots
* one current portfolio query path for account, portfolio, positions, open orders, and recent fills

## Rollout Constraints

This issue should stay focused on persistence and query behavior and should not:

* introduce replay-engine orchestration
* widen into API routes or UI data shaping
* re-encode accounting logic outside the simulator-core repository boundary

## Risks

* If repository writes accept cross-account records, later replay and query results will become untrustworthy.
* If snapshots can reference nonexistent events, the audit trail from append-only facts to derived state breaks.
* If read paths drift from stored canonical fields, `CTB-80` will have to rework the persistence model before adding deterministic checks.

## Open Questions

* `CTB-80` may add more replay-oriented metadata or stricter history filters if the correctness harness needs them.
* Later API stories may add narrower read models on top of these repository outputs.

## Approvals

Recommended review focus:

* correctness of the repository consistency rules
* usefulness of the current and historical query surfaces for later replay work
* alignment between Prisma constraints and simulator-core ownership boundaries
