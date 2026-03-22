# CTB-37 Spec

## Problem

CTB does not yet define one shared tooling and repository-convention baseline, which would let future apps and packages drift into inconsistent TypeScript, linting, formatting, package, and CI expectations.

## Goal

Define the shared tooling baseline for CTB covering TypeScript expectations, linting and formatting conventions, package standards, and baseline GitHub Actions expectations at a planning level.

## Scope

This story covers:

* shared TypeScript expectations for future apps and packages
* linting and formatting conventions at a repository level
* package and workspace convention guidance for downstream implementation stories
* baseline GitHub Actions expectations for pull-request and main-branch validation
* reusable validation and protected-path expectations that future tooling implementation can inherit

This story does not cover:

* implementing the actual toolchain files or workflow YAMLs
* creating the concrete workspace directories
* product runtime, infrastructure, or domain behavior

## Requirements

1. CTB must define shared TypeScript and repository tooling expectations.
2. CTB must define linting, formatting, and package conventions at a planning level.
3. CTB must identify the baseline GitHub Actions expectations for future implementation.
4. CTB must make the conventions reusable across all future CTB workspaces.
5. CTB must keep exact commands and implementation mechanics open for later setup work.

## Success Criteria

The spec is successful when:

* future setup work can implement one coherent tooling baseline instead of one-off workspace rules
* downstream stories can tell what repository-wide quality conventions they are expected to inherit
* GitHub Actions planning has enough structure to define required checks without inventing new policy

## Primary Artifact

Implementation-ready process baseline:

* `docs/process/ctb-cicd-validation-baseline.md`
