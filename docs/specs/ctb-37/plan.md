# CTB-37 Plan

## Context

`CTB-37` is a medium-risk repository-foundation story because it defines the shared tooling and automation conventions that later apps, packages, and pull requests must inherit.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus an implementation-ready process baseline for shared tooling, validation, and GitHub Actions expectations.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reusable process document for shared tooling and GitHub Actions expectations
* small cross-document link updates so the repository foundation sequence points to the correct issue

## Domain Boundaries

Affected domains:

* shared TypeScript conventions
* linting and formatting expectations
* package and workspace conventions
* GitHub Actions validation expectations
* protected-path and merge-gate planning

Unaffected domains:

* concrete workspace creation
* exact CI workflow YAML implementation
* simulator, API, reporting, or notification feature behavior
* production infrastructure rollout details

## Contracts and Interfaces

Artifacts will define:

* the shared repository tooling expectations every workspace should inherit
* the package-convention baseline for future apps and shared packages
* the expected GitHub Actions jobs and PR merge-gate behavior
* the boundary between this planning story and future tooling implementation work

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* one exact package-manager command surface
* one finished GitHub Actions YAML design
* package-level implementation details that belong to `CTB-38`
* hard validation thresholds that need executable code before they become meaningful

## Risks

* If the tooling baseline is vague, future workspaces will create inconsistent local standards.
* If this story chooses exact commands too early, implementation work will inherit brittle assumptions.
* If GitHub Actions expectations stay abstract, later CI setup work will recreate policy from scratch.

## Open Questions

* Exact command names and workflow file structure remain intentionally open for later setup work.
* Selective job execution and caching strategy can be refined once actual packages and apps exist.

## Approvals

Recommended review focus:

* usefulness of the tooling baseline for future repository setup work
* clarity of the package and GitHub Actions expectations
* consistency with the `CTB-36` monorepo structure baseline
