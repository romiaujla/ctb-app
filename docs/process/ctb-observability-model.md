# CTB Observability Model

## Purpose

This document defines the reusable CTB observability model across operational and strategy-health concerns.

It builds on:

* `docs/process/ctb-observability-dashboards-and-alerts.md`
* `docs/process/ctb-devops-platform-sre-agent-workflow.md`
* `docs/process/ctb-agent-governance.md`
* `docs/process/ctb-release-readiness-gates.md`

## Model Goals

The observability model should:

* separate operational health, workflow health, strategy behavior, and release state clearly
* make logging, metrics, and dashboards complementary rather than redundant
* support quick diagnosis without deep code inspection
* give downstream dashboard and alerting work one common model to follow

## Observability Domains

### Simulator health

What it answers:

* is the simulator running correctly
* are market-data freshness and valuation updates trustworthy
* are failures blocking downstream reporting or notification confidence

Core concerns:

* run success and failure
* processing latency
* freshness and data continuity
* critical simulator errors

### Reporting health

What it answers:

* are daily reports generating, validating, and publishing correctly
* are partial and failed states visible
* are reporting windows meeting expected timing

Core concerns:

* generation status by date
* publication outcomes
* validation-stage failures
* reporting latency and backlog

### Notification health

What it answers:

* are owner-facing notifications being delivered reliably
* are retries, suppressions, and failures visible
* are credentials or configuration issues blocking delivery

Core concerns:

* success and failure counts
* retry exhaustion
* suppression and dedupe behavior
* credential and config failures

### Strategy-performance health

What it answers:

* is the strategy behaving consistently and intelligibly over time
* are emitted, skipped, and blocked outcomes changing materially
* are performance signals suggesting operational or logic drift

Core concerns:

* decision-state distributions
* realized and unrealized outcome trends
* skipped and blocked reason trends
* strategy-version-attributed performance

Strategy-performance visibility should be treated as an operational concern because unexplained drift can indicate model, data, or workflow problems even before it is a pure product issue.

### Release and workflow health

What it answers:

* is a change blocked by missing validation, QA, security, or readiness evidence
* is the current release path safe to continue
* have rollback or pause signals emerged

Core concerns:

* in-flight readiness state
* blocked gates
* rollback events
* release pause or escalation signals

## Signal Layers

### Logging

Use logs to capture:

* structured event details
* failure context
* correlation identifiers
* evidence for debugging and audits

Logs should explain what happened and provide detail for troubleshooting.

### Metrics

Use metrics to capture:

* counts
* rates
* latency
* trend movement
* backlog or queue growth

Metrics should show whether health is improving, degrading, or unstable over time.

### Dashboards

Use dashboards to capture:

* current health posture
* trend summaries
* owner-facing decision signals
* cross-domain views during rollout or incident triage

Dashboards should summarize, not replace, the underlying logs and metrics.

## Reuse Rules

Downstream dashboard and alerting work should:

* reuse these observability domains
* map concrete dashboard widgets and alerts back to one domain
* keep strategy-performance visibility distinct from raw runtime health
* avoid duplicating the same signal across multiple domains without reason
