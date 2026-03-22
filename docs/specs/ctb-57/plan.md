# CTB-57 Plan

## Context

`CTB-57` is a medium-risk notification story because it defines the canonical event and evidence model that later local delivery implementation will rely on.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus an implementation-ready update to the notification architecture baseline.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one notification architecture update that defines event classes, message classes, delivery evidence, and retry/dedupe planning rules

## Domain Boundaries

Affected domains:

* canonical simulator and reporting events consumed by notifications
* notification-core event parsing and message shaping
* notification-worker delivery evidence and retry orchestration
* downstream observability of notification outcomes

Unaffected domains:

* transport-adapter implementation details
* public push infrastructure
* simulator or reporting calculations

## Contracts and Interfaces

Artifacts will define:

* canonical notification event classes and payload expectations
* message-class mapping rules
* delivery evidence record structure
* retry, suppression, and dedupe intent

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* a specific SMTP provider implementation
* iMessage or cloud push transport choices
* threshold tuning beyond policy-level guidance
* notification template copy beyond class-level shape

## Risks

* If event classes are ambiguous, later workers may notify from inconsistent triggers.
* If retry and dedupe rules are underspecified, the owner may receive duplicate or noisy alerts.
* If delivery evidence is too weak, observability and troubleshooting will be unreliable.

## Open Questions

* Threshold tuning can evolve later as reporting and observability mature.
* Message-template phrasing can be refined in implementation stories as long as class intent stays stable.

## Approvals

Recommended review focus:

* clarity of canonical event boundaries
* sufficiency of delivery evidence and audit fields
* usefulness of retry and dedupe policy for later worker implementation
