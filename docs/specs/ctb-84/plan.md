# CTB-84 Plan

## Context

`CTB-84` builds directly on `CTB-82`, so it needs to keep the new DB baseline stable while adding the executable domain logic that converts raw provider inputs into canonical, freshness-aware, replay-safe market-data history.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* shared market-data contracts in `@ctb/types`
* shared market-data schemas in `@ctb/schemas`
* normalization, freshness, idempotency, and ingestion helpers in `@ctb/market-data`
* simulator-worker helpers that call the shared ingestion service
* one unit-focused test file under `tests`

## Domain Boundaries

Affected domains:

* canonical market-data shared contracts
* normalization and freshness policy execution
* replay-safe duplicate handling
* simulator-worker ingestion behavior

Unaffected domains:

* operator API and UI visibility planned for `CTB-83`
* persistence-schema changes already covered by `CTB-82`
* live-provider credentials or transport-specific adapters

## Contracts and Interfaces

Artifacts will define:

* canonical shared event contracts for quote, trade, bar, and status payloads
* normalization input contracts and freshness-threshold configuration
* ingestion-service outputs for accepted, duplicate, and rejected records
* simulator-worker entry points that persist canonical history through the shared repository layer

## Rollout Constraints

This issue should stay focused on domain and runtime ingestion logic and should not:

* widen into operator UI or HTTP endpoint work
* change the persistence baseline more than needed for ingestion lookup support
* require a single live market-data provider choice

## Risks

* If quality and freshness classification drift from the shared contract, later consumers will fork market-data trust behavior.
* If duplicate keys are unstable, replay-ready history will fragment.
* If simulator-worker helpers bypass the shared repository path, later operator surfaces will not see one trusted history.

## Open Questions

* Live-provider adapter wiring can remain thin until a provider-specific implementation story is created.
* Session thresholds may need tuning with real feed behavior later, but the classification contract should land now.

## Approvals

Recommended review focus:

* completeness of the canonical market-data contract surface
* safety and determinism of freshness and duplicate handling
* correctness of the simulator-worker ingestion path
