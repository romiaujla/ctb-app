# CTB-40 Spec

## Problem

CTB now has a local runtime envelope, but it still does not define the shared persistence and configuration baseline that API and worker services should inherit inside that runtime.

## Goal

Define the local Postgres direction, Prisma baseline, migration workflow, and typed configuration validation model for CTB so downstream implementation work shares one database and runtime-config contract.

## Scope

This story covers:

* the local `ctb-app` Postgres direction for durable CTB data
* Prisma as the shared ORM and schema-migration baseline
* the planning-level migration workflow expected for local development
* the typed runtime-configuration model using Zod-backed validation

This story does not cover:

* implementing actual Prisma schema files, migrations, or seed scripts
* defining full simulator or API domain schemas
* introducing executable config loaders or environment files in code

## Requirements

1. CTB must document the local `ctb-app` Postgres database direction.
2. CTB must identify Prisma as the ORM and migration baseline.
3. CTB must define the planning-level migration workflow for local development.
4. CTB must identify typed runtime configuration validation with Zod as the shared config baseline.
5. CTB must give downstream implementation stories one reusable data-and-config reference instead of ad hoc setup patterns.

## Success Criteria

The spec is successful when:

* future implementation stories can point to one local database and migration direction without ambiguity
* API and worker services can share one typed configuration contract at a planning level
* follow-on runtime work can extend the same persistence and config baseline instead of inventing competing patterns

## Primary Artifact

Implementation-ready architecture baseline:

* `docs/architecture/ctb-local-data-and-config-foundation.md`
