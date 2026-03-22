# CTB-51 Plan

## Context

`CTB-51` is a medium-risk contract story because it defines the operator-facing service boundary that later API, UI, and validation work must share.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus a reusable API-surface baseline.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reusable operator API baseline under `docs/architecture`
* minimal cross-document links from the repository README

## Domain Boundaries

Affected domains:

* operator-facing API contract groups
* read versus action endpoint boundaries
* OpenAPI and `/docs` support expectations
* downstream UI and automation consumption

Unaffected domains:

* UI view design
* implementation framework choices
* detailed authentication hardening
* public developer-platform concerns

## Contracts and Interfaces

Artifacts will define:

* the canonical CTB v1 API domain groups
* representative endpoint responsibilities for each domain
* the line between auditable actions and read-only inspection
* the OpenAPI and `/docs` contract-discovery posture

## Rollout Constraints

This issue must stay contract-level and must not lock CTB into:

* concrete backend framework code
* broad administrative write surfaces
* public or multi-tenant API assumptions
* UI navigation specifics that belong in `CTB-52`

## Risks

* If endpoint boundaries are vague, UI work may bypass the API and couple to internals.
* If action endpoints are too broad, CTB may erode operational evidence and safety.
* If `/docs` expectations are underspecified, contract discovery may drift between teams.

## Open Questions

* The minimal final set of operator write actions may be refined by UI flow design.
* Authentication remains intentionally lightweight for the v1 single-owner model.

## Approvals

Recommended review focus:

* clarity of the API domain map
* strength of the read versus action separation
* usefulness of the OpenAPI and `/docs` baseline for downstream teams
