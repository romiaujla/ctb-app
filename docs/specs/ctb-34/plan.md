# CTB-34 Plan

## Context

`CTB-34` is a medium-risk strategy-foundation story because it determines the first trade-selection and risk posture that future simulator and reporting work will inherit.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus a reusable strategy-hypothesis baseline.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reusable v1 strategy-hypothesis baseline under `docs/architecture`
* minimal cross-document links from strategy planning artifacts and the repository README

## Domain Boundaries

Affected domains:

* strategy family definition
* entry, exit, and sizing behavior
* guardrail and invalid-trade handling
* versioning intent for future comparison

Unaffected domains:

* simulator execution-model details
* reporting calculations
* API or UI presentation
* automated strategy replacement workflows

## Contracts and Interfaces

Artifacts will define:

* the canonical CTB v1 strategy hypothesis
* the gating rules for when CTB may emit a trade intent
* the conditions that should block or invalidate a trade
* the version identity rules that downstream evidence must preserve

## Rollout Constraints

This issue must stay planning-level and must not lock CTB into:

* execution-engine implementation details
* optimization loops or backtesting automation
* multi-strategy orchestration
* live-money behavior or promotion decisions

## Risks

* If entry and exit rules stay vague, later implementations may diverge materially.
* If guardrails are underdefined, simulator outcomes may look profitable for the wrong reasons.
* If versioning intent is weak, later strategy revisions may be impossible to compare fairly.

## Open Questions

* Numeric thresholds may be tuned later once simulation evidence exists.
* Profitability-review cadence and switch criteria remain intentionally open for `CTB-35`.

## Approvals

Recommended review focus:

* clarity of the strategy family and signal definition
* sufficiency of guardrails and invalid-trade handling
* usefulness of the versioning policy for future reporting and review work
