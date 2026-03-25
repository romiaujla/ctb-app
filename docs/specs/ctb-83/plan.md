# CTB-83 Plan

## Context

`CTB-83` is the final implementation slice in the CTB-45/46/47 chain, so it should stay tightly scoped to operator visibility on top of the already-merged persistence and ingestion work.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* API handlers for market-data health and canonical-history inspection
* one web view model and rendered operator summary for market-data trust
* one test file that exercises the new visibility surfaces

## Domain Boundaries

Affected domains:

* operator-facing API visibility
* current web scaffold rendering
* market-data trust and ingest-health presentation

Unaffected domains:

* canonical market-data contract logic implemented in `CTB-84`
* persistence-shape changes implemented in `CTB-82`
* unrelated simulator, strategy, report, or notification UI areas

## Contracts and Interfaces

Artifacts will define:

* one market-data health payload for operator inspection
* one market-data history response shape filtered from canonical events
* one web-facing summary model and render function that surfaces current trust state clearly

## Rollout Constraints

This issue should stay focused on operator visibility and should not:

* introduce new domain logic for normalization or freshness
* widen into a full multi-screen front-end rewrite
* expose raw database implementation details directly from the API

## Risks

* If the API returns low-level persistence shapes directly, UI consumers will couple to storage details.
* If degraded states are not explicit in the web summary, the owner will still need to inspect raw JSON to understand trust issues.
* If the view model ignores duplicate or rejected decisions, ingestion health will appear healthier than it is.

## Open Questions

* A richer visual dashboard can land later once the web app has a fuller front-end stack.
* Future API stories may fold this market-data surface into a broader status domain, but the contract should be useful now.

## Approvals

Recommended review focus:

* clarity of the operator-facing health payload
* accuracy of degraded-state presentation
* consistency between API responses and the web summary
