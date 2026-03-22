# CTB Operational Ownership and Runbooks

## Purpose

This document defines the reusable CTB baseline for alert routing, first response, ownership boundaries, and runbook evidence.

It builds on:

* `docs/process/ctb-observability-dashboards-and-alerts.md`
* `docs/process/ctb-devops-platform-sre-agent-workflow.md`
* `docs/process/ctb-agent-governance.md`
* `docs/process/ctb-release-readiness-gates.md`

## Baseline Goals

The operational-ownership baseline should:

* make every important alert lead to a clear first action
* assign ownership by responsibility, even in a single-owner operating model
* keep escalation expectations visible when the first response is not enough
* require lightweight runbook evidence for repeatable operational handling

## Alert-Routing Expectations

Key CTB operational alerts should route by domain responsibility.

Default routing guidance:

* simulator failures route to simulator health ownership
* report-generation and publication failures route to reporting ownership
* notification-delivery failures route to notification or delivery ownership
* release-health blockers route to release ownership
* cross-domain failures route first to the most directly affected domain owner, with escalation when downstream trust is unclear

Routing rules:

* each alert class should have a primary owner
* each alert class should define the expected first action
* ambiguous ownership should be resolved in docs, not left to guesswork during failure

## First-Response Expectations

The first response should answer:

* what failed
* whether downstream outputs remain trustworthy
* whether escalation or pause is required

Minimum first-response expectations:

* acknowledge the owning domain
* confirm the immediate operational impact
* identify whether the workflow can continue, should pause, or needs rollback or re-run
* record the next concrete action

## Escalation Expectations

Escalation should occur when:

* a first responder cannot restore safe operation quickly
* downstream trust is unclear
* the issue crosses domain boundaries
* readiness or release progression is blocked materially

Escalation outcomes may include:

* pause rollout or progression
* bring in the release owner or engineering lead
* split the problem into a follow-up issue if the fix exceeds the active scope
* record a temporary manual workaround with explicit ownership

## Runbook Evidence Expectations

CTB does not need heavyweight enterprise runbooks, but recurring or critical alert paths should leave lightweight runbook evidence.

Runbook evidence should include:

* alert class or failure mode
* primary owner
* first expected action
* pause or trust-impact criteria
* escalation trigger
* recovery or follow-up note

Runbook evidence may live as:

* a lightweight section in the relevant process doc
* an issue-linked operational note
* release or readiness evidence when the scenario is release-specific

## Reuse Rules

Future CTB alerting and release work should:

* reference this baseline when defining who responds first
* align alert classes with the existing observability docs
* record lightweight runbook evidence for repeated or high-impact failure modes
* keep ownership explicit even when one human currently holds multiple roles
