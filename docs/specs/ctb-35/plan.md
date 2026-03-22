# CTB-35 Plan

## Context

`CTB-35` is a medium-risk strategy-governance story because it determines how CTB decides whether the active strategy version is credible enough to continue.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus a reusable profitability-review and strategy-switch policy.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reusable strategy-review policy under `docs/process`
* minimal cross-document links from promotion-readiness guidance and the repository README

## Domain Boundaries

Affected domains:

* profitability review cadence
* drawdown and trust-protection expectations
* strategy continuation and switch decisions
* reporting and observability evidence guidance

Unaffected domains:

* dashboard implementation
* notification transport
* automated strategy switching
* live-money approval workflow

## Contracts and Interfaces

Artifacts will define:

* the required evidence for strategy review
* the cadence for daily, weekly, and formal review windows
* the thresholds that trigger intervention or strategy change
* the decision outcomes that downstream reporting and control-plane work should support

## Rollout Constraints

This issue must stay policy-level and must not lock CTB into:

* final dashboard layouts
* automatic decision logic
* irreversible promotion approvals
* implementation-specific storage or query models

## Risks

* If review cadence is unclear, owner decisions may become inconsistent.
* If drawdown and trust rules are weak, profitability may look better than it truly is.
* If switch outcomes are underspecified, later strategy changes may happen without a resettable baseline.

## Open Questions

* Specific numeric thresholds may evolve as more simulator evidence accumulates.
* Later promotion-readiness work may add stricter gates without weakening this baseline.

## Approvals

Recommended review focus:

* usefulness of the review cadence for the single-owner model
* clarity of the intervention and switch triggers
* completeness of the evidence guidance for future reporting and observability work
