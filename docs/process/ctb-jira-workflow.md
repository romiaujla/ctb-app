# CTB Jira Workflow

## Purpose

This document defines the baseline Jira workflow for the CTB 8-agent SDLC. It translates the Confluence handoff model into concrete issue usage, stage ownership, required artifacts, and approval gates.

## Workflow Goals

The Jira workflow should:

* align to the CTB agent handoff lifecycle
* make stage ownership explicit
* require structured handoff artifacts
* prevent implementation from outrunning design, validation, or release controls
* preserve human approval gates for architecture, security, and release

## Recommended Jira Hierarchy

Use the following hierarchy:

* `Epic`: cross-cutting initiatives or major product capabilities
* `Story`: deliverable feature, workflow, or operating-model unit
* `Task`: bounded implementation or enablement work when a story is not required
* `Subtask`: agent-stage execution units within a story
* `Bug`: defects, regressions, or production issues

## Recommended Jira States

The simplified CTB Jira workflow should use these states:

1. `Backlog`
2. `Ready for Design`
3. `In Design`
4. `Ready for Build`
5. `In Build`
6. `Ready for Validation`
7. `In Validation`
8. `Ready for Release`
9. `Done`
10. `Blocked`

If Jira state customization is limited, teams may approximate this with labels or checklist sections, but the lifecycle intent should remain the same.

## Stage Mapping

| Jira state | Primary owner | Outcome |
| --- | --- | --- |
| `Backlog` | BA / PO Agent | idea captured but not yet ready for design |
| `Ready for Design` | BA / PO Agent | scope is bounded and acceptance criteria are testable |
| `In Design` | UI / UX Agent and/or Solution Architect Agent | UX and technical design artifacts are produced |
| `Ready for Build` | Human lead confirms design sufficiency | implementation may begin |
| `In Build` | Senior Software Engineer Agent | code and implementation notes are produced |
| `Ready for Validation` | Senior Software Engineer Agent | implementation handoff is complete |
| `In Validation` | Test Automation Engineer Agent, Security Agent, QA Agent | tests, security review, and QA evidence are gathered |
| `Ready for Release` | DevOps / Platform / SRE Agent | release checklist, rollout, and rollback plan are complete |
| `Done` | Human approver | release approved and completed |
| `Blocked` | Any stage owner | progress cannot continue without explicit resolution |

## Required Artifacts by Stage

### 1. Backlog framing

Required before moving to `Ready for Design`:

* problem summary
* business objective
* acceptance criteria
* dependencies
* open questions
* risk tier

Suggested Jira fields or sections:

* Summary
* Description
* Acceptance Criteria
* Dependencies
* Risks
* Open Questions

Use `docs/process/ctb-ba-po-agent-workflow.md` for the BA / PO agent handoff structure, acceptance criteria pattern, and dependency/assumption capture rules.

### 2. Design

Required before moving to `Ready for Build`:

* UI flow notes if user-facing behavior changes
* technical design note or ADR when architecture impact is non-trivial
* domain boundaries
* affected integrations or contracts
* rollout constraints

Use `docs/process/ctb-solution-architect-agent-workflow.md` for the Solution Architect agent handoff structure, design note versus ADR rules, and architecture escalation expectations.

### 3. Build

Required before moving to `Ready for Validation`:

* implementation summary
* files or modules affected
* known limitations
* test requirements
* PR or commit reference

Use `docs/process/ctb-senior-software-engineer-agent-workflow.md` for the Senior Software Engineer agent handoff structure, reviewer-note expectations, and implementation scope guardrails.

### 4. Validation

Required before moving to `Ready for Release`:

* automated test evidence
* QA validation notes
* security review notes for medium/high-risk changes
* unresolved issues list
* release recommendation

Use `docs/process/ctb-security-agent-workflow.md` for the required security review structure, severity model, remediation expectations, and escalation notes.

### 5. Release

Required before moving to `Done`:

* deployment checklist
* rollback plan
* monitoring expectations
* release owner
* human approval record

## Minimum Evidence Rules

### Before implementation

Every story must include:

* testable acceptance criteria
* clear owner
* risk tier
* design evidence appropriate to the risk class

### Before validation

Every build handoff must include:

* implementation summary
* code reference
* changed-scope summary
* expected test layers

### Before release

Every releasable change must include:

* automated validation status
* QA status
* security status if applicable
* rollout plan
* rollback plan
* named human approver

## Approval Gates

The following gates require explicit human approval:

* architecture approval for cross-domain, auth, tenancy, data model, or integration-heavy changes
* security approval for auth, secrets, PII, tenant isolation, infrastructure, or financial logic changes
* release approval for production-impacting delivery

No agent should approve its own work in a high-risk gate.

## Risk Tiers

Assign one of these risk tiers to each issue:

* `Low`: localized, reversible, well-tested change
* `Medium`: moderate business logic or API/integration impact
* `High`: auth, tenancy, financial logic, data migration, infrastructure, or sensitive workflow impact

Risk tier determines required design depth, validation depth, and review breadth.

## Suggested Subtask Pattern

Stories should use subtasks when the work crosses multiple agent stages:

* `BA/PO Handoff`
* `UX Design`
* `Architecture Design`
* `Implementation`
* `Test Automation`
* `Security Review`
* `QA Validation`
* `Release Preparation`

Low-risk stories may collapse some steps, but must still preserve evidence and accountability.

## Definition of Ready

A story is ready to move into design when:

* the business objective is clear
* scope is bounded
* acceptance criteria are testable
* dependencies and assumptions are visible
* risk tier is assigned

## Definition of Done

A story is done when:

* the required stage artifacts exist
* validation evidence matches the risk tier
* release preparation is complete
* a human approver has accepted the release outcome
* follow-up items are explicitly captured

## Operating Notes

* Use structured handoffs rather than free-form comments whenever possible.
* Link Confluence design artifacts directly from Jira.
* Treat missing evidence as a blocker, not as a review suggestion.
* Keep stage ownership explicit even when one human executes multiple stages.
