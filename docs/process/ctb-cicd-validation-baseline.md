# CTB CI/CD Validation Baseline and Protected-Path Rules

## Purpose

This document defines the minimum CI/CD validation baseline for CTB and the protected-path rules that govern higher-risk changes.

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/process/ctb-jira-workflow.md`
* `docs/process/ctb-agent-governance.md`
* `docs/templates/release-evidence-template.md`

## Policy Goals

The validation baseline must:

* keep merges safe for AI-assisted and human-authored changes
* scale validation depth to CTB risk tiers
* make reviewer expectations explicit before release
* protect sensitive workflows from under-reviewed changes
* preserve delivery speed for low-risk documentation and localized code changes

## Risk-Tier Alignment

CTB validation requirements align to the risk tiers defined in `docs/process/ctb-jira-workflow.md`.

### Low risk

Typical changes:

* documentation
* prompt registry or template updates
* localized UI copy or styling with no logic changes
* isolated refactors with unchanged behavior

Minimum gates:

* repository formatting and lint checks where applicable
* type-check for affected packages where applicable
* tests covering the changed behavior, if executable code changed
* PR summary and validation notes

### Medium risk

Typical changes:

* business logic changes
* shared package updates
* API or contract changes
* notification or reporting behavior changes

Minimum gates:

* all low-risk gates
* unit and integration tests for affected behavior
* contract validation for changed interfaces
* reviewer verification that rollback is credible

### High risk

Typical changes:

* auth or authorization logic
* tenant isolation
* financial logic
* deployment configuration
* secrets handling
* data model or infrastructure changes

Minimum gates:

* all medium-risk gates
* security review evidence
* secret scanning and dependency or image scanning where applicable
* explicit architecture or release gate approval when required by governance

## Required Validation Gates

### 1. Repository quality gates

Every change must satisfy the baseline checks that apply to the touched scope:

* lint
* type-check
* automated tests
* broken-link or markdown validation for documentation-only changes when available

If a repository-level check does not yet exist, the PR must explicitly call out the missing automation and record the manual substitute used for the issue.

### 2. Contract and integration gates

Changes that alter external or shared interfaces must include:

* contract test coverage or schema validation
* explicit identification of impacted consumers
* follow-up coordination notes when consumers are not updated in the same change

### 3. Security gates

Changes that touch secrets, deployment settings, auth, tenancy, owner contact data, or other sensitive workflows must include:

* secret scanning
* reviewer confirmation that no credentials or sensitive data were introduced
* security review notes for unresolved concerns

### 4. Release-readiness gates

Before merge, every PR must document:

* what changed
* how it was validated
* the residual risk, if any

Before release-ready issues move to release or done, the release evidence must also capture:

* deployment expectations
* monitoring or alert expectations
* rollback plan
* named human approval owner

Use `docs/templates/release-evidence-template.md` as the standard release evidence format.

## Protected Paths

Protected paths are repository areas that require elevated review care because they can affect tenant safety, financial correctness, operational integrity, or deployment posture.

| Protected area | Why it is protected | Required reviewer focus |
| --- | --- | --- |
| auth and authorization flows | mistakes can grant or remove access incorrectly | permission boundaries, fallback behavior, failure modes |
| tenancy and future multi-tenant boundaries | mistakes can leak or mix tenant data | data isolation, identifiers, shared-state handling |
| financial logic and simulator decision rules | mistakes can distort trading outcomes or reports | calculation correctness, determinism, edge cases |
| reporting and notification integrity | mistakes can mislead operators or suppress alerts | evidence accuracy, delivery guarantees, operator visibility |
| deployment configuration and runtime secrets | mistakes can expose systems or break environments | least privilege, secret hygiene, rollback safety |
| shared contracts and schemas | mistakes can break downstream consumers widely | compatibility, versioning, consumer impact |

## Protected-Path Rules

When a PR touches a protected path, it must:

* identify the protected area in the PR description
* call out the change risk tier explicitly
* include reviewer notes for the sensitive behavior being changed
* avoid mixing unrelated cleanup or refactors into the same PR
* include rollback guidance when the change can affect runtime behavior

High-risk protected-path changes should not be merged without the relevant human gate described in `docs/process/ctb-agent-governance.md`.

## Merge Expectations

Every CTB pull request must include:

* Jira issue linkage
* scope statement confirming the PR is limited to the linked issue
* validation notes listing the checks run
* residual risks or a statement that no material residual risk is known

Required checks must pass before merge. When squash merge is used, the PR title must match the constitution commit format.

## Enforcement Model

CTB should enforce this baseline in layers:

1. automated CI checks for lint, type-check, tests, and security scanning
2. branch protection requiring green checks before merge
3. reviewer attention rules for protected paths and high-risk changes
4. release evidence capture before production-facing work is marked complete

If one layer is temporarily unavailable, the missing control must be replaced with explicit manual evidence in the PR and corrected in a follow-up issue.

## Exceptions and Escalation

Exceptions are allowed only when the reason is documented and a human owner accepts the risk.

Escalate instead of merging when:

* required validation cannot be run credibly
* a protected-path change lacks the right reviewer
* rollback is not believable
* scope drift introduces unrelated risk

Approved exceptions must be documented in Jira and in the PR description with the owner of the follow-up action.
