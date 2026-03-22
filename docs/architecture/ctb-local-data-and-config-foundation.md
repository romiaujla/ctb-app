# CTB Local Data and Config Foundation

## Purpose

This document defines the local persistence and typed configuration baseline for Crown Trade Bot so future services can share one database, migration, and runtime-config contract.

It is the implementation-ready data-and-config baseline for `CTB-40`.

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/architecture/ctb-monorepo-structure.md`
* `docs/architecture/ctb-local-development-runtime-stack.md`
* `docs/process/ctb-cicd-validation-baseline.md`

## Baseline Goals

The CTB data-and-config baseline should:

* give all CTB services one local Postgres direction for durable state
* establish Prisma as the shared schema and migration boundary
* make typed runtime configuration explicit before executable setup begins
* keep configuration and persistence conventions reusable across API and worker services
* preserve clear boundaries between durable state, transient state, and environment-driven runtime settings

## Local Database Direction

CTB should use one local Postgres database direction for the shared development stack.

The local database baseline should assume:

* the canonical local database is `ctb-app`
* API and worker services connect to the same Postgres instance defined by the runtime stack
* durable CTB records live in Postgres rather than service-local files or container-private stores
* local development favors one stable database target over per-service databases unless a future story explicitly justifies a split

Planning rule:

* exact connection URLs, local credentials, and volume/bootstrap details remain implementation work

## Postgres Responsibilities

Local Postgres should own:

* durable CTB business records
* schema-managed tables and relations used by API and worker services
* migration-backed structural changes
* persisted data needed for reproducible local validation and debugging

Local Postgres should not be bypassed by hidden local stores for application truth.

## Prisma Baseline

Prisma is the planned ORM and schema-management baseline for CTB.

Prisma should provide:

* one reviewable schema definition surface for CTB persistence
* one migration history for structural database changes
* generated client access patterns that can be shared across CTB services
* a consistent abstraction layer between application code and the local Postgres database

Planning rule:

* exact package layout, generation commands, and client wiring remain implementation work for later setup stories

## Migration Workflow Direction

The local migration workflow should follow these planning-level rules:

### Rule 1: schema changes are migration-backed

Database structure changes should be introduced through tracked migrations rather than manual local database edits.

### Rule 2: the schema remains the source of truth

Application services should not infer database shape independently.
Schema changes should flow through the shared Prisma baseline.

### Rule 3: local resets and rebuilds should be reproducible

Future setup work should make it possible to recreate the local `ctb-app` database from the tracked schema and migration history.

### Rule 4: migration ownership stays reviewable

Schema and migration changes should stay scoped, reviewable, and aligned to the Jira issue introducing them.

## Typed Runtime Configuration Baseline

CTB should use typed runtime configuration validation with Zod as the shared baseline for services and workers.

The typed config baseline should ensure:

* environment inputs are parsed and validated before business logic runs
* required variables fail fast when missing or malformed
* config shapes are explicit, shared, and reusable across multiple workspaces
* runtime defaults are intentional and visible rather than hidden across containers or scripts

## Configuration Ownership Model

### `packages/config`

`packages/config` is the planned shared workspace for:

* typed environment parsing
* common runtime settings
* service-level config composition
* reusable validation helpers built on Zod

### `packages/schemas`

`packages/schemas` remains the shared home for reusable validation patterns and schema rules that multiple services can consume.

### `infra/`

`infra/` remains responsible for:

* environment wiring
* container and deployment configuration
* runtime secret injection mechanics

Application services should consume validated config rather than implement environment parsing independently.

## Configuration Rules

### Rule 1: config is validated at startup

Services should validate environment-derived config before opening network listeners, worker loops, or durable connections.

### Rule 2: shared config shapes stay shared

Common settings such as database connection inputs, Redis connectivity, and runtime mode flags should be defined once and reused.

### Rule 3: secrets and non-secrets use the same typed contract

Sensitive values still need typed validation even when secret delivery mechanics differ by environment.

### Rule 4: runtime config should not hide business policy

Configuration should express environment and operational settings, not replace explicit application-domain decisions.

## Service Integration Expectations

The CTB runtime should assume:

* `apps/api` uses the shared Postgres and config baseline for control-plane workflows
* worker apps reuse the same Postgres and config contracts instead of duplicating connection or parsing logic
* shared packages define reusable interfaces around persistence and configuration rather than deep service-specific coupling

## Validation Expectations

Future implementation should make it easy to verify:

* services point to the same local `ctb-app` Postgres baseline
* schema evolution is visible through Prisma-managed changes
* malformed configuration fails early and explicitly
* shared config contracts can be reused across API and worker runtimes

## Downstream Handoff

This baseline should feed:

* later implementation work that creates Prisma schema, migration, and config-loader assets
* `CTB-41` for Redis boundaries, queue and dedupe policy, and the testcontainers integration-test harness direction
* future domain stories that need durable persistence and typed runtime configuration

## Risks and Mitigations

### Risk 1: persistence fragmentation

Mitigation:

* define one canonical local Postgres direction
* require schema changes to route through the shared Prisma baseline
* avoid per-service data-store invention without explicit follow-up planning

### Risk 2: config drift across services

Mitigation:

* centralize typed config ownership in shared packages
* validate inputs with Zod before runtime behavior begins
* keep common settings reusable across API and worker apps

### Risk 3: planning drifts into schema implementation

Mitigation:

* keep exact model design out of this story
* preserve this document as a planning-level foundation
* hand executable Prisma and config-loader details to later implementation work

## Recommended Next Implementation Work

This document should feed:

* Prisma schema and migration setup for the local `ctb-app` database
* shared typed-config loader work under `packages/config`
* runtime integration work that binds API and worker services to the same validated configuration contract
