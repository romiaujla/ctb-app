# CTB Telemetry Baseline

## Purpose

This document defines the reusable CTB baseline for structured logs, metrics, and dashboard contracts.

It builds on:

* `docs/process/ctb-observability-model.md`
* `docs/process/ctb-observability-dashboards-and-alerts.md`
* `docs/process/ctb-devops-platform-sre-agent-workflow.md`
* `docs/process/engineering-constitution.md`

## Baseline Goals

The telemetry baseline should:

* keep operational evidence structured and reusable
* make logs, metrics, and dashboard contracts consistent across CTB domains
* prevent instrumentation from drifting away from canonical business events
* support later alerting, troubleshooting, and operational reviews

## Structured Logging Expectations

Structured logs should capture:

* event or workflow name
* timestamp
* severity
* correlation identifiers
* domain or workflow ownership
* concise outcome classification

Logging rules:

* prefer machine-readable fields over free-form-only messages
* include enough context for debugging without exposing secrets or sensitive identifiers unnecessarily
* align log events to canonical business or workflow events instead of inventing alternate truth models
* keep error logs explicit about failure stage and impact on downstream trust

## Metrics Expectations

Metrics should capture:

* counts of success, failure, and suppression events where relevant
* latency and timing for workflow stages
* backlog or retry depth when applicable
* trendable operational outcomes for simulator, reporting, notification, strategy, and release health

Metric rules:

* metrics should summarize behavior, not replace structured logs
* counters and rates should map back to one observability domain clearly
* strategy metrics should preserve version attribution when performance meaning depends on strategy version
* metrics should avoid recomputing business facts when a canonical upstream source already exists

## Dashboard Contract Intent

Dashboards should consume telemetry in a way that preserves the observability domains defined by `docs/process/ctb-observability-model.md`.

Dashboard contract expectations:

* simulator dashboard contracts should reflect simulator health and freshness signals
* reporting dashboard contracts should reflect generation, validation, and publication outcomes
* notification dashboard contracts should reflect delivery success, retries, suppression, and failures
* strategy-performance dashboard contracts should reflect decision-state and outcome trends without blending them into raw runtime health
* release-health dashboard contracts should reflect readiness, blocked gates, and rollback or pause signals

## Downstream Instrumentation Rule

Instrumentation should remain downstream of canonical business events where relevant.

Rule details:

* logs and metrics may describe canonical outcomes but should not redefine them
* dashboard-ready summaries should be derived from canonical records rather than reconstructed from unrelated side effects
* instrumentation layers must not become a second source of truth for simulator, reporting, or notification business logic

This keeps telemetry reliable and prevents observability drift from operational truth.

## Reuse Rules

Future CTB instrumentation work should:

* reference this baseline when introducing logs, metrics, or dashboard-oriented contracts
* align telemetry naming and grouping to the observability domains
* state when a planned telemetry signal depends on a canonical upstream event or artifact
* document any intentional gaps where telemetry is not yet implemented
