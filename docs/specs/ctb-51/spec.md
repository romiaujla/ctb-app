# CTB-51 Spec

## Problem

CTB does not yet define one stable API surface for the operator UI and supporting workflows, which would force downstream consumers to depend on raw internals or inconsistent contracts.

## Goal

Define the CTB API domains, endpoint responsibilities, OpenAPI and `/docs` support expectations, and operator-facing read versus action boundaries.

## Scope

This story covers:

* the CTB v1 API domain groups
* representative read and action endpoints
* OpenAPI and `/docs` baseline expectations
* boundary rules between canonical domain truth and API responses

This story does not cover:

* backend implementation
* full auth-hardening design
* UI screen or interaction design

## Requirements

1. CTB must identify the core API domains for status, simulator, strategy, reporting, and operations.
2. CTB must make OpenAPI and `/docs` part of the planning baseline.
3. CTB must define explicit read and action boundaries for operator-facing endpoints.
4. CTB must keep API responses downstream of canonical simulator and strategy truth.
5. CTB must provide one reusable baseline that downstream API and UI work can inherit.

## Success Criteria

The spec is successful when:

* downstream UI work can consume one documented API boundary instead of raw internals
* implementation teams can derive OpenAPI contracts from a clear domain map
* operator actions remain intentionally minimal and auditable in v1

## Primary Artifact

Implementation-ready API baseline:

* `docs/architecture/ctb-operator-api-surface.md`
