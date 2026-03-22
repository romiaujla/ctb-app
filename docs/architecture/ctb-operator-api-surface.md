# CTB Operator API Surface and OpenAPI Baseline

## Purpose

This document defines the planning-level CTB API surface, operator-facing endpoint boundaries, and OpenAPI documentation baseline for the single-owner control plane.

It is the implementation-ready API baseline for `CTB-51`.

## API Goals

The CTB API should:

* expose one stable control-plane boundary for the operator UI and automation workflows
* keep simulator, strategy, reporting, and notification truth downstream of canonical domain records
* separate read-heavy operational inspection from limited write or orchestration actions
* make contract discovery explicit through OpenAPI and a supported `/docs` surface
* preserve the CTB v1 single-owner, simulator-only product boundary

## Architectural Position

The CTB API belongs in `apps/api` and should sit between operator-facing consumers and CTB domain services.

The API must consume canonical domain outputs from:

* simulator and portfolio truth
* strategy evaluation and explainability truth
* validated reporting artifacts and metadata
* notification and workflow-status evidence

The API must not:

* recalculate portfolio or profitability logic
* rebuild strategy decisions from raw provider data
* expose persistence tables or worker internals directly as the public contract

## Supported API Consumers

The supported CTB v1 API consumers are:

* the single-owner operator UI
* owner-controlled automation or local tooling
* the `/docs` exploration surface used to inspect the supported contract

Unsupported consumers in v1:

* public third-party developer integrations
* multi-tenant clients
* unauthenticated internet-scale use cases

## Contract Style

The CTB API should use:

* versioned HTTP JSON endpoints under `/api/v1`
* OpenAPI as the canonical contract description format
* explicit request and response schemas that mirror canonical domain truth without leaking storage implementation details

Planning rules:

* API schemas should be defined once and reused across `apps/api`, `apps/web`, and shared contract packages
* OpenAPI should describe both read and supported action endpoints
* `/docs` should be treated as a first-class supported surface for exploring the current CTB contract

## Core API Domains

The CTB v1 API should expose five domain groups.

### 1. Status domain

Purpose:

* surface overall system health and current operational readiness

Representative endpoints:

* `GET /api/v1/status`
* `GET /api/v1/status/dependencies`
* `GET /api/v1/status/workflows`

Read boundary:

* current service health
* dependency reachability
* current workflow state for simulator, reporting, and notification paths

### 2. Simulator domain

Purpose:

* expose simulator-owned portfolio and run-state outputs for operator inspection

Representative endpoints:

* `GET /api/v1/simulator/summary`
* `GET /api/v1/simulator/runs`
* `GET /api/v1/simulator/positions`
* `GET /api/v1/simulator/trades`

Read boundary:

* latest portfolio snapshot
* recent run history and current run state
* open positions and recent trade outcomes

Rule:

* responses must remain downstream of canonical simulator and accounting truth

### 3. Strategy domain

Purpose:

* expose strategy identity, decision evidence, and review-relevant explainability

Representative endpoints:

* `GET /api/v1/strategy/active`
* `GET /api/v1/strategy/evaluations`
* `GET /api/v1/strategy/review`

Read boundary:

* active strategy id and version
* recent emitted, skipped, blocked, and invalid outcomes
* review-window metrics and top decision reasons

### 4. Reporting domain

Purpose:

* expose validated report availability and report metadata without duplicating the static publication surface

Representative endpoints:

* `GET /api/v1/reports`
* `GET /api/v1/reports/latest`
* `GET /api/v1/reports/{reportDate}`

Read boundary:

* report-generation status
* latest available report metadata
* links or references to published static artifacts

Rule:

* the API should point to validated reports and metadata rather than regenerate report content on request

### 5. Operations domain

Purpose:

* expose narrowly scoped operator actions and operational evidence

Representative endpoints:

* `POST /api/v1/operations/simulator/replay`
* `POST /api/v1/operations/reporting/regenerate`
* `POST /api/v1/operations/notifications/retry`
* `GET /api/v1/operations/incidents`

Action boundary:

* only explicit, owner-approved operational actions should exist in v1
* actions should return acknowledgement and workflow-tracking metadata, not hidden side effects

## Read and Action Separation

The API should preserve a clear line between:

* read endpoints that expose current CTB state and evidence
* action endpoints that request a bounded operational workflow

Write or action endpoints in v1 should be:

* minimal
* auditable
* safe for a single-owner operating model

The API should not provide:

* arbitrary mutation of simulator truth
* direct database-edit style endpoints
* broad admin actions that bypass workflow evidence

## `/docs` and OpenAPI Support

CTB should treat OpenAPI and `/docs` as supported operator-facing surfaces.

The `/docs` surface should:

* render the currently supported OpenAPI contract
* show request and response schemas for all supported endpoints
* distinguish read endpoints from action endpoints clearly
* reflect authentication assumptions and limitations for the single-owner model

Planning rule:

* `/docs` is not a public developer program; it is a supported contract-exploration surface for the owner and implementation teams

## Response Design Rules

Responses should:

* use stable resource identifiers and timestamps
* include enough status metadata for the UI to represent loading, empty, warning, and failed states clearly
* expose validation or workflow status when data may be partial or blocked
* avoid embedding implementation-only fields that downstream consumers should not depend on

## Error Design Rules

The API should define explicit error classes for:

* validation failure
* unsupported operator action
* missing or not-yet-available report or workflow evidence
* dependency or workflow degradation

Error responses should help the UI distinguish:

* recoverable operator errors
* blocked operational state
* system degradation that needs investigation

## Access Assumptions

CTB v1 access assumptions should remain intentionally lightweight:

* the primary user is the single CTB owner
* authentication and authorization should be minimal but explicit
* the API should not assume anonymous public access

This story does not finalize auth-hardening details, but all downstream work should preserve the single-owner boundary.

## Downstream Reuse

Future CTB work should reuse this baseline when defining:

* shared API schemas and OpenAPI contracts
* operator UI information architecture and data-fetching boundaries
* contract, integration, and API validation expectations
* limited operator actions for replay, regeneration, and retry workflows

This baseline should feed:

* `CTB-52` operator UI information architecture
* `CTB-53` integrated API and Next.js operator UI delivery
