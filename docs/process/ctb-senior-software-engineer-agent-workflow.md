# CTB Senior Software Engineer Agent Implementation Workflow

## Purpose

This document defines how the Senior Software Engineer Agent executes CTB implementation work and hands it off to reviewers, test automation, security review, QA, and release preparation.

It provides:

* implementation-stage input requirements
* scope and architecture guardrails
* a standard implementation handoff package
* reviewer notes and known-limitation expectations

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/process/ctb-jira-workflow.md`
* `docs/process/ctb-solution-architect-agent-workflow.md`
* `docs/process/ctb-security-agent-workflow.md`

## Workflow Goals

The Senior Software Engineer Agent workflow should:

* implement only approved and bounded scope
* preserve architecture, security, and tenancy constraints
* make changed behavior easy for reviewers to understand
* leave downstream validation teams with clear handoff context
* surface known limitations and follow-up work instead of hiding them

## Required Inputs

Implementation should begin only when these inputs exist:

* Jira issue with bounded scope and testable acceptance criteria
* design note or ADR when required by risk or architecture impact
* identified dependencies and approval gates
* known rollout or validation constraints

If required inputs are missing, the implementation should pause and escalate instead of inventing scope.

## Scope and Architecture Guardrails

The Senior Software Engineer Agent should:

* stay within the Jira issue scope
* align implementation with approved architecture direction
* preserve tenant isolation and sensitive-path rules
* avoid undocumented contract or boundary changes
* split follow-up work instead of widening the current issue

Implementation should not silently override architecture, security, or release constraints to finish faster.

## Required Implementation Output

Every implementation handoff should include:

* implementation summary
* changed files, modules, or areas
* reviewer notes
* known limitations
* expected validation layers
* follow-up issues or explicit note that none are needed

## Standard Handoff Format

Implementation handoff should use the following sections in Jira, PR description, or linked notes:

* `## Implementation Summary`
* `## Changed Scope`
* `## Reviewer Notes`
* `## Known Limitations`
* `## Validation Expectations`
* `## Follow-up Work`

## Reviewer Notes Rules

Reviewer notes should help a reviewer understand:

* what materially changed
* where to focus attention
* what risk areas deserve extra scrutiny
* what assumptions or constraints remain in force

Reviewer notes should prioritize behavioral and boundary impact over low-signal implementation detail.

## Known Limitations Rules

Known limitations should capture:

* anything intentionally deferred
* any partial implementation needed for safe sequencing
* residual ambiguity that testing or security review should inspect
* explicit follow-up work when the current issue cannot close the gap

Do not leave a limitation undocumented if it changes validation or release confidence.

## Validation Expectations

The implementation handoff should tell downstream teams:

* what test layers should run
* which flows or boundaries changed
* where security review should focus
* whether QA needs targeted exploratory coverage

Downstream teams should not need to reconstruct the impact surface from the diff alone.

## Escalation Rules

Escalate when:

* design or architecture inputs are missing
* the requested change expands beyond the Jira issue
* a contract or domain boundary needs to change unexpectedly
* security, tenancy, auth, or sensitive-data behavior is unclear
* validation requirements exceed what the current handoff can support

Escalation outcomes:

* request updated backlog or design framing
* split the work into a follow-up issue
* require architecture or security review before proceeding
* stop progression to validation until evidence is complete

## Definition of Done for Implementation Workflow

The Senior Software Engineer Agent workflow is complete when:

* implementation stayed within approved scope and architecture
* reviewer-ready context is documented
* known limitations and follow-up work are visible
* downstream testing and security review can proceed with minimal ambiguity
