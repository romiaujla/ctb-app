# CTB Monorepo Structure Baseline

## Purpose

This document defines the initial monorepo structure for Crown Trade Bot so future app, package, infrastructure, and automation work lands in predictable top-level locations without repository-boundary drift.

It is the implementation-ready monorepo baseline for `CTB-36`, extended by `CTB-38` with the concrete workspace-target plan.

## Monorepo Goals

The CTB monorepo should:

* separate business domains from platform concerns
* make repository boundaries clear before tooling and workspace implementation begin
* keep top-level directory choices stable so future stories do not create parallel structures
* support the simulator-first architecture direction while remaining extensible for future phases
* identify the concrete workspace targets that downstream implementation stories should reuse

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

* the concrete app targets for `apps/` are defined in the workspace plan below

### `packages/`

Purpose:

* shared domain libraries
* reusable contracts, schemas, and utilities
* implementation building blocks consumed by one or more apps

Planning rule:

* the initial shared-package targets are defined in the workspace plan below

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

### Rule 4: repository shape and workspace targets stay aligned

`CTB-36` defines the top-level structure, `CTB-37` defines the shared tooling baseline, and `CTB-38` defines the initial workspace targets that live inside this structure.

## Workspace Target Plan

The following workspaces define the planned CTB v1 application and shared-package targets.

### Planned Application Workspaces

#### `apps/web`

Role:

* operator-facing web experience
* dashboard and report-view access
* settings and strategy-control surfaces when UI delivery begins

Ownership intent:

* UI / UX
* Senior Software Engineer
* QA

#### `apps/api`

Role:

* HTTP API surface for control-plane and future integration needs
* orchestration endpoints
* read and write boundaries for external or internal application workflows

Ownership intent:

* Solution Architect
* Senior Software Engineer
* Security

#### `apps/simulator-worker`

Role:

* market-data ingestion coordination
* simulation event processing
* execution-model orchestration
* portfolio and ledger update workflows

Ownership intent:

* Solution Architect
* Senior Software Engineer
* Test Automation

#### `apps/reporting-worker`

Role:

* daily P&L report generation
* report publishing preparation
* report history and retention workflows

Ownership intent:

* Senior Software Engineer
* QA
* DevOps / Platform / SRE

#### `apps/notification-worker`

Role:

* owner-facing notification delivery
* alert formatting and routing
* retry and delivery-status handling

Ownership intent:

* Senior Software Engineer
* Security
* DevOps / Platform / SRE

### Planned Shared Packages

#### `packages/types`

Role:

* canonical shared types
* DTOs and shared contracts
* transport and artifact type definitions reused across workspaces

Ownership intent:

* Solution Architect
* Senior Software Engineer

#### `packages/schemas`

Role:

* shared validation schemas
* Zod-based parsing rules
* reusable input and config validation for multiple workspaces

Ownership intent:

* Solution Architect
* Senior Software Engineer

#### `packages/market-data`

Role:

* canonical market event models
* provider normalization helpers
* freshness and timestamp handling shared by ingestion and simulation flows

Ownership intent:

* Solution Architect
* Senior Software Engineer

#### `packages/simulator-core`

Role:

* trade-intent handling
* simulation state transitions
* fill, slippage, fee, and portfolio accounting logic

Ownership intent:

* Solution Architect
* Senior Software Engineer
* Security

#### `packages/reporting-core`

Role:

* daily summary assembly
* P&L presentation shaping
* report aggregation interfaces

Ownership intent:

* Senior Software Engineer
* QA

#### `packages/notification-core`

Role:

* message templates
* alert classes
* notification payload shaping

Ownership intent:

* Senior Software Engineer
* Security

#### `packages/config`

Role:

* typed environment configuration
* app and worker settings
* feature flags and runtime toggles

Ownership intent:

* DevOps / Platform / SRE
* Security
* Senior Software Engineer

#### `packages/test-utils`

Role:

* shared test fixtures
* fake event builders
* deterministic time helpers
* scenario setup utilities

Ownership intent:

* Test Automation
* Senior Software Engineer

## Domain-to-Workspace Mapping

| Domain | Primary workspace targets |
| --- | --- |
| market data | `apps/simulator-worker`, `packages/market-data` |
| strategy input and operator control | `apps/api`, `apps/web` |
| simulation engine | `packages/simulator-core`, `apps/simulator-worker` |
| portfolio and ledger | `packages/simulator-core` |
| reporting | `packages/reporting-core`, `apps/reporting-worker`, `apps/web` |
| notifications | `packages/notification-core`, `apps/notification-worker` |
| shared contracts and validation | `packages/types`, `packages/schemas` |
| configuration and runtime policy | `packages/config`, `infra/` |
| test support | `packages/test-utils` |

## Recommended Initial Creation Order

When implementation work begins, create workspaces in this order:

1. `apps/api`
2. `packages/types`
3. `packages/schemas`
4. `packages/simulator-core`
5. `packages/market-data`
6. `apps/simulator-worker`
7. `packages/reporting-core`
8. `apps/reporting-worker`
9. `packages/notification-core`
10. `apps/notification-worker`
11. `apps/web`
12. `packages/config`
13. `packages/test-utils`

This order supports simulator-first delivery before UI polish and keeps shared contracts ahead of downstream consumers.

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

Primarily scopes to `apps/web` and any shared UI-facing contracts it depends on.

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

## Downstream Handoff

This completed foundation baseline should feed:

* `CTB-39` for the shared local Docker runtime envelope that these workspaces should assume
* later setup stories that create the actual apps and packages inside the approved targets
* future implementation issues that should attach work to one of the named workspaces instead of inventing new ones
* review routing and validation planning that depends on workspace ownership intent

## Risks and Mitigations

### Risk 1: top-level sprawl without a stable baseline

Mitigation:

* define the top-level layout before creating tooling or workspaces
* require follow-on stories to reuse the approved structure
* treat new top-level categories as an exception, not the default

### Risk 2: workspace targets become vague or overlap

Mitigation:

* keep each workspace target tied to a distinct role in the architecture
* keep shared packages reusable and application entrypoints separate
* require follow-on stories to attach to existing targets before proposing new ones

### Risk 3: the baseline becomes disconnected from the architecture direction

Mitigation:

* keep the layout aligned to simulator-first separation of apps, shared packages, infrastructure, and docs
* reference the monorepo baseline from follow-on planning docs

### Risk 4: future work recreates workspace targets ad hoc

Mitigation:

* use this document as the canonical workspace-target reference for the repository foundation chain
* route new workspace requests through explicit follow-up planning rather than ad hoc creation

## Recommended Next Implementation Work

This document should feed:

* `CTB-39` local runtime-stack planning for the approved CTB services
* later repository bootstrap work that creates the approved apps and packages
* future domain stories that need a concrete target workspace for implementation
* CI, validation, and review routing that depends on workspace ownership intent
