# CTB Release Readiness Gates

## Purpose

This document defines the reusable CTB release-readiness and progression gate model.

It builds on:

* `docs/process/ctb-cicd-validation-baseline.md`
* `docs/process/ctb-qa-agent-workflow.md`
* `docs/process/ctb-security-agent-workflow.md`
* `docs/process/ctb-jira-workflow.md`
* `docs/templates/release-evidence-template.md`

## Gate Goals

The readiness model should:

* require explicit evidence before merge or release progression
* distinguish CI evidence from manual review and approval checkpoints
* keep scope-safe signoff visible
* make missing readiness evidence a blocker rather than an assumption

## Readiness Checkpoints

### 1. CI and automated evidence

Expected when applicable:

* repository quality checks
* type-check and tests
* contract or integration validation
* security or secret-scanning evidence for sensitive paths

Rule:

* missing automation must be replaced with explicit manual evidence in the PR

### 2. QA checkpoint

Expected when relevant:

* acceptance-criteria confirmation
* exploratory coverage for workflow or UI changes
* release recommendation of `Release Ready`, `Release Ready with Cautions`, or `Not Release Ready`

Rule:

* user-visible or workflow-critical behavior should not advance on automation evidence alone when exploratory uncertainty remains

### 3. Security checkpoint

Expected when relevant:

* security review status
* unresolved findings visibility
* confirmation of secret, config, and protected-path handling

Rule:

* high-risk unresolved security concerns block progression

### 4. Release-preparation checkpoint

Expected before release-ready progression:

* deployment plan
* monitoring expectations
* rollback plan
* named release owner or accountable approver

Rule:

* if rollback is not credible, readiness is not complete

## Scope-Safe Signoff

Signoff should confirm the change remains within the linked Jira scope.

Required signoff expectations:

* PR scope matches the linked issue
* residual risks are named explicitly
* missing evidence or manual substitutes are documented
* human approval is visible where process rules require it

Scope-safe signoff should reject:

* unrelated cleanup mixed into sensitive changes
* implicit approval without evidence
* hidden residual risk

## Progression States

Guidance for progression:

* `Ready for Validation`: implementation complete with changed-scope and expected test-layer notes
* `In Validation`: automation, QA, and security evidence being gathered
* `Ready for Release`: validation evidence complete and release handoff prepared
* `Done`: human approval captured and release outcome accepted

If Jira state customization is limited, PR and Jira comments should still make the intended progression stage explicit.

## Reuse in PRs and Release Evidence

Future CTB PRs and release notes should state:

* which checkpoints were applicable
* what evidence exists for each checkpoint
* what manual review occurred
* what residual risks remain
* who approved progression when human approval was required

Use `docs/templates/release-evidence-template.md` as the standard close-out shape for release-ready changes.
