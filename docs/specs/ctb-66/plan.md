# CTB-66 Plan

## Context

`CTB-66` is a medium-risk process story because it defines the first quantitative gate between simulator-only operation and any future live-money planning.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus a reusable process document for promotion-readiness thresholds.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reusable promotion-readiness gate document under `docs/process`
* small repository link updates so downstream governance stories can reuse the baseline directly

## Domain Boundaries

Affected domains:

* simulator promotion criteria
* profitability and drawdown guardrails
* reporting and observability evidence expectations
* strategy-review entry criteria for downstream governance work

Unaffected domains:

* broker connectivity
* live execution approval workflow
* release automation for real-money trading

## Contracts and Interfaces

Artifacts will define:

* minimum review-window expectations
* profitability and drawdown gate thresholds
* supporting evidence inputs from reporting, observability, and validation
* the non-automatic handoff from threshold satisfaction into later approval work

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* immediate live-money rollout after a profitable streak
* broker-specific readiness thresholds
* the final approval chain or evidence package contents

## Risks

* If the review window is too vague, short favorable runs may be mistaken for durable performance.
* If drawdown limits are absent, profitability can hide unacceptable downside behavior.
* If evidence inputs are weak, future promotion decisions may rest on partial or untrustworthy simulator outputs.

## Open Questions

* Exact numeric thresholds may tighten once more simulation history exists.
* Future governance work may require strategy-version comparison before the review window can count toward promotion consideration.

## Approvals

Recommended review focus:

* clarity of the initial profitability and drawdown thresholds
* whether review-window expectations prevent short-run cherry-picking
* consistency with reporting, observability, and governance baselines
