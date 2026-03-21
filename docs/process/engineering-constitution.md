# Engineering Constitution

## Purpose

This document is the canonical engineering policy for CTB. It defines mandatory standards for coding, branching, commits, Jira hygiene, review, and release behavior.

## Scope

Applies to all contributors, human and AI, across all repository directories.

## Core Principles

* ship in small, reviewable increments
* keep planning and implementation traceable to Jira work items
* prefer deterministic, automated quality gates over manual checks
* keep simulator, reporting, notification, and future execution concerns separated by clear boundaries
* treat standards as defaults; exceptions require explicit documented rationale

## Coding Standards

* Use TypeScript strict mode for new code where applicable.
* Validate external input with Zod before business logic.
* Keep modules cohesive and avoid hidden cross-package coupling.
* Add tests for behavior changes at the appropriate layer.
* Do not commit generated build artifacts unless explicitly required.
* Never commit secrets, API keys, credentials, or sensitive user information.
* Shared contracts, schemas, and types should be defined once and reused rather than copied.
* Simulator core logic must stay separate from provider-specific market-data or future execution adapters.
* Reporting and notification flows must produce explicit operational evidence rather than opaque side effects.

## Branching Standard (Mandatory)

Branch naming maps to Jira issue type:

* Task -> `chore/CTB-<id>-<slug>`
* Story -> `feat/CTB-<id>-<slug>`
* Bug -> `fix/CTB-<id>-<slug>`
* Hotfix -> `hotfix/CTB-<id>-<slug>`

## Commit Standard (Mandatory)

Commit format:

* `<type>: CTB-<id> - <message>`

Type mapping derives from branch prefix:

* `chore` branch -> `chore` commit prefix
* `feat` branch -> `feat` commit prefix
* `fix` branch -> `fix` commit prefix
* `hotfix` branch -> `hotfix` commit prefix

## Jira Standard (Mandatory)

For all non-subtask issues, use Lean template:

* `## Problem`
* `## Goal`
* `## User Story`
* `## Acceptance Criteria`

Implementation details belong in repository docs and should be linked from Jira.

## Pull Request Standard

* When squash merge is used, the PR title must match the commit format exactly: `<type>: CTB-<id> - <message>`.
* PR description includes summary, Jira linkage, scope statement, and validation notes.
* Required checks must pass before merge.
* Keep PR scope aligned with Jira scope; split or follow up when scope drifts.

## Release and Versioning Standard

* Trunk branch is `main`.
* Releases should be safe, reversible, and observable.
* Production-facing changes require explicit human ownership for release approval.

## Ownership and Change Control

* Primary owner: engineering lead for process and governance.
* Any change to this constitution requires:
  * Jira issue
  * PR with rationale in description
  * approval from the designated owner or reviewer

## Precedence

Order of precedence for repository rules:

1. this constitution
2. `AGENTS.md`
3. workflow-specific process docs
4. CI and hook automation rules
