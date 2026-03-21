# CTB Solution Architect Agent Technical Design and ADR Workflow

## Purpose

This document defines how the Solution Architect Agent prepares technical design output for CTB work and when that work should be captured as a design note versus an ADR.

It provides:

* design-stage intake and output expectations
* a rule for choosing a design note or ADR
* a standard architecture handoff package
* escalation rules for high-risk and cross-domain changes

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/process/ctb-jira-workflow.md`
* `docs/process/ctb-agent-governance.md`
* `docs/process/ctb-ai-usage-and-adr-governance.md`

## Workflow Goals

The Solution Architect Agent workflow should:

* make technical design explicit before implementation begins
* capture contracts, domain boundaries, rollout constraints, and risks in a reusable form
* direct high-impact decisions into durable ADR records when needed
* give engineering, security, QA, and release stakeholders a design artifact they can consume directly
* surface architecture approval needs before implementation outruns design clarity

## When the Workflow Applies

The Solution Architect Agent should be engaged when a change affects:

* multiple domains or workspaces
* shared contracts or schemas
* data flow, event flow, or integration boundaries
* rollout sequencing or operational constraints
* architecture decisions that downstream teams need to inherit

This workflow should also be used when the team cannot confidently explain how a change fits within existing CTB architecture.

## Design Note vs ADR

Use a design note when:

* the work needs implementation guidance but does not materially change durable architecture direction
* the decision is localized and reversible
* the architecture baseline already exists and only needs issue-specific application

Use an ADR when:

* the change meets an ADR trigger in `docs/process/ctb-ai-usage-and-adr-governance.md`
* the work creates or changes a durable architectural boundary
* the team is making a decision that future work will need to inherit
* the change is cross-domain, high-risk, or likely to affect security, release, or operating posture

If uncertainty remains, prefer an ADR over leaving a high-impact architecture decision undocumented.

## Required Architecture Output

Every Solution Architect Agent handoff should include:

* problem and design goal
* affected domains and boundaries
* contracts, schemas, or interfaces affected
* major flow or interaction summary
* rollout constraints
* risk summary
* open questions or explicit note that none remain
* approval requirements

## Standard Output Format

Architecture output should use the following sections:

* `## Context`
* `## Decision`
* `## Domain Boundaries`
* `## Contracts and Interfaces`
* `## Rollout Constraints`
* `## Risks`
* `## Open Questions`
* `## Approvals`

If the artifact is an ADR, include the ADR-specific minimum content required by `docs/process/ctb-ai-usage-and-adr-governance.md`.

## Contract and Boundary Capture Rules

The architecture handoff should make these explicit when they matter:

* ownership of each affected domain
* data passed between domains
* external interface or dependency expectations
* backward-compatibility or migration constraints
* assumptions about simulator-first versus future live or multi-tenant behavior

Avoid design output that implies a boundary change without naming it directly.

## Rollout Constraint Rules

Rollout constraints should describe anything that affects safe sequencing, such as:

* prerequisites in other issues
* migration or compatibility requirements
* validation or approval gates
* partial-release or rollback constraints

If rollout safety depends on an operational decision, call that out before implementation begins.

## Escalation Rules

Escalate when:

* a design decision crosses domain ownership boundaries
* the change introduces a new contract without agreement on consumers
* architecture intent conflicts with implementation feasibility
* auth, tenancy, sensitive data, or release concerns raise a higher approval gate
* the issue should be split because one design cannot safely cover the full scope

Escalation outcomes:

* create or update an ADR
* require human architecture approval
* request security or release review earlier in the workflow
* split the issue into smaller architecture-safe increments

## Handoff to Downstream Stages

The Solution Architect Agent handoff should leave downstream teams with:

* a design artifact they can reference directly
* clear domain and contract boundaries
* rollout and validation constraints
* identified approval gates
* explicit unresolved questions, if any

Downstream engineering, security, QA, and DevOps work should not need to reinterpret the design intent.

## Definition of Done for Architect Workflow

The Solution Architect Agent workflow is complete when:

* the right artifact type was chosen: design note or ADR
* architecture outputs use a consistent structure
* contracts, domain boundaries, rollout constraints, and risks are explicit
* required approval and escalation points are visible
* downstream teams can consume the artifact without restating the design
