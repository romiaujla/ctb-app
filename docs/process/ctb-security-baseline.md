# CTB Security Baseline

## Purpose

This document defines the reusable minimum security baseline for CTB delivery work.

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/process/ctb-cicd-validation-baseline.md`
* `docs/process/ctb-security-agent-workflow.md`
* `docs/process/ctb-validation-matrix.md`

## Baseline Goals

The CTB security baseline should:

* reduce avoidable risk in local-first runtime, reporting, notification, and automation workflows
* keep secret and configuration handling explicit
* make dependency and supply-chain review expectations reusable
* reinforce protected-path care for sensitive workflows
* support later CI automation and security-review evidence

## Secret-Handling Baseline

CTB must treat secrets, credentials, tokens, and private keys as high-scrutiny data.

Minimum rules:

* never commit secrets, credentials, tokens, private keys, or sensitive owner-contact routing details
* prefer environment variables or owner-local secret stores over checked-in configuration files
* redact secrets and sensitive identifiers from logs, screenshots, PR descriptions, and issue comments
* fail closed when required secret material is missing or malformed
* document secret requirements by purpose rather than copying real values into repo docs

Applies especially to:

* local notification delivery credentials
* future deployment tokens
* provider API keys
* owner contact-routing data

## Configuration Hygiene Baseline

Runtime configuration should be typed, validated, and scoped to the minimum necessary surface.

Minimum rules:

* validate configuration before business logic or delivery attempts begin
* distinguish secret fields from non-secret settings explicitly
* keep sensitive configuration local unless a shared cloud storage need is deliberately approved
* avoid permissive defaults that silently weaken safety posture
* record configuration assumptions in docs and validation notes when automation is missing

Configuration hygiene should protect:

* local worker settings
* runtime permissions
* report-publication settings
* notification transport settings

## Dependency and Supply-Chain Baseline

Dependency decisions should be reviewable before they become trusted runtime inputs.

Minimum rules:

* justify new dependencies when they affect sensitive workflows, runtime posture, or operational integrity
* prefer well-maintained dependencies with clear ownership and update paths
* review dependency additions or upgrades for security impact before merge when they touch protected paths
* document missing automated dependency scanning as a manual-evidence gap until tooling exists
* avoid unnecessary expansion of trusted third-party surface area in early CTB delivery

Review focus should consider:

* runtime reachability
* maintenance posture
* transitive risk where material
* whether the dependency handles secrets, auth, financial logic, or operator-visible evidence

## Protected-Path Baseline

Protected-path care applies when a CTB change touches security-sensitive or operator-trust-sensitive behavior.

Sensitive areas include:

* financial logic and simulator decision rules
* reporting and notification integrity
* deployment configuration and runtime secrets
* auth or authorization behavior
* future tenant or identity boundaries
* shared contracts and schemas

Baseline expectations for protected-path work:

* call out the affected protected area in the PR description
* state the issue risk tier explicitly
* keep scope narrow and avoid unrelated cleanup
* include validation notes that explain how sensitive behavior was reviewed
* escalate for human review when the change is high risk or evidence is insufficient

## Local-First Runtime Security Expectations

CTB currently favors owner-controlled local execution for notification and certain automation-sensitive paths.

Baseline rules:

* keep owner-local credentials and contact-routing details off shared public artifacts
* preserve clear boundaries between local runtime responsibilities and cloud-hosted status or artifact publication
* do not move sensitive local capabilities into cloud-hosted workflows without explicit architectural and security review
* prefer explicit evidence and audit output over hidden side effects for sensitive workflows

## Review and Evidence Expectations

Security posture should be visible in normal delivery artifacts, not implied.

Future CTB PRs and review notes should capture:

* whether secrets or sensitive config were touched
* whether protected paths were involved
* what manual or automated security evidence exists
* any missing controls or follow-up actions

When automation is unavailable, PRs should state the manual substitute used and the residual risk, if any.

## Reuse Rules

This baseline should be referenced by future implementation, validation, and release work when security-sensitive scope is present.

Reuse guidance:

* use this baseline for minimum posture
* use `docs/process/ctb-security-agent-workflow.md` for review procedure and findings format
* use `docs/process/ctb-cicd-validation-baseline.md` for merge-gate and protected-path validation requirements
* use `docs/process/ctb-validation-matrix.md` for mapping security validation into broader test planning
