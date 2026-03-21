# CTB Monorepo Structure and Domain Ownership Model

## Purpose

This document defines the initial monorepo structure for Crown Trade Bot so product apps, shared packages, simulator services, reporting, and automation can evolve without boundary drift.

It is the implementation-ready monorepo baseline for `CTB-14`.

## Monorepo Goals

The CTB monorepo should:

* separate business domains from platform concerns
* keep shared contracts and utilities in reusable packages instead of duplicating them across apps
* make ownership clear enough that agent-assisted changes stay inside defined boundaries
* support simulator-first product architecture today and future live-execution extensions later
* make protected paths explicit for high-risk or sensitive modules

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

## Recommended Application Workspaces

### `apps/web`

Purpose:

* operator-facing web UI
* dashboard views
* daily report access and links
* settings and strategy controls

Ownership:

* UI / UX
* Senior Software Engineer
* QA

### `apps/api`

Purpose:

* public and internal HTTP API surface
* orchestration endpoints
* report-read endpoints
* control-plane workflows

Ownership:

* Solution Architect
* Senior Software Engineer
* Security

### `apps/simulator-worker`

Purpose:

* market-data ingestion coordination
* simulation event processing
* execution-model application
* position and portfolio updates

Ownership:

* Solution Architect
* Senior Software Engineer
* Test Automation

### `apps/reporting-worker`

Purpose:

* daily P&L report generation
* report artifact publishing preparation
* report history and retention tasks

Ownership:

* Senior Software Engineer
* QA
* DevOps / Platform / SRE

### `apps/notification-worker`

Purpose:

* owner-facing notification delivery
* alert formatting
* retry and delivery-status handling

Ownership:

* Senior Software Engineer
* Security
* DevOps / Platform / SRE

## Recommended Shared Packages

### `packages/types`

Purpose:

* canonical shared types
* DTOs and contracts
* event payload definitions

Rules:

* shared contracts live here once they are needed by more than one app
* downstream apps consume, but do not redefine, shared transport types

### `packages/schemas`

Purpose:

* shared validation schemas
* domain-safe parsing rules
* event and config validation

Rules:

* external inputs should be validated here or in app-local schemas that later promote here when shared

### `packages/market-data`

Purpose:

* canonical market event models
* provider normalization helpers
* freshness and timestamp handling

Rules:

* provider adapters may depend on this package
* simulator core consumes canonical market events only

### `packages/simulator-core`

Purpose:

* trade-intent handling
* simulation state transitions
* fill/slippage/fee model interfaces
* portfolio and ledger domain logic

Rules:

* this package is the protected simulator core
* it must not depend on provider-specific integrations or live broker SDKs

### `packages/reporting-core`

Purpose:

* daily summary assembly
* P&L presentation shaping
* report aggregation interfaces

Rules:

* reporting consumes canonical portfolio outputs
* it must not duplicate portfolio accounting logic

### `packages/notification-core`

Purpose:

* message templates
* alert classes
* notification payload shaping

Rules:

* transport adapters consume this package
* it must not own business calculations

### `packages/config`

Purpose:

* typed environment configuration
* app and worker settings
* feature flags and runtime toggles

Rules:

* all app configuration should be parsed and typed here or through local modules aligned to this pattern

### `packages/test-utils`

Purpose:

* shared test fixtures
* fake event builders
* deterministic time helpers
* scenario setup utilities

## Domain-to-Workspace Mapping

| Domain | Primary workspace(s) |
| --- | --- |
| market data | `apps/simulator-worker`, `packages/market-data` |
| strategy input | `apps/api`, future strategy modules under `packages/` |
| simulation engine | `packages/simulator-core`, `apps/simulator-worker` |
| portfolio and ledger | `packages/simulator-core` |
| reporting | `packages/reporting-core`, `apps/reporting-worker`, `apps/web` |
| notifications | `packages/notification-core`, `apps/notification-worker` |
| shared contracts | `packages/types`, `packages/schemas` |
| configuration and runtime policy | `packages/config`, `infra/` |

## Ownership Model

Ownership should be explicit at two levels:

### 1. Domain ownership

Used for architecture, approval, and review responsibility.

### 2. Workspace ownership

Used for implementation and code review routing.

Initial ownership model:

