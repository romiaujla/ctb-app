# CTB-73 Spec

## Problem

The local runtime stack exists, but it still depends on unvalidated environment input and has no Prisma schema or tracked migration baseline for the Postgres database.

## Goal

Implement the initial Prisma schema, migration baseline, environment validation, and typed runtime configuration used by the local CTB stack.

## Scope

This story covers:

* Prisma client setup, schema, and tracked migration assets
* shared runtime environment validation in `@ctb/config`
* service updates to consume the typed config loader
* root scripts and docs for generating and applying the database baseline

This story does not cover:

* Redis-backed queue and dedupe behavior
* integration-test harness automation
* seed/bootstrap flows beyond database generation and migration commands

## Requirements

1. Runtime environment variables must be validated before service startup.
2. Prisma schema and migration assets must exist for the local Postgres baseline.
3. Typed runtime config must be shared instead of duplicated across services.
4. Local setup docs or scripts must show how to generate and apply the database baseline.

## Success Criteria

The spec is successful when:

* the API and simulator worker boot through a shared typed config loader
* Prisma schema and migrations are tracked in-repo
* a contributor can see the root commands needed to generate and apply the DB baseline

## Primary Artifacts

Persistence and config assets:

* `prisma/schema.prisma`
* `prisma/migrations/**`
* shared `@ctb/config` runtime loader
* root Prisma scripts and docs
