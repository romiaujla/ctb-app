# CTB-70 Plan

## Context

`CTB-70` is a medium-risk tooling story because it sets the default validation contract for every later Milestone 1 implementation ticket and pull request.

The executable scaffold from `CTB-69` is already in place, so this issue should harden the shared developer experience without widening into runtime or domain implementation.

## Decision

Deliver the story as:

- one issue-scoped spec
- one issue-scoped plan
- one issue-scoped task list
- root linting, formatting, and test commands
- one package-convention enforcement script
- one baseline GitHub Actions workflow for pull requests and `main`

## Domain Boundaries

Affected domains:

- shared tooling configuration
- root developer scripts
- CI validation automation
- package manifest conventions

Unaffected domains:

- executable shared packages
- API, web, and worker runtime behavior beyond smoke-test coverage
- Docker-local runtime setup
- Prisma and runtime-state integration

## Contracts and Interfaces

Artifacts will define:

- the root commands contributors and CI should run
- shared linting and formatting expectations
- machine-checked package-manifest conventions for active workspaces
- the minimum CI gate sequence for pull requests and `main`

## Rollout Constraints

This issue must stay focused on shared tooling and must not pre-implement:

- package logic planned for `CTB-71`
- local container orchestration planned for `CTB-72`
- persistence and config work planned for `CTB-73`
- Redis-backed runtime and integration harness work planned for `CTB-74`

## Risks

- If root scripts drift from CI commands, local validation and PR validation will disagree.
- If package conventions remain partial, later workspaces may fork the repo contract.
- If lint or formatting rules are brittle, early implementation velocity may degrade.

## Open Questions

- Future issues may add stronger type-aware lint rules once more code exists.
- CI may later adopt path filtering or caching refinements as workspace count grows.

## Approvals

Recommended review focus:

- clarity of the root validation contract
- practical package-convention enforcement for active workspaces
- CI alignment with the Milestone 1 bootstrap acceptance criteria