* `apps/web`: UI / UX + Senior Software Engineer + QA
* `apps/api`: Solution Architect + Senior Software Engineer + Security
* `apps/simulator-worker`: Solution Architect + Senior Software Engineer + Test Automation
* `apps/reporting-worker`: Senior Software Engineer + QA + DevOps / Platform / SRE
* `apps/notification-worker`: Senior Software Engineer + Security + DevOps / Platform / SRE
* `packages/simulator-core`: Solution Architect + Senior Software Engineer + Security
* `packages/market-data`: Solution Architect + Senior Software Engineer
* `packages/reporting-core`: Senior Software Engineer + QA
* `packages/notification-core`: Senior Software Engineer + Security
* `packages/types` and `packages/schemas`: Solution Architect + Senior Software Engineer
* `infra/`: DevOps / Platform / SRE + Security

## Protected Paths

The following areas should be treated as protected or high-risk paths in CI and review policy.

### `packages/simulator-core/**`

Reason:

* portfolio accounting
* simulated execution
* P&L integrity

### `packages/market-data/**`

Reason:

* canonical data normalization
* timing and freshness assumptions

### `packages/reporting-core/**`

Reason:

* daily report correctness
* published P&L outputs

### `apps/notification-worker/**`

Reason:

* owner contact delivery
* local delivery integration
* potential secret or PII handling

### `packages/config/**`

Reason:

* runtime behavior
* secret and environment parsing

### `infra/**`

Reason:

* deployment and CI/CD behavior
* operational configuration

## Shared Package Rules

### Rule 1: shared contracts move down, not sideways

When two or more apps need the same contract, move it into a shared package rather than copying it.

### Rule 2: application code depends inward on packages

Apps may depend on shared packages.
Shared packages must not depend on app-specific code.

### Rule 3: domain cores stay integration-agnostic

`simulator-core`, `reporting-core`, and `notification-core` should define business logic and interfaces, not transport-specific implementations.

### Rule 4: integration adapters stay at the edges

Provider-specific market-data adapters, local message transport adapters, and deployment-specific integrations should live in app or edge-layer modules, not in core packages.

### Rule 5: protected-path changes require stronger scrutiny

Changes touching protected paths should trigger:

* stronger review expectations
* explicit validation evidence
* architecture or security review when applicable

## Alignment to the CTB Agent Workflow

The monorepo structure should support the 8-agent SDLC directly.

### BA / PO Agent

Uses domain boundaries to size work and avoid ambiguous multi-domain stories.

### UI / UX Agent

Primarily scopes to `apps/web` and any UI contracts used by the reporting flow.

### Solution Architect Agent

Owns cross-workspace boundaries, package placement, and protected-path decisions.

### Senior Software Engineer Agent

Implements inside a bounded workspace and avoids hidden cross-app coupling.

### Test Automation Engineer Agent

Uses workspace boundaries to choose unit, integration, and end-to-end test layers.

### QA Agent

Uses app boundaries to validate user-facing and operational workflows.

### DevOps / Platform / SRE Agent

Owns `infra/`, environment wiring, worker scheduling, and operational deployment controls.

### Security Agent

Reviews protected paths, config handling, local notification delivery, and credential-sensitive edges.

## Recommended Initial Creation Order

When implementation begins, create workspaces in this order:

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

This order supports simulator-first delivery before UI polish.

## Risks and Mitigations

### Risk 1: app sprawl without stable package boundaries

Mitigation:

* define ownership early
* keep shared contracts in dedicated packages
* require architecture review for new top-level workspaces

### Risk 2: core business logic leaks into report or notification apps

Mitigation:

* keep portfolio accounting in `simulator-core`
* make reporting and notification downstream consumers only

### Risk 3: protected paths are identified too late

Mitigation:

* document protected paths now
* wire them into `CTB-17` CI/CD policy work

### Risk 4: future live-trading concerns distort current simulator design

Mitigation:

* keep future live execution as a separate edge concern
* avoid broker-specific dependencies inside core packages

## Recommended Next Implementation Work

This document should feed:

* `CTB-15` for reporting and GitHub Pages publication design in `docs/architecture/ctb-daily-reporting-and-github-pages.md`
* `CTB-16` for local notification architecture
* `CTB-17` for protected-path enforcement in CI/CD
* future repo bootstrap work to create the actual workspace skeletons
