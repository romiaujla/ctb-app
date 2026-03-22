# CTB Observability Dashboards and Alerts for Simulator, Reporting, and Delivery Health

## Purpose

This document defines the initial observability layer needed to operate CTB safely across simulator execution, daily reporting, notification delivery, and staged release workflows.

It provides:

* the required dashboard views
* key alert classes
* ownership and response expectations
* rollout and troubleshooting signals

It builds on:

* `docs/process/ctb-devops-platform-sre-agent-workflow.md`
* `docs/process/ctb-cicd-validation-baseline.md`
* `docs/architecture/ctb-simulator-architecture.md`
* `docs/architecture/ctb-daily-reporting-and-github-pages.md`
* `docs/architecture/ctb-local-notification-agent.md`

## Goals

The initial CTB observability design should:

* make simulator, reporting, and notification health visible
* surface operational issues early enough to support staged rollout
* distinguish runtime health from workflow and release health
* assign clear human ownership for each important signal
* support troubleshooting without requiring deep code inspection first

## Dashboard Set

CTB should begin with four dashboard groups.

### 1. Simulator health dashboard

This dashboard should show:

* simulator run success and failure counts
* market-data freshness and feed interruption signals
* trade-intent to simulated-fill processing health
* portfolio valuation update cadence
* recent critical simulator errors

Primary user:

* engineering lead or operator responsible for simulator health

### 2. Reporting health dashboard

This dashboard should show:

* daily report generation status by date
* report publication success, partial, and failure outcomes
* timing and latency for report generation windows
* validation-stage failures for published reports

Primary user:

* reporting owner and release owner

### 3. Notification delivery dashboard

This dashboard should show:

* owner-facing notification success and failure counts
* delivery retries and retry exhaustion
* invalid-credential or configuration failures
* alert deduplication or suppression behavior where relevant

Primary user:

* operator responsible for owner-alert reliability

### 4. Delivery and release health dashboard

This dashboard should show:

* recent deployment or release attempts
* release readiness state for in-flight work
* workflow blockers tied to validation, security, or QA gates
* rollback events or release pauses

Primary user:

* release owner and DevOps / Platform / SRE owner

## Key Alert Classes

CTB should define these initial alert classes:

### A. Data-feed failure alert

Trigger when:

* market data stops updating within the expected freshness window
* provider errors or disconnects threaten simulator correctness

Owner:

* engineering lead or DevOps / Platform / SRE owner

Expected action:

* assess provider health, pause or constrain impacted simulator workflows, and restore feed confidence

### B. Simulator workflow failure alert

Trigger when:

* simulation jobs fail repeatedly
* valuation or event-processing pipelines stop updating

Owner:

* engineering lead

Expected action:

* assess runtime failure scope, restore simulator processing, and determine whether reporting or notification outputs are trustworthy

### C. Report generation failure alert

Trigger when:

* scheduled report generation or publication ends in `partial` or `failed`
* reporting latency exceeds the expected operating window materially

Owner:

* reporting owner and release owner

Expected action:

* identify the failed stage, correct the issue, and decide whether a manual or delayed report path is required

### D. Notification delivery failure alert

Trigger when:

* notification delivery retries are exhausted
* credentials or configuration prevent owner-facing delivery

Owner:

* DevOps / Platform / SRE owner

Expected action:

* restore delivery capability and determine whether missed owner alerts require manual follow-up

### E. Release-health alert

Trigger when:

* release progression is blocked by missing validation, QA, security, or readiness evidence
* rollback is required or post-release monitoring shows unhealthy behavior

Owner:

* release owner

Expected action:

* stop or pause progression, assess risk, and coordinate rollback or follow-up remediation

## Ownership Model

Each signal class should have:

* a primary human owner
* a backup reviewer or escalation partner
* a defined first action expectation

Initial ownership defaults:

* simulator health: engineering lead
* reporting health: reporting owner
* notification delivery: DevOps / Platform / SRE owner
* release and workflow health: release owner

If one person holds multiple roles, ownership should still be recorded by responsibility, not just by name.

## Review and Response Expectations

The observability design should assume:

* dashboards are reviewed during active rollout and after significant changes
* alerts identify who is expected to act first
* unresolved critical alerts pause release progression or trigger escalation
* workflow-health signals are visible alongside runtime signals so release decisions are informed by both

## Staged Rollout Support

During staged rollout, the dashboards should help answer:

* is the simulator healthy enough to trust current outputs
* are reports generating and publishing on schedule
* are owner-facing notifications being delivered reliably
* is any release step paused because evidence or runtime behavior is unhealthy

The observability layer should make it easy to decide whether to continue, pause, or roll back.

## Troubleshooting Signals

Dashboard and alert design should support first-pass troubleshooting by making these visible:

* what failed
* when it failed
* which workflow or domain is affected
* whether downstream outputs can still be trusted
* who should respond first

## Definition of Done

The initial observability design is complete when:

* required dashboards are identified
* key alerts for simulator, reporting, notification, and release health are explicit
* ownership and response expectations are visible
* the design supports staged rollout and troubleshooting
