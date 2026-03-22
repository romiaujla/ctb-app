# CTB-53 Spec

## Problem

CTB does not yet define one integrated runtime interface that connects the API, the operator UI, `/docs`, and the single-owner access model into one supported control plane.

## Goal

Define the integrated API and Next.js operator UI path, including surface responsibilities, validation expectations, and minimal single-owner access assumptions for CTB v1.

## Scope

This story covers:

* the supported runtime surfaces for the control plane
* the end-to-end path between the UI, API, `/docs`, and published reports
* single-owner access assumptions
* validation expectations for API, UI, and integration behavior

This story does not cover:

* concrete implementation code
* advanced auth-hardening workflows
* static report generation internals

## Requirements

1. CTB must make the API and operator UI integration path explicit.
2. CTB must treat `/docs` and operator-facing runtime workflows as supported surfaces.
3. CTB must make single-owner access assumptions explicit and intentionally minimal.
4. CTB must define validation expectations for both API and UI behavior.
5. CTB must provide one reusable integration baseline that downstream implementation can inherit.

## Success Criteria

The spec is successful when:

* backend and frontend implementation can build one coherent control plane from the handoff
* validation owners can identify contract, API, UI, and integration expectations clearly
* access assumptions are clear enough to prevent accidental public-user or multi-tenant scope creep

## Primary Artifact

Implementation-ready control-plane integration baseline:

* `docs/architecture/ctb-control-plane-integration.md`
