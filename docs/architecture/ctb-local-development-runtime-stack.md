# CTB Local Development Runtime Stack

## Purpose

This document defines the planned local Docker-based runtime stack for Crown Trade Bot so future API, worker, persistence, and runtime-state work shares one consistent development and validation envelope.

It is the implementation-ready runtime baseline for `CTB-39`.

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/architecture/ctb-monorepo-structure.md`
* `docs/process/ctb-devops-platform-sre-agent-workflow.md`

## Runtime Goals

The CTB local runtime should:

* provide one repeatable Docker-local operating model for all planned CTB services
* keep application entrypoints and shared dependencies aligned to the approved workspace targets
* separate durable business state from transient coordination state
* support local development, validation, and debugging without requiring hosted infrastructure
* give downstream setup stories a stable runtime contract without over-specifying implementation mechanics

## Local-First Operating Model

CTB should treat local Docker execution as the default development and validation environment for runtime-sensitive work.

This means:

* core application services should run as containers on one local Docker network
* durable local data should stay inside the CTB-local Postgres service rather than ad hoc files or per-service stores
* transient coordination state should use Redis rather than hidden in-memory side channels
* service startup should be reproducible enough that future contributors can boot the same baseline stack on one machine
* host-specific shortcuts should be treated as exceptions, not the default runtime contract

Planning rule:

* exact Compose files, startup commands, image tags, and bootstrap scripts remain implementation work for follow-on stories

## Planned Local Runtime Stack

The local CTB development stack should consist of these runtime roles:

| Runtime component | Planned target | Role in local development |
| --- | --- | --- |
| API service | `apps/api` | control-plane HTTP surface, orchestration entrypoint, and read/write boundary for future operator and integration actions |
| simulator worker | `apps/simulator-worker` | market-data coordination, simulation processing, and portfolio-update workflows |
| reporting worker | `apps/reporting-worker` | report-generation and publication-preparation runtime |
| notification worker | `apps/notification-worker` | owner-facing notification formatting, delivery, and retry runtime |
| Postgres | shared local dependency | system-of-record persistence for durable CTB data and migration-backed schema evolution |
| Redis | shared local dependency | transient coordination for queues, dedupe, retry, and cache-like runtime state |

## Service Responsibilities

### API service

The API container should:

* expose the primary HTTP boundary for operator and future integration workflows
* orchestrate application use cases rather than embed worker-only background processing loops
* depend on shared packages for contracts, validation, and config instead of maintaining parallel runtime rules

### simulator worker

The simulator worker container should:

* execute background simulation and market-data processing flows
* own long-running or scheduled workload execution that should not live in the API request path
* persist durable outputs to Postgres and use Redis only for transient coordination concerns

### reporting worker

The reporting worker container should:

* generate CTB reports from durable stored data
* prepare artifacts for downstream publication or review flows
* remain decoupled from notification-delivery concerns except through explicit artifacts or events

### notification worker

The notification worker container should:

* transform explicit report, alert, or workflow signals into owner-facing notifications
* own delivery retries and temporary delivery coordination
* avoid becoming a durable source of truth for business state

## Dependency Responsibilities

### Postgres

Postgres is the planned durable local system of record.

It should own:

* canonical application data
* simulator, reporting, and future API persistence needs
* migration-managed schema evolution
* data that must survive container restarts in local development

Postgres should not be replaced by service-local files or hidden per-container stores for durable CTB state.

### Redis

Redis is the planned transient runtime dependency.

It should own:

* queue coordination
* retry and dedupe support
* ephemeral cache-like state
* runtime handoff state that does not represent durable business truth

Redis should not become the durable store for canonical CTB records.

Planning rule:

* the exact queue, dedupe, cache, and test-harness boundaries are refined in `CTB-41`

## Container Boundary Rules

### Rule 1: every deployable CTB service should map to one planned app workspace

The local runtime should reflect the approved workspace plan:

* `apps/api`
* `apps/simulator-worker`
* `apps/reporting-worker`
* `apps/notification-worker`

### Rule 2: shared dependencies stay shared

Postgres and Redis should be shared local dependencies for the CTB stack rather than re-created as private service-specific data stores.

### Rule 3: durable and transient state stay separated

Postgres owns durable truth.
Redis owns transient coordination.
Application containers should not blur those responsibilities.

### Rule 4: local runtime assumptions must stay implementation-ready

The runtime baseline should be specific enough to guide setup work but should not freeze:

* image-build mechanics
* exact healthcheck commands
* final startup order implementation
* hosted deployment topology

## Planned Networking and Data Model Expectations

The local stack should assume:

* one shared Docker network for CTB-local service communication
* one persistent local Postgres volume or equivalent durable local storage strategy
* environment-driven configuration passed into containers through typed configuration handling
* explicit service-to-dependency connections instead of implicit localhost-only assumptions inside application code

Planning rule:

* typed configuration validation and database-bootstrap details are handed to `CTB-40`

## Validation Expectations

Future implementation should make it easy to verify:

* the API and worker containers can boot against the same local dependency stack
* Postgres and Redis responsibilities are visible from configuration and architecture, not inferred from tribal knowledge
* local runtime failures can be isolated to a service or dependency boundary
* runtime-sensitive validation can reuse the same baseline rather than inventing issue-by-issue setup steps

## Downstream Handoff

This runtime baseline should feed:

* `CTB-40` for the local Postgres direction, Prisma baseline, migration workflow, and typed config validation
* `CTB-41` for Redis policy, queue and dedupe boundaries, and the testcontainers integration-test harness direction
* later implementation stories that create the actual Docker, bootstrap, and workspace runtime assets

## Risks and Mitigations

### Risk 1: local runtime sprawl

Mitigation:

* define one shared Docker-local envelope before service setup work begins
* require downstream implementation to attach to the common stack
* treat service-specific local shortcuts as exceptions

### Risk 2: dependency misuse

Mitigation:

* state clearly that Postgres is durable and Redis is transient
* hand the deeper dependency rules to the focused follow-on stories
* keep service responsibilities explicit in the runtime baseline

### Risk 3: planning drifts into infrastructure implementation

Mitigation:

* keep image-build, Compose syntax, and hosted deployment decisions out of this story
* preserve this document as a planning-level runtime contract
* push executable setup details into later implementation work

## Recommended Next Implementation Work

This document should feed:

* local container and bootstrap setup for the planned CTB services
* typed config and Prisma-backed persistence setup work
* Redis-backed transient-state and integration-test harness planning
