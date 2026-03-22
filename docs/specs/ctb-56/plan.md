# CTB-56 Plan

## Context

`CTB-56` is a medium-risk publication story because it defines how validated reporting evidence becomes operator-visible history without turning GitHub Pages into an interactive runtime.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus an implementation-ready update to the reporting architecture baseline.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reporting architecture update that defines Pages publication, indexing, link conventions, and operator handoff expectations

## Domain Boundaries

Affected domains:

* reporting-worker publication flow
* GitHub Pages static hosting
* operator report discovery contract
* notification link consumption

Unaffected domains:

* report generation logic
* dynamic dashboard runtime behavior
* authenticated access-control implementation

## Contracts and Interfaces

Artifacts will define:

* static publication workflow and eligibility rules
* dated-path and history-index structure
* canonical report links for latest and date-specific access
* operator handoff metadata for publication results

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* a CI vendor-specific Pages action
* dynamic server-side rendering
* notification transport implementation
* retention policies beyond the publication/index contract

## Risks

* If Pages is treated as an application runtime, report integrity and scope discipline will drift.
* If link conventions are unstable, notification and UI consumers will need brittle custom routing.
* If index updates are not gated by validation and publication success, operators may see misleading history.

## Open Questions

* Exact deployment trigger mechanics can still be finalized with CI work later.
* Longer-term archival navigation can expand beyond the initial history index if needed.

## Approvals

Recommended review focus:

* clarity of static-only publication boundaries
* sufficiency of history-index and link conventions for downstream consumers
* correctness of publication eligibility and handoff metadata
