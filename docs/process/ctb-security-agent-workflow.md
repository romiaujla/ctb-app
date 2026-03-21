# CTB Security Agent Review and Remediation Workflow

## Purpose

This document defines how the Security Agent reviews CTB changes for secrets, PII, auth, authorization, tenant isolation, dependency risk, and policy compliance.

It provides:

* a consistent intake for security review
* a structured findings format
* severity-based remediation expectations
* escalation rules for critical or unresolved risk
* stage alignment for design, implementation, validation, and release

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/process/ctb-jira-workflow.md`
* `docs/process/ctb-agent-governance.md`
* `docs/process/ctb-cicd-validation-baseline.md`

## Workflow Goals

The Security Agent workflow should:

* identify meaningful risk before release progression
* make findings reviewable and actionable
* distinguish blocking security issues from follow-up work
* preserve explicit human approval for high-risk decisions
* keep evidence usable by engineering, QA, release, and reviewers

## Review Triggers

Security review is required when a change affects:

* secrets, credentials, tokens, or private keys
* PII, owner contact data, or sensitive operational data
* auth or authorization flows
* tenant isolation or future multi-tenant boundaries
* deployment configuration, runtime permissions, or infrastructure posture
* dependency additions or upgrades with security impact
* policy-sensitive workflows called out by architecture, QA, or release reviewers

Security review should also be requested when a change is medium or high risk and the delivery team is unsure whether the behavior creates a trust, privacy, or boundary concern.

## Review Inputs

The Security Agent review should consume:

* Jira issue summary and acceptance criteria
* linked design notes or ADRs when architecture is affected
* implementation summary and changed files
* automated validation output, including secret or dependency scanning where available
* known limitations, residual risks, and rollout notes

If these inputs are incomplete, the review should call out the missing evidence as a finding instead of assuming safety.

## Review Focus Areas

Every review should consider the areas relevant to the scope:

* secret exposure or unsafe secret handling
* PII collection, storage, transmission, or logging risk
* auth, authorization, and privilege boundaries
* tenant separation, shared-state handling, and identifier scoping
* dependency and supply-chain exposure
* policy compliance with repository and release rules

## Required Output Format

Security review output should be posted in Jira, PR notes, or release evidence using this structure:

### 1. Review summary

Include:

* review scope
* overall recommendation: `Approve`, `Approve with follow-up`, or `Block`
* reviewer name or accountable role

### 2. Findings table

Use one row per finding:

| ID | Severity | Area | Description | Evidence | Required remediation | Owner | Due stage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SEC-1` | `High` | tenant isolation | shared cache key omits tenant identifier | code review of cache helper | add tenant scoping before merge | implementation owner | before merge |

### 3. Residual risks

List any accepted or deferred risk with:

* why it is not fully remediated now
* who accepted the risk
* what follow-up issue or gate covers it

### 4. Escalation note

If any high or critical risk remains unresolved, include:

* blocking reason
* escalation owner
* next decision point

## Severity Model

Use these severities:

| Severity | Meaning | Typical examples | Default handling |
| --- | --- | --- | --- |
| `Critical` | active or near-certain risk of compromise, data exposure, or broken trust boundary | committed credential, tenant data leakage, broken auth check in privileged path | block merge and release, escalate immediately |
| `High` | serious security weakness with meaningful exploit or impact potential | missing authorization check, unsafe production secret handling, high-severity dependency with reachable path | block until remediated or explicitly accepted by accountable human owner |
| `Medium` | real weakness that should be fixed in the current delivery cycle unless scope is explicitly split | overly broad permissions, weak logging hygiene for sensitive fields, moderate dependency risk | remediate before release or capture approved follow-up with owner and due stage |
| `Low` | limited risk, hygiene gap, or defense-in-depth improvement | missing documentation of secret rotation, non-sensitive header hardening follow-up | capture follow-up and track to closure |

## Remediation Expectations

Remediation requirements by severity:

* `Critical`: immediate containment or fix, explicit escalation, and no merge or release progression until resolved
* `High`: fix before merge unless a designated human security owner documents a temporary exception and compensating controls
* `Medium`: fix before release by default; if deferred, create a follow-up issue with owner, rationale, and due stage
* `Low`: track as a follow-up or hygiene action if not resolved in the current issue

Every finding should name:

* the implementation owner
* the expected resolution stage
* any follow-up issue when work is deferred

## Escalation Path

Escalate immediately when:

* a `Critical` finding is identified
* a `High` finding cannot be remediated within the current issue
* evidence is insufficient to assess auth, tenancy, PII, or secret safety
* the change conflicts with the architecture or release gate expectations

Escalation path:

1. notify the engineering lead or designated security owner
2. mark the issue or PR as blocked for security review
3. document the blocking finding, evidence gap, and recommended next action
4. create a follow-up issue or ADR when the fix or decision exceeds current scope
5. require explicit human approval before the issue leaves validation or release gating

## Stage Alignment

### Design stage

Security review should challenge:

* trust boundaries
* auth and tenancy assumptions
* secrets usage
* data sensitivity

Output:

* design-stage risks
* approval gate recommendation
* required controls to verify during implementation

### Build stage

Security review should inspect:

* changed files and configuration
* dependency changes
* credential handling
* policy compliance

Output:

* finding list with required remediations
* blocked vs non-blocked determination
* follow-up verification notes for validation

### Validation stage

Security review should confirm:

* required scans or checks ran where applicable
* sensitive-path behavior has evidence
* unresolved findings are visible to QA and release owners

Output:

* validation-ready security status
* residual risks
* escalation note if the issue cannot progress safely

### Release stage

Security evidence should give the release owner:

* final status for open security findings
* approved exceptions, if any
* rollback or containment considerations for sensitive workflows

## Definition of Done for Security Review

Security review is complete when:

* review scope and recommendation are documented
* findings are severity-based and actionable
* remediation status is visible for every finding
* unresolved high-risk issues include an escalation note
* release stakeholders can determine whether the issue is safe to progress
