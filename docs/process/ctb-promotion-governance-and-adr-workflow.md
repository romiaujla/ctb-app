# CTB Promotion Governance and ADR Workflow

## Purpose

This document defines the reusable CTB governance-review stage that follows threshold satisfaction and must complete before any live-money planning can begin.

It builds on:

* `docs/process/ctb-promotion-readiness-gates.md`
* `docs/process/ctb-ai-usage-and-adr-governance.md`
* `docs/process/ctb-agent-governance.md`
* `docs/process/ctb-jira-workflow.md`

## Workflow Goals

The promotion-governance stage should:

* require an explicit comparison between the reviewed strategy and credible alternatives
* preserve named human approval for architecture and governance decisions
* require durable ADR evidence before live-money planning is opened
* prevent profitable simulator performance from bypassing review
* keep promotion review separate from future execution implementation

## Entry Conditions

The governance-review stage may begin only when:

* the threshold gate defined in `docs/process/ctb-promotion-readiness-gates.md` has been satisfied
* the reviewed evidence window is tied to a stable strategy and execution-model assumption set
* reporting, observability, and validation evidence are available for reviewer inspection

Meeting these entry conditions opens a review conversation. It does not pre-approve the outcome.

## Strategy-Comparison Review

Promotion consideration should require an explicit strategy-comparison note rather than a standalone claim that one reviewed run looks profitable.

The strategy-comparison review should answer:

* which strategy version or configuration is being considered
* what alternative strategy versions, prior baselines, or benchmark operating modes were compared
* whether the reviewed strategy is more trustworthy, not just more profitable, than the alternatives
* what known weaknesses, instability, or unexplained behavior remain

Minimum comparison rule:

* if there is no credible comparison point, the review should state that explicitly and treat the result as insufficient for promotion progression

## Approval Workflow

Promotion review should require explicit human approvals before live-money planning can be opened.

Required approval roles:

* architecture approver: confirms system boundaries, operational assumptions, and future live-money planning implications are understood
* governance approver: confirms evidence quality, scope discipline, and policy compliance are sufficient for progression

Required approval outcomes:

* `Do Not Advance`
* `Advance with Follow-Up Constraints`
* `Eligible for Final Promotion Checklist Review`

Rules:

* one person may hold multiple roles temporarily, but approvals should still be recorded by responsibility
* missing approval evidence blocks progression
* profitable results without explicit approval remain simulator-only outcomes

## ADR Requirements

An ADR is required before any live-money planning Jira issue, epic, or program can be opened.

The ADR should capture:

* why the reviewed strategy is being considered over alternatives
* what evidence window and thresholds supported the decision
* what simulator-only assumptions still hold
* what risks or unknowns prevent direct implementation
* what separate future program would be required for live-money planning and execution design

The ADR should be linked from Jira and reviewed as part of the governance decision, not written after approval as a formality.

## Jira and Scope Discipline

Promotion review should remain visible in Jira rather than hidden in informal discussion.

Minimum Jira expectations:

* link the threshold evidence and comparison artifacts
* record named approvers and their outcome
* link the required ADR before opening live-money planning work
* create new Jira scope for any future execution-facing or brokerage-facing initiative

The active promotion-governance issue should never expand into execution implementation work.

## Separation from Live-Execution Work

Approval to continue promotion review does not approve:

* broker integration
* funding workflows
* order execution design or implementation
* production live-trading rollout

Those activities require separate Jira scope, separate architecture review, and explicit future approval.

## Reuse Rules

Future CTB promotion decisions should:

* use this workflow after threshold satisfaction and before final checklist review
* require recorded strategy comparison, named approvals, and ADR linkage
* treat live-money planning as a governed next program rather than a direct extension of simulator backlog work
