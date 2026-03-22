# CTB Control Plane Integration Baseline

## Purpose

This document defines the integrated CTB control-plane path that combines the operator API, the Next.js operator UI, `/docs`, and the single-owner access model into one supported runtime interface.

It is the implementation-ready integration baseline for `CTB-53`.

## Integration Goals

The CTB control plane should:

* present one supported operator experience across the API and web UI
* keep dynamic runtime inspection separate from static published report consumption
* treat `/docs` as a supported contract surface alongside the operator UI
* preserve minimal but explicit single-owner access assumptions
* make validation expectations visible for API, UI, and integration behavior

## Supported Surfaces

CTB v1 should treat these as the supported runtime interface:

* `apps/web` for the owner-facing operator UI
* `apps/api` for the versioned control-plane API
* `/docs` for OpenAPI-backed contract exploration
* published static report links for historical reading

Planning rule:

* the operator UI and `/docs` are both supported, but they serve different purposes and should not collapse into one undifferentiated surface

## Surface Responsibilities

### `apps/web`

Owns:

* navigation through the operator workflow
* presentation of current runtime, strategy, reporting, and notification state
* access to bounded operator actions exposed by the API

Must not:

* invent business truth separate from API and canonical domain outputs
* re-render published historical reports as an alternate source of truth

### `apps/api`

Owns:

* contract-stable JSON endpoints under `/api/v1`
* orchestration of supported operator reads and bounded actions
* OpenAPI output consumed by `/docs`

Must not:

* expose raw persistence shapes as the contract
* bypass simulator, strategy, or reporting truth boundaries

### `/docs`

Owns:

* contract discovery for current CTB API behavior
* schema visibility for supported read and action endpoints

Must not:

* behave like a public external-developer platform
* replace the operator UI for routine runtime review workflows

### Published reports

Owns:

* static historical report reading
* canonical published artifacts for prior days

Must not:

* become the dynamic control-plane shell
* replace real-time runtime and workflow inspection

## End-to-End Operator Path

The integrated control-plane path should work like this:

1. The owner enters `apps/web` and lands on the `Overview` surface.
2. The UI fetches current state from versioned API endpoints only.
3. The owner navigates into simulator, strategy, reporting, or notification views using the UI information architecture defined in `CTB-52`.
4. When deeper historical report reading is needed, the UI links to published static report artifacts instead of recreating them.
5. When contract inspection is needed, the owner or implementer uses `/docs` to inspect the current API surface.
6. When a bounded operator action is triggered, the UI requests the API action endpoint and displays the workflow-tracking result and state changes.

## Route and Integration Model

Planning-level route model:

* web routes map to the operator sections: `overview`, `simulator`, `strategy`, `reports`, `notifications`
* web routes consume API endpoints grouped by the `CTB-51` domain model
* `/docs` is available from the same supported runtime as a contract-exploration route or adjacent surface

Integration rules:

* every operator-facing dynamic view should have one primary API source of truth
* the UI should degrade explicitly when the API reports partial, warning, or blocked states
* report links should be presented as external or static navigation outcomes rather than hidden inline render fallbacks

## Single-Owner Access Assumptions

CTB v1 access assumptions should remain intentionally lightweight:

* one named owner is the primary authenticated operator
* access is private, not public
* the control plane should not assume tenant, team, or role hierarchy
* unauthorized or anonymous access is out of scope for supported v1 use

Planning rule:

* authentication and authorization can stay minimal in v1, but they must still be explicit enough that downstream implementation does not accidentally drift into public-access assumptions

## Supported Operator Actions

The integrated control plane may expose only bounded operator actions that:

* correspond to documented API actions
* have visible workflow state and acknowledgement
* preserve reviewable operational evidence

Examples:

* replay or retry a bounded simulator workflow
* request report regeneration when the workflow supports it
* retry a notification path through a documented operational action

The control plane must not expose:

* arbitrary admin mutations
* hidden recovery shortcuts with no operational evidence
* broad workflow control that bypasses API contracts

## Validation Expectations

The control-plane implementation should be validated at multiple layers.

### Contract validation

Validate:

* API request and response shapes
* OpenAPI completeness for supported endpoints
* schema reuse between API and UI consumers where applicable

### API validation

Validate:

* read endpoint behavior across healthy, empty, warning, and blocked states
* action endpoint acknowledgement and error behavior
* `/docs` availability and accuracy for the supported surface

### UI validation

Validate:

* route-to-view behavior for the primary operator sections
* loading, empty, degraded, blocked, and success states
* report-link behavior and correct separation from static published surfaces
* keyboard and accessibility behavior for navigation and key actions

### Integration validation

Validate:

* the UI consumes only the supported API surface for dynamic state
* operator actions surface workflow status rather than hidden side effects
* published report links remain aligned with report metadata exposed through the API

## Error and Degraded-State Handling

The integrated control plane should make these situations explicit:

* API unavailable or degraded
* required evidence not yet available
* report missing or partial
* operator action blocked or unsupported
* notification health degraded enough to threaten owner visibility

Design rule:

* degraded and blocked states should be actionable and explain what the owner can inspect next

## Downstream Reuse

Future CTB work should reuse this baseline when defining:

* Next.js route structure and API client patterns
* API, UI, and integration test coverage
* lightweight auth implementation choices for the private control plane
* report and notification stories that plug into the supported operator experience

This baseline should feed:

* `CTB-54` daily report schema and simulator-to-report mapping
* later API and UI implementation stories that build the actual control plane
