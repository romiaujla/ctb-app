# CTB-90 Spec

## Problem

CTB has partial control-plane API code, but it still lacks the supported runtime surface planned by `CTB-51` and `CTB-53`, including overview reads, report and notification availability surfaces, and `/docs`.

## Goal

Complete the operator-facing API runtime surface with reusable overview and status payloads, supported report and notification availability responses, and an OpenAPI-backed `/docs` experience.

## Scope

This story covers:

* supported control-plane status and overview reads
* simulator and strategy summary/read endpoints needed by the operator UI
* report and notification availability or unavailable-state surfaces
* OpenAPI output and `/docs`
* shared schemas and tests for the new API contract

This story does not cover:

* implementation of the operator UI
* new simulator, market-data, or strategy persistence models
* full report-generation or notification-delivery pipelines

## Requirements

1. CTB must expose a supported overview and status API surface for operator workflows.
2. CTB must expose simulator, strategy, report, and notification reads without leaking worker or storage internals.
3. CTB must surface explicit empty, warning, degraded, and unavailable states where upstream runtime producers are incomplete.
4. CTB must publish OpenAPI output and a supported `/docs` surface for the current runtime contract.
5. CTB must add automated validation for the new API behavior.

## Success Criteria

The spec is successful when:

* the operator UI can rely on one supported API overview surface
* `/docs` exposes the current runtime contract as a supported control-plane surface
* unavailable report and notification flows are explicit rather than implied or broken
* tests cover the newly introduced runtime reads and docs endpoints
