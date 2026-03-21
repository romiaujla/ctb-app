# CTB Test Automation Engineer Agent Validation Workflow

## Purpose

This document defines how the Test Automation Engineer Agent plans, executes, and reports automated validation for CTB changes.

It provides:

* risk-tier-based validation planning
* coverage guidance across test layers
* a standard automated validation output
* automation-gap reporting for QA and release stakeholders

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/process/ctb-jira-workflow.md`
* `docs/process/ctb-cicd-validation-baseline.md`
* `docs/process/ctb-senior-software-engineer-agent-workflow.md`

## Workflow Goals

The Test Automation Engineer Agent workflow should:

* scale validation depth to the risk tier
* make critical-path coverage expectations explicit
* keep regression protection visible as scope changes
* expose automation gaps before release decisions are made
* leave QA and release stakeholders with reviewable automated evidence

## Required Inputs

Automated validation should consume:

* Jira issue scope and acceptance criteria
* implementation handoff notes
* risk tier
* known constraints or limitations
* affected interfaces, boundaries, and critical paths

If those inputs are incomplete, the validation output should state the evidence gap instead of pretending the coverage is sufficient.

## Risk-Tier Strategy

Validation planning should follow the Jira risk tiers:

* `Low`: targeted automated checks for changed behavior and regression-sensitive paths
* `Medium`: layered validation across unit, integration, and contract boundaries as applicable
* `High`: strongest practical coverage for critical paths, boundaries, and failure modes, with explicit reporting of anything that remains unautomated

Risk tier should influence both the depth of coverage and the visibility of remaining gaps.

## Coverage Guidance by Layer

The Test Automation Engineer Agent should consider these layers where relevant:

* unit tests for local logic and edge cases
* integration tests for module or service interaction
* contract or schema validation for changed interfaces
* end-to-end or workflow validation for critical user or operational paths

Not every issue needs every layer, but the validation output should say which layers were used and why.

## Regression Update Rules

Automated validation should capture:

* what regression protection was added or updated
* what existing checks were relied on
* what changed behavior still lacks automated protection

Regression notes should make it obvious whether the issue improved, preserved, or weakened automated confidence.

## Required Output Format

Automated validation output should use these sections:

* `## Validation Scope`
* `## Checks Run`
* `## Coverage Summary`
* `## Regression Notes`
* `## Automation Gaps`
* `## Release Recommendation`

## Automation Gap Rules

Automation gaps should be documented when:

* a critical or important path changed without automated coverage
* a test layer could not be run credibly
* infrastructure, tooling, or data limitations reduced confidence
* manual QA will need to compensate for missing automation

Each gap should state:

* what is not automated
* why the gap exists
* whether the gap is acceptable for the current release decision

## Handoff to QA and Release

The Test Automation Engineer Agent output should tell downstream stakeholders:

* which checks passed
* which risk areas remain sensitive
* which areas need exploratory or manual validation
* whether any automation gaps affect release confidence

QA and release stakeholders should not need to infer validation depth from CI output alone.

## Escalation Rules

Escalate when:

* required validation cannot be run credibly
* a high-risk change lacks sufficient automated evidence
* regression protection is missing on a critical path
* automation gaps materially affect release confidence

Escalation outcomes:

* block progression until evidence improves
* add explicit QA focus areas
* capture follow-up work for missing automation
* require human approval to proceed with known coverage gaps

## Definition of Done for Test Automation Workflow

The Test Automation Engineer Agent workflow is complete when:

* validation depth matches the risk tier
* coverage expectations are documented clearly
* regression notes are explicit
* automation gaps are visible to QA and release stakeholders
