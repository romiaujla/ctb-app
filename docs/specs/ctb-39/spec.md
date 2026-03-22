# CTB-39 Spec

## Problem

CTB now has a monorepo structure and concrete workspace targets, but it still does not define the shared local runtime stack those workspaces should assume during development and validation.

## Goal

Define the local Docker-based development stack for CTB, including the runtime roles for API, workers, Postgres, and Redis, so follow-on implementation stories inherit one consistent local-first operating model.

## Scope

This story covers:

* the planned Docker-based local development stack for CTB
* the runtime role of `apps/api`, worker apps, Postgres, and Redis in local development
* container-boundary guidance for local-first development and validation
* handoff expectations for the database, config, and runtime-state foundation stories that follow

This story does not cover:

* building the actual Dockerfiles, Compose files, or container images
* implementing Prisma, Redis queues, or runtime config loading
* defining production hosting or deployment topology

## Requirements

1. CTB must document the planned local Docker development stack.
2. CTB must identify the runtime role of API, workers, Postgres, and Redis.
3. CTB must define a local-first operating model aligned to the existing monorepo and workspace plan.
4. CTB must give downstream implementation stories one reusable runtime baseline instead of per-service local setups.
5. CTB must keep image-build and environment-detail choices open for later implementation work.

## Success Criteria

The spec is successful when:

* future implementation stories can describe their local runtime target without ambiguity
* service and dependency roles are clear enough to guide containerized setup work
* downstream stories can extend the same runtime envelope instead of inventing parallel local workflows

## Primary Artifact

Implementation-ready architecture baseline:

* `docs/architecture/ctb-local-development-runtime-stack.md`
