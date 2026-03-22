# CTB-67 Plan

## Context

`CTB-67` is a medium-risk process story because it governs how CTB evaluates simulator success before any future live-money planning can be opened.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus a reusable process document for promotion governance and ADR review.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reusable promotion-governance document under `docs/process`
* small repository link updates so downstream promotion work can discover the approval baseline directly

## Domain Boundaries

Affected domains:

* promotion governance
* strategy-comparison review
* architecture and approval evidence
* ADR requirements for future live-money planning

Unaffected domains:

* profitability-threshold calculations
* final evidence-package assembly
* broker integration or live-trading execution

## Contracts and Interfaces

Artifacts will define:

* the strategy-comparison questions that must be answered before progression
* the named approvals required for promotion review
* ADR triggers and minimum content for live-money planning
* the boundary between governance approval and future implementation scope

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* approval by profitable performance alone
* a live-trading implementation roadmap
* lightweight undocumented promotion decisions

## Risks

* If strategy comparison is vague, the strongest evidence may be chosen selectively rather than reviewed consistently.
* If approvals are informal, live-money planning can begin without durable human accountability.
* If ADR triggers are weak, architectural risk may be hidden behind operational enthusiasm.

## Open Questions

* The exact approver set may expand if CTB moves beyond a single primary owner model.
* Strategy-comparison depth may need to increase as more strategy variants are tested over time.

## Approvals

Recommended review focus:

* clarity of the strategy-comparison expectations
* whether architecture and governance approvals are explicit enough
* whether the ADR trigger meaningfully blocks undocumented live-money planning
