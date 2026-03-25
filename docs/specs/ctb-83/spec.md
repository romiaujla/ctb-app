# CTB-83 Spec

## Problem

CTB now has replay-ready persistence and executable market-data ingestion logic, but the operator still has no focused API or UI surface for checking whether market-data ingestion is healthy, degraded, duplicated, or missing.

## Goal

Implement the operator-facing market-data visibility slice so the owner can inspect market-data trust and recent canonical history through the API and the current web scaffold.

## Scope

This story covers:

* issue-scoped Spec Kit artifacts under `docs/specs/ctb-83`
* operator-facing API endpoints for market-data health and recent history
* a web-facing market-data view model and rendered operator summary in the current web scaffold
* automated tests for the API and UI visibility surfaces

This story does not cover:

* new persistence-shape changes
* live dashboard styling beyond the current repo scaffold maturity
* broader simulator, strategy, reporting, or notification UI sections

## Requirements

1. The API must expose market-data health and recent canonical-event history without leaking raw persistence tables directly.
2. The operator UI surface must make freshness, duplicate, and degraded-ingest states explicit in text.
3. The web and API surfaces must reuse the shared market-data contracts rather than redefining response shapes ad hoc.
4. Automated tests must cover the new visibility surfaces.

## Success Criteria

The spec is successful when:

* the operator can fetch market-data health and recent history from `apps/api`
* the web scaffold renders a focused market-data summary with degraded and healthy states
* the visibility surfaces reflect canonical market-data truth from the shared repository path

## Primary Artifacts

Visibility assets:

* `apps/api/src/index.ts`
* `apps/web/src/main.ts`
* `tests/market-data-visibility.test.ts`
