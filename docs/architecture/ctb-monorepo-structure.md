# CTB Monorepo Structure Baseline

## Purpose

This document defines the initial monorepo structure for Crown Trade Bot so future app, package, infrastructure, and automation work lands in predictable top-level locations without repository-boundary drift.

It is the implementation-ready monorepo baseline for `CTB-36`.

## Monorepo Goals

The CTB monorepo should:

* separate business domains from platform concerns
* make repository boundaries clear before tooling and workspace implementation begin
* keep top-level directory choices stable so future stories do not create parallel structures
* support the simulator-first architecture direction while remaining extensible for future phases
* create a clean handoff into tooling work in `CTB-37` and concrete workspace planning in `CTB-38`

## Recommended Top-Level Layout

The repo should use the following top-level structure:

```text
apps/
packages/
infra/
docs/
scripts/
```

### `apps/`

Application entrypoints and deployable services.

### `packages/`

Shared contracts, libraries, domain modules, and reusable tooling.

### `infra/`

Deployment, environment, CI/CD, and operational infrastructure assets.

### `docs/`

Architecture, process, specs, operating guides, and templates.

### `scripts/`

Local workflow helpers, repository automation, validation, and bootstrap tooling.

## Top-Level Responsibilities

### `apps/`

Purpose:

* deployable application entrypoints
* user-facing surfaces and service runtimes
* worker processes and externally exposed application boundaries

Planning rule:

* concrete app names and ownership routing are defined later, not in this story

### `packages/`

Purpose:

* shared domain libraries
* reusable contracts, schemas, and utilities
* implementation building blocks consumed by one or more apps

Planning rule:

* package catalog decisions belong in later workspace-definition planning, not in this story

### `infra/`

Purpose:

* deployment assets
* environment and CI/CD configuration
* operational infrastructure definitions and support automation

Planning rule:

* repository layout is defined here now, while actual tooling and pipeline design remain follow-on work

### `docs/`

Purpose:

* architecture notes
* process baselines
* issue-scoped specs
* templates, operating guides, and review evidence

Planning rule:

* docs remain a first-class workspace because CTB is still in a docs-first foundation phase

### `scripts/`

Purpose:

* repository bootstrap helpers
* local development automation
* validation and maintenance utilities

Planning rule:

* script standards and exact command set belong in `CTB-37`

## Boundary Rules

### Rule 1: top-level categories stay stable

Future stories should place work inside the established top-level layout rather than inventing new peer directories without explicit follow-up approval.

### Rule 2: `apps/` owns entrypoints, `packages/` owns reusable internals

Deployable surfaces belong under `apps/`.
Reusable logic and shared contracts belong under `packages/`.

### Rule 3: `infra/` and `scripts/` stay distinct

Operational infrastructure definitions belong under `infra/`.
Developer automation and repository helper scripts belong under `scripts/`.

### Rule 4: repository shape precedes tooling and workspace catalogs

This baseline defines the top-level structure only.
Tooling conventions belong in `CTB-37`, and the concrete workspace set belongs in `CTB-38`.

## Architecture Alignment

The top-level layout supports the current CTB direction by:

* preserving separation between deployable surfaces and shared domain logic
* keeping docs and process artifacts visible while the repo remains docs-first
* leaving enough room for simulator-first implementation without forcing premature workspace or tool choices

## Alignment to the CTB Agent Workflow

The monorepo structure should support the 8-agent SDLC directly.

### BA / PO Agent

Uses domain boundaries to size work and avoid ambiguous multi-domain stories.

### UI / UX Agent

Primarily scopes to future user-facing app work that will live under `apps/`.

### Solution Architect Agent

Owns top-level boundary decisions, package-placement rules, and cross-workspace structure.

### Senior Software Engineer Agent

Implements inside a bounded workspace and avoids hidden cross-app coupling.

### Test Automation Engineer Agent

Uses workspace boundaries to choose unit, integration, and end-to-end test layers.

### QA Agent

Uses app boundaries to validate user-facing and operational workflows.

### DevOps / Platform / SRE Agent

Owns `infra/`, environment wiring, worker scheduling, and operational deployment controls.

### Security Agent

Reviews repository-boundary changes that affect configuration, infrastructure, or other credential-sensitive edges.

## Follow-On Story Handoff

This baseline should feed:

* `CTB-37` for shared tooling, linting, formatting, package conventions, and GitHub Actions expectations
* `CTB-38` for the concrete app and shared-package workspace targets that will live inside this top-level structure
* later implementation stories that create actual directories and code inside the approved layout

## Risks and Mitigations

### Risk 1: top-level sprawl without a stable baseline

Mitigation:

* define the top-level layout before creating tooling or workspaces
* require follow-on stories to reuse the approved structure
* treat new top-level categories as an exception, not the default

### Risk 2: this story drifts into tooling or workspace-definition design

Mitigation:

* keep this document focused on top-level categories and responsibilities
* leave concrete tooling to `CTB-37`
* leave concrete workspace planning to `CTB-38`

### Risk 3: the baseline becomes disconnected from the architecture direction

Mitigation:

* keep the layout aligned to simulator-first separation of apps, shared packages, infrastructure, and docs
* reference the monorepo baseline from follow-on planning docs

### Risk 4: future work reintroduces stale issue lineage

Mitigation:

* update repository references to point to `CTB-36`
* use this issue as the canonical monorepo-layout reference for the repository-foundation chain

## Recommended Next Implementation Work

This document should feed:

* `CTB-37` shared tooling and CI baseline planning
* `CTB-38` concrete workspace-target planning
* later repository bootstrap work that creates the actual directories and packages inside the approved structure
