# CTB-53 Plan

## Context

`CTB-53` is a medium-risk integration story because it completes the API and operator-UI planning chain by defining one supported control-plane path for CTB runtime use.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus a reusable control-plane integration baseline.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reusable API-and-UI integration baseline under `docs/architecture`
* minimal cross-document links from the repository README

## Domain Boundaries

Affected domains:

* supported runtime surfaces for the control plane
* UI-to-API integration path
* `/docs` and published-report surface roles
* validation and single-owner access assumptions

Unaffected domains:

* implementation framework code
* static report generation internals
* advanced auth and account-recovery workflows
* public SaaS behavior

## Contracts and Interfaces

Artifacts will define:

* how the operator UI, API, `/docs`, and published reports fit together
* the route and integration model for the control plane
* the bounded action model for operator workflows
* the validation layers that should prove the supported runtime interface

## Rollout Constraints

This issue must stay integration-level and must not lock CTB into:

* full production auth-hardening
* framework-specific implementation details beyond the Next.js planning assumption
* unsupported public or collaborative access models
* report-generation logic that belongs in reporting stories

## Risks

* If the surface boundaries are unclear, implementation may blur API, UI, and static report responsibilities.
* If validation expectations are weak, the control plane may appear coherent while key integration paths remain untested.
* If access assumptions are implicit, later work may accidentally widen scope beyond the v1 boundary.

## Open Questions

* Exact auth-hardening steps can remain lightweight until future scope expansion requires more.
* The final set of operator actions may continue to evolve alongside observability and operations work.

## Approvals

Recommended review focus:

* clarity of the end-to-end control-plane path
* strength of the validation expectations
* usefulness of the single-owner access assumptions for downstream implementation
