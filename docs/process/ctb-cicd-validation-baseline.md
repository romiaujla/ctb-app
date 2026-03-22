# CTB Shared Tooling, Validation, and GitHub Actions Baseline

## Purpose

This document defines the shared tooling baseline for CTB, including planning-level expectations for TypeScript, linting, formatting, package conventions, GitHub Actions validation, and protected-path review rules.

It is the implementation-ready shared tooling baseline for `CTB-37`.

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/process/ctb-jira-workflow.md`
* `docs/process/ctb-agent-governance.md`
* `docs/templates/release-evidence-template.md`

## Baseline Goals

The shared tooling baseline must:

* give every future workspace one common repository convention set
* keep TypeScript, linting, formatting, and package expectations reusable across apps and packages
* identify the baseline GitHub Actions jobs needed for safe pull requests and merges
* make reviewer expectations explicit before executable tooling is implemented
* preserve a clear boundary between planning policy and later setup work

## Shared Tooling Conventions

### TypeScript baseline

Future CTB workspaces should inherit these defaults:

* TypeScript is the standard language for application and shared-package code where applicable.
* New code should use strict mode, matching the engineering constitution.
* Shared compiler options should be defined centrally and extended by app or package-local configs rather than copied ad hoc.
* Path aliases, project references, or build partitioning should be introduced only when they support clear workspace boundaries rather than convenience-only coupling.

Planning rule:

* exact `tsconfig` file layout and build commands remain implementation work for a later setup story

### Linting baseline

Future CTB workspaces should inherit these defaults:

* one repository-standard linting approach should apply across apps and packages
* lint rules should prioritize correctness, readability, and unsafe-pattern detection over stylistic churn
* shared packages and application entrypoints should not carry conflicting lint profiles unless a documented exception exists

Planning rule:

* the exact linter package choice and command name remain open for implementation

### Formatting baseline

Future CTB workspaces should inherit these defaults:

* one repository formatter should control mechanical style choices
* formatting should be automated and low-debate so reviews focus on behavior and design
* formatting conventions should apply to code, JSON, markdown, and workflow files where practical

Planning rule:

* the exact formatter implementation and write-check strategy remain follow-on setup work

### Package and workspace conventions

Future CTB apps and packages should inherit these defaults:

* every workspace should declare a clear purpose and ownership intent
* shared packages should expose stable public surfaces rather than ad hoc deep imports
* package scripts should follow a common shape across workspaces so root automation can invoke them predictably
* repository-level automation should prefer shared conventions over workspace-specific exceptions

Planning rule:

* the concrete workspace catalog is defined in `CTB-38`, not here

## GitHub Actions Baseline

Future GitHub Actions implementation should provide:

### 1. Pull request validation

Every PR should run the repository-quality checks relevant to the changed scope, including:

* formatting or markdown validation where applicable
* linting where applicable
* type-checking where applicable
* automated tests for executable behavior changes where applicable

### 2. Protected-path and sensitive-change validation

Changes touching higher-risk repository areas should add the stronger checks and reviewer attention required by risk tier and protected-path guidance.

### 3. Main-branch confidence

The default branch should retain a baseline workflow that confirms merge safety and keeps foundational validation visible over time.

### 4. Documentation-first practicality

When automation is not yet implemented, PRs must record the manual validation substitute used so the policy remains enforceable before the full toolchain exists.

Planning rule:

* exact workflow files, caching strategy, matrix fan-out, and path-filter implementation remain later setup work

## Validation and Protected-Path Policy

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
