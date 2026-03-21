# CTB BA / PO Agent Backlog and Acceptance Criteria Workflow

## Purpose

This document defines how the BA / PO Agent frames CTB backlog work so downstream design, implementation, validation, and release stages start from Jira-ready issues.

It provides:

* backlog structuring rules for epics, stories, tasks, and subtasks
* a standard acceptance criteria pattern
* dependency, assumption, and open-question capture rules
* a handoff package that downstream agents can consume without reframing

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/process/ctb-jira-workflow.md`
* `docs/process/ctb-agent-governance.md`

## Workflow Goals

The BA / PO Agent workflow should:

* turn ideas into bounded Jira work
* make acceptance criteria testable and implementation-ready
* expose dependencies, assumptions, and risks early
* reduce rework caused by vague or incomplete backlog items
* keep backlog framing aligned with CTB governance and release expectations

## Backlog Framing Rules

Use the Jira hierarchy defined in `docs/process/ctb-jira-workflow.md` and apply these defaults:

* `Epic`: cross-cutting initiative or major product/process capability with multiple stories
* `Story`: user-facing or workflow-level outcome that can be reviewed and accepted as a bounded increment
* `Task`: enablement or implementation unit that does not need full story framing
* `Subtask`: execution slice owned by a specific agent stage within a story

Every backlog item should answer:

* what problem exists
* what outcome is needed
* who benefits or is affected
* what is in scope now
* what is explicitly out of scope

If that information cannot be stated clearly, the issue is not ready for downstream handoff.

## Jira-Ready Story Template

For non-subtask issues, use the Lean Jira template required by the constitution:

* `## Problem`
* `## Goal`
* `## User Story`
* `## Acceptance Criteria`

The BA / PO Agent should also capture these fields or sections when they matter:

* dependencies
* assumptions
* open questions
* risk tier
* linked reference material

## Acceptance Criteria Standard

Acceptance criteria should be:

* specific
* observable
* testable
* scoped to the current issue
* free of hidden design or implementation work

Good acceptance criteria describe the expected outcome, not an unspecified “done when it works” statement.

Prefer criteria that answer:

* what behavior or artifact must exist
* how success can be verified
* what boundary conditions or exclusions matter

Avoid acceptance criteria that:

* bundle multiple outcomes into one vague bullet
* depend on undocumented assumptions
* describe internal implementation choices unless that choice is itself the requirement
* silently expand scope beyond the issue

## Recommended Criteria Pattern

Use short bullets that each state one verifiable outcome.

Pattern:

* actor or artifact affected
* expected result
* verification signal or reviewable evidence

Example:

* Jira-ready stories include a Problem, Goal, User Story, and Acceptance Criteria section.
* Acceptance criteria are written as testable bullets that downstream agents can validate without restating scope.
* Dependencies, assumptions, and open questions are visible when they affect design or implementation readiness.

## Dependency Mapping Rules

Dependencies should be captured when work relies on:

* another Jira issue
* an external system or contract
* a design decision or ADR
* a release or environment prerequisite
* human approval from architecture, security, or release ownership

Each dependency note should state:

* what is depended on
* why it matters to readiness
* whether it blocks the current issue

## Assumptions and Open Questions

Assumptions belong in backlog output when the team is proceeding based on something believed to be true but not yet fully verified.

Open questions belong in backlog output when a decision, clarification, or data point is still required.

Rules:

* assumptions should be explicit, narrow, and challengeable
* open questions should name the missing decision or information
* unresolved assumptions or open questions that change scope or feasibility should block downstream handoff

## Handoff Package for Downstream Agents

The BA / PO Agent handoff should leave downstream agents with:

* a bounded problem statement
* a clear goal
* testable acceptance criteria
* visible dependencies
* stated assumptions
* open questions or a note that none remain
* an initial risk tier recommendation

Downstream agents should not need to rewrite the issue just to begin design or implementation.

## Definition of Ready for BA / PO Output

Backlog framing is ready for design when:

* the issue type matches the intended scope
* the problem and goal are clear
* acceptance criteria are testable
* dependencies and assumptions are visible
* open questions are either resolved or explicitly noted
* the issue scope is small enough to move through the workflow without hidden expansion

## Escalation Rules

Escalate backlog framing when:

* the issue mixes unrelated outcomes
* acceptance criteria are not testable
* dependencies are blocking but undefined
* assumptions materially affect feasibility or risk
* the issue should be split into separate stories or tasks

Escalation outcomes:

* rewrite the issue for clarity
* split the work into follow-up issues
* request architecture or security input before handoff
* pause progression until missing business context is provided

## Definition of Done for BA / PO Workflow

BA / PO backlog output is complete when:

* the Jira issue is structured and Jira-ready
* acceptance criteria are testable and scoped
* dependencies, assumptions, and open questions are visible
* downstream agents can begin without reframing the issue
