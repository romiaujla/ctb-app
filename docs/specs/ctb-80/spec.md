# CTB-80 Spec

## Problem

CTB now persists simulator history and current accounting state, but it still lacks a deterministic replay engine and correctness-focused tests that prove the same accepted event stream produces the same portfolio outcome every time.

## Goal

Implement deterministic replay helpers and correctness coverage that verify persisted simulator history reproduces stable balances, positions, fills, and snapshot outcomes.

## Scope

This story covers:

* issue-scoped Spec Kit artifacts under `docs/specs/ctb-80`
* replayable simulator-state contracts
* deterministic replay and replay-verification helpers in `@ctb/simulator-core`
* unit tests for replay determinism and drift detection
* integration coverage that checks replay output against the persisted simulator model

This story does not cover:

* new market-data normalization behavior
* API or UI presentation features
* production observability work beyond what tests require

## Requirements

1. Replay must consume the persisted simulator event stream plus canonical orders, fills, and snapshots in a stable order.
2. Running replay multiple times over the same accepted input must yield the same digest and accounting outputs.
3. Correctness tests must fail when replay drift or accounting inconsistencies are introduced.
4. Core correctness suites must remain green in the repository validation flow.

## Success Criteria

The spec is successful when:

* replay over the same ordered simulator inputs is deterministic
* replay verification catches drift between canonical history and persisted portfolio views
* the repository has both unit and integration coverage for replay correctness

## Primary Artifacts

Replay and correctness assets:

* `packages/simulator-core/src/replay.ts`
* `packages/types/src/index.ts`
* `packages/schemas/src/index.ts`
* `tests/simulator-replay.test.ts`
* `tests/simulator-accounting-repository.integration.ts`
