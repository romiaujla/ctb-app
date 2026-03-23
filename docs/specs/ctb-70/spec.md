# CTB-70 Spec

## Problem

The executable monorepo scaffold exists now, but it still lacks a shared enforcement layer for linting, formatting, package conventions, and CI validation, which leaves day-one development quality dependent on local habits instead of repo automation.

## Goal

Implement the shared TypeScript, linting, formatting, package-convention, and CI baseline needed for consistent day-one development in the CTB monorepo.

## Scope

This story covers:

- shared repository scripts for lint, format, typecheck, tests, and validation
- repo-wide linting and formatting configuration
- encoded package conventions for active workspaces
- GitHub Actions validation for pull requests and `main`
- issue-scoped Spec Kit artifacts for the tooling baseline

This story does not cover:

- deeper shared package implementations
- Docker-local runtime orchestration
- Prisma, environment validation, or Redis-backed runtime behavior

## Requirements

1. TypeScript strict-mode configuration must remain shared across workspaces rather than copied per package.
2. Root commands must enforce linting, formatting, typecheck, and baseline tests for active workspaces.
3. Workspace package conventions must be encoded in scripts or config and validated automatically.
4. GitHub Actions must run the baseline validation suite on pull requests and `main`.

## Success Criteria

The spec is successful when:

- contributors can run one root validation workflow for the active workspaces
- workspace package conventions are explicit and machine-checked
- pull requests receive baseline CI feedback for lint, typecheck, tests, and formatting

## Primary Artifacts

Reusable tooling assets:

- root linting and formatting configs
- package-convention validation script
- baseline CI workflow under `.github/workflows`
- tooling-focused Spec Kit artifacts under `docs/specs/ctb-70`
