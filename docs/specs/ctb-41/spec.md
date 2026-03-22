# CTB-41 Spec

## Problem

CTB now has a local runtime, Postgres baseline, and typed configuration direction, but it still does not define the transient-state rules and integration-test harness strategy that runtime-sensitive services should share.

## Goal

Define Redis usage boundaries for CTB and the role of testcontainers in integration testing so future worker, notification, and runtime-dependent implementation stays predictable and testable.

## Scope

This story covers:

* Redis usage intent for transient CTB runtime concerns
* planning-level queue, cache, retry, and dedupe boundaries
* testcontainers as the integration-test harness direction for runtime dependencies
* the shared policy line between durable Postgres state and transient Redis state

This story does not cover:

* implementing actual queues, workers, or retry flows
* writing executable integration tests or test harness code
* defining final observability or deployment mechanics

## Requirements

1. CTB must document Redis usage intent for appropriate runtime concerns.
2. CTB must define queue, cache, and dedupe boundaries at a planning level.
3. CTB must identify testcontainers as the integration-test harness direction for CTB runtime dependencies.
4. CTB must prevent Redis from becoming the durable source of CTB business truth.
5. CTB must give downstream implementation stories one reusable runtime-state and integration-test policy reference.

## Success Criteria

The spec is successful when:

* future implementation stories can tell what Redis may and may not own without ambiguity
* queue, cache, retry, and dedupe concerns are bounded clearly enough to guide later worker work
* runtime-dependent integration tests can reuse one harness direction rather than inventing per-story setups

## Primary Artifact

Implementation-ready architecture baseline:

* `docs/architecture/ctb-runtime-state-and-integration-test-policy.md`
