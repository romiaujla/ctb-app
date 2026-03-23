# CTB-72 Spec

## Problem

The workspace graph is executable, but contributors still do not have one repeatable local runtime that boots the API, worker, Postgres, and Redis together from a fresh clone.

## Goal

Implement the local Docker-based development stack needed to run the API, one worker, Postgres, and Redis together with explicit startup and health feedback.

## Scope

This story covers:

* Dockerfiles for the API and simulator-worker workspaces
* a Docker Compose stack for API, simulator worker, Postgres, and Redis
* root scripts and README guidance for starting, stopping, and inspecting the local stack
* placeholder runtime wiring so the API and worker reference local dependency URLs directly

This story does not cover:

* Prisma schema or migration setup
* typed environment validation
* Redis-backed queues or integration-test harnesses

## Requirements

1. The repo must provide Docker-local configuration for Postgres and Redis.
2. The API and simulator-worker must boot against the local dependency contract.
3. Startup commands and health signals must be explicit enough to troubleshoot local boot issues.
4. Fresh-clone bootstrap must avoid hidden local wiring steps.

## Success Criteria

The spec is successful when:

* contributors can inspect one Compose file to see the baseline CTB local stack
* the API exposes a health endpoint in the Docker-local stack
* the simulator worker shares the same Postgres and Redis runtime contract

## Primary Artifacts

Local runtime assets:

* `infra/docker/compose.yml`
* `apps/api/Dockerfile`
* `apps/simulator-worker/Dockerfile`
* root startup scripts and README guidance
