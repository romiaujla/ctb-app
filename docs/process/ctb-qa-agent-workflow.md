# CTB QA Agent Exploratory and Release Validation Workflow

## Purpose

This document defines how the QA Agent performs functional validation, exploratory testing, and release-readiness assessment for CTB changes.

It provides:

* a standard manual and exploratory validation output
* defect reporting and reproduction expectations
* release recommendation criteria
* alignment between QA findings, acceptance criteria, and workflow outputs

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/process/ctb-jira-workflow.md`
* `docs/process/ctb-test-automation-engineer-agent-workflow.md`
* `docs/process/ctb-senior-software-engineer-agent-workflow.md`

## Workflow Goals

The QA Agent workflow should:

* verify functional behavior against acceptance criteria
* use exploratory testing by default where workflow risk or ambiguity remains
* make defects reproducible and actionable
* provide a release recommendation that the release owner can consume directly
* expose gaps between automated confidence and actual user or operator behavior

## Required Inputs

QA validation should consume:

* Jira issue acceptance criteria
* implementation handoff notes
* automated validation output
* relevant UI, workflow, or release constraints
* known limitations and automation gaps

If those inputs are incomplete, the QA output should state the missing evidence and resulting risk.

## Default QA Coverage

QA should cover these areas when relevant:

* acceptance-criteria confirmation
* critical workflow or user-path validation
* exploratory testing around edge conditions, negative paths, and ambiguous behavior
* regression checks informed by changed scope and automation gaps

Exploratory testing is expected by default when the issue changes user-visible or workflow-critical behavior.

## Required Output Format

QA output should use these sections:

* `## QA Scope`
* `## Pass/Fail Status`
* `## Exploratory Coverage`
* `## Defects and Concerns`
* `## Reproduction Steps`
* `## Release Recommendation`

## Pass/Fail Rules

QA output should clearly state:

* whether the issue passed functional validation
* whether any concerns are blocking, cautionary, or informational
* whether release progression is recommended, conditional, or blocked

Avoid ambiguous wording that forces release owners to infer overall QA status.

## Defect Reporting Rules

Every defect or concern should include:

* concise title
* observed behavior
* expected behavior
* impact summary
* severity or release concern level

If the issue is not a defect but still affects confidence, record it as a concern rather than leaving it implicit.

## Reproduction Step Rules

Reproduction steps should be:

* specific
* minimal
* ordered
* environment-aware when that matters

If a problem cannot be reproduced consistently, the QA output should say so explicitly and describe the conditions observed.

## Release Recommendation Criteria

The QA Agent should end with one of these recommendations:

* `Release Ready`
* `Release Ready with Cautions`
* `Not Release Ready`

The recommendation should explain:

* what passed
* what remains risky
* whether the risk is acceptable for the intended release decision

## Escalation Rules

Escalate when:

* a defect is blocking acceptance criteria
* exploratory testing reveals a release-significant concern
* automation gaps create too much uncertainty for release confidence
* reproduction is inconsistent in a way that suggests deeper instability

Escalation outcomes:

* block release progression
* require additional engineering or automation work
* add focused retest scope
* require explicit human acceptance of residual QA risk

## Definition of Done for QA Workflow

The QA Agent workflow is complete when:

* pass/fail status is explicit
* exploratory coverage is documented
* defects or concerns are actionable
* reproduction steps are clear where needed
* release owners can use the QA output directly in their decision
