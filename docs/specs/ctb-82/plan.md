# CTB-82 Plan

## Context

`CTB-82` is the first implementation story in the market-data execution chain, so it needs to create the durable persistence baseline that later runtime ingestion and operator visibility work can build on safely.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one new `@ctb/market-data` package for persistence interfaces and Prisma-backed repository behavior
* Prisma models and a migration for ingest runs, raw payload records, canonical event history, and ingest decisions
* one integration-focused test file for persistence and replay-style retrieval

## Domain Boundaries

Affected domains:

* market-data durable storage
* replay-ready canonical event history
* ingest audit metadata and duplicate visibility
* DB-focused automated validation

Unaffected domains:

* canonical contract normalization logic planned for `CTB-84`
* freshness-policy computation planned for `CTB-84`
* operator API and UI surfaces planned for `CTB-83`

## Contracts and Interfaces

Artifacts will define:

* persistence records for ingest runs, raw market-data records, canonical market-data events, and ingest decisions
* repository write paths for replay-safe accepted event history plus diagnostic records
* query paths for recent ingest runs, recent decisions, and canonical event history by common filters

## Rollout Constraints

This issue should stay focused on persistence and repository behavior and should not:

* introduce provider-specific transport code
* implement freshness classification rules directly
* widen into API handlers or web rendering

## Risks

* If the persistence model omits duplicate or rejection evidence, later operator visibility will lose root-cause detail.
* If canonical history cannot be filtered by instrument, event family, and ingest run, replay consumers will need breaking repository changes later.
* If raw and canonical records are not linked cleanly, normalization and debugging evidence will drift.

## Open Questions

* `CTB-84` may refine repository writes once normalization and freshness policy are implemented.
* Long-term retention limits can remain configurable after the durable shape is in place.

## Approvals

Recommended review focus:

* completeness of the replay-safe persistence shape
* clarity of accepted versus duplicate or rejected ingest records
* consistency between Prisma, repository code, and tests
