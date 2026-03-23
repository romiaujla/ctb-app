# CTB-74 Spec

## Problem

The repo can boot placeholder services, but it still lacks an executable integration-test harness and a concrete Redis-backed runtime helper for the first worker flow.

## Goal

Implement the baseline containerized runtime harness, Redis dedupe and queue coordination helper, and local bootstrap or seed scripts needed to validate Milestone 1 execution from a fresh clone.

## Scope

This story covers:

* shared Postgres and Redis Testcontainers helpers
* simulator-worker Redis queue and dedupe coordination helpers
* integration tests that exercise the baseline runtime stack
* local bootstrap and runtime seed scripts
* CI execution of the baseline integration lane

This story does not cover:

* durable business queue processing semantics beyond the initial dedupe boundary
* production-grade worker orchestration libraries
* broader domain persistence models beyond the existing runtime heartbeat baseline

## Requirements

1. Containerized integration helpers must provision Postgres and Redis for tests.
2. Simulator-worker runtime coordination must use Redis only for transient dedupe and queue state.
3. Fresh-clone bootstrap or seed commands must exist for local setup and baseline test execution.
4. CI must run the new integration lane alongside lint, typecheck, and existing tests.

## Success Criteria

The spec is successful when:

* the repository can run one runtime-sensitive integration test against ephemeral Postgres and Redis
* Redis-backed duplicate work suppression is observable in code and tests
* contributors have documented commands for fresh bootstrap and runtime seeding

## Primary Artifacts

Runtime harness and flow assets:

* `packages/test-utils`
* `apps/simulator-worker/src/runtime-state.ts`
* `tests/runtime-harness.integration.ts`
* `scripts/bootstrap-local.mjs`
* `scripts/seed-runtime-heartbeat.mjs`
