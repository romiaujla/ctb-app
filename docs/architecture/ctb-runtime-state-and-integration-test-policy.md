# CTB Runtime State and Integration Test Policy

## Purpose

This document defines the transient runtime-state policy and integration-test harness direction for Crown Trade Bot so future services can use Redis intentionally and validate runtime dependencies consistently.

It is the implementation-ready runtime-state and integration-test baseline for `CTB-41`.

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/architecture/ctb-local-development-runtime-stack.md`
* `docs/architecture/ctb-local-data-and-config-foundation.md`
* `docs/process/ctb-test-automation-engineer-agent-workflow.md`

## Baseline Goals

The CTB runtime-state policy should:

* keep durable state in Postgres and transient coordination state in Redis
* define what queue, retry, dedupe, and cache concerns Redis may support
* prevent worker and notification flows from hiding business truth in ephemeral infrastructure
* give runtime-dependent integration tests one consistent harness direction
* keep runtime-state and test-harness choices reviewable before implementation begins

## Redis Usage Intent

Redis is the planned transient runtime dependency for CTB.

Redis may own:

* queue-adjacent coordination state
* retry timing and short-lived workflow handoff state
* dedupe markers and cooldown windows
* ephemeral cache-like data that improves runtime behavior without becoming canonical truth

Redis must not own:

* canonical business records
* durable portfolio, reporting, or notification history
* the only copy of information required to reconstruct CTB application truth
* long-term persistence that should survive independently of Redis lifecycle choices

## Queue Boundary Rules

### Rule 1: Redis supports orchestration, not business truth

Queue-related state in Redis should represent work coordination and workflow progress, not the durable record of what the system believes happened.

### Rule 2: queue payloads should point to durable context where needed

When a queued task depends on durable domain facts, Redis-backed coordination should reference Postgres-backed records or other durable identifiers rather than becoming the only record.

### Rule 3: queue implementation choice remains open

This story defines Redis policy only.
The exact queue library, job envelope, and worker orchestration mechanics remain implementation work.

## Retry and Dedupe Rules

### Retry

Redis may hold:

* retry counters
* backoff timing state
* short-lived delivery or processing coordination markers

Retry policy should be explicit and bounded so delayed or repeated work is observable and reviewable.

### Dedupe

Redis may hold:

* dedupe keys
* short-lived idempotency windows
* cooldown markers for repeated runtime events

Dedupe state should be treated as protective coordination, not durable evidence of business completion.

## Cache Rules

Redis-backed caching is acceptable when:

* the cached data can be recomputed or reloaded from durable sources
* cache misses do not destroy business truth
* stale cache behavior is understood and bounded by the consuming workflow

Redis-backed caching is not acceptable when:

* the cache becomes the only record of critical CTB state
* durable reporting or financial outcomes depend on cache survival
* application correctness relies on undocumented cache assumptions

## Durable vs. Transient State Contract

The CTB runtime should preserve this line:

* Postgres owns durable truth and schema-backed history
* Redis owns transient coordination and short-lived runtime helpers
* application services should make the ownership boundary explicit in design and review notes

Future stories should treat crossing that boundary as an exception requiring explicit rationale.

## Testcontainers Direction

Testcontainers is the planned integration-test harness direction for CTB runtime dependencies.

The integration-test harness should:

* provision realistic ephemeral dependency containers for Postgres and Redis during tests
* let services and shared modules run against runtime-like dependencies instead of mocks alone
* support isolated, reproducible integration tests without requiring long-lived shared local services
* make runtime-sensitive failure modes visible in automated validation where practical

Planning rule:

* exact framework bindings, helper APIs, and CI ergonomics remain later setup work

## Integration Test Coverage Expectations

Future runtime-dependent integration tests should be good candidates for:

* database integration around Prisma-backed persistence flows
* Redis-backed workflow coordination and dedupe behavior
* service-to-dependency integration for API and worker runtimes
* runtime failure and recovery scenarios that mocks cannot represent credibly

Not every issue requires this layer, but runtime-sensitive changes should have one consistent harness direction available.

## Ownership and Workspace Expectations

### `packages/test-utils`

`packages/test-utils` is the planned shared home for reusable runtime-test helpers, fixtures, and environment setup support.

### `packages/config`

Runtime-dependent tests should reuse the same typed configuration contract rather than inventing test-only environment parsing rules.

### Worker and service apps

API and worker apps should consume the harness through shared setup patterns rather than building isolated, incompatible dependency bootstraps.

## Validation Expectations

Future implementation should make it easy to verify:

* Redis is used only for transient coordination concerns
* durable application truth remains reconstructible from Postgres-backed records
* runtime-dependent integration tests can boot isolated Postgres and Redis dependencies predictably
* queue, retry, dedupe, and cache behavior are testable without requiring always-on shared local infrastructure

## Downstream Handoff

This baseline should feed:

* later worker and notification implementation stories that introduce runtime coordination
* future integration-test setup work using testcontainers around Postgres and Redis
* domain stories that need explicit transient-state policy before implementation

## Risks and Mitigations

### Risk 1: Redis becomes a shadow system of record

Mitigation:

* define hard boundaries between durable truth and transient coordination
* require durable context to live in Postgres-backed records
* keep Redis use cases explicit and reviewable

### Risk 2: queue, retry, and dedupe behavior become ad hoc

Mitigation:

* separate queue coordination from durable business outcomes
* require retry and dedupe usage to be intentional and bounded
* avoid hiding behavior in undocumented cache or key conventions

### Risk 3: integration tests fragment across local setups

Mitigation:

* choose one harness direction for runtime dependencies
* keep testcontainers as the shared baseline for Postgres and Redis integration tests
* route reusable helpers through shared test utilities

## Recommended Next Implementation Work

This document should feed:

* runtime coordination implementation in worker and notification flows
* testcontainers-backed integration-test setup for Postgres and Redis dependencies
* validation work that exercises runtime-sensitive behavior beyond pure unit tests
