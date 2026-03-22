# CTB Operator UI Information Architecture and Runtime View Baseline

## Purpose

This document defines the operator UI information architecture, runtime views, and report-access workflows for the CTB single-owner control plane.

It is the implementation-ready UI handoff baseline for `CTB-52`.

## User Flow

Starting point:

* the owner lands on the CTB operator home view after entering the single-owner control plane

Primary success path:

1. Check overall runtime health and current workflow status from the home dashboard.
2. Inspect the current strategy state and recent decision behavior.
3. Open the latest validated report summary and follow the report-access link when deeper review is needed.
4. Review any notification or incident items that need operational action.
5. Trigger a bounded operator action only when the API indicates an explicit supported workflow such as replay, regenerate, or retry.

Important alternate or error paths:

* if simulator or reporting health is degraded, the owner should see the problem from the home view before navigating deeper
* if the latest report is missing or partial, the reporting area should show status and recovery context rather than a broken link
* if an operational action is blocked, the UI should explain why it is unavailable and what evidence is missing

Gating conditions:

* the UI should rely on the CTB API and published report links rather than raw database or worker access
* dynamic control-plane views must stay separate from static GitHub Pages report browsing

## Screens and States

### Primary navigation model

The operator UI should use one persistent top-level navigation with these primary sections:

* `Overview`
* `Simulator`
* `Strategy`
* `Reports`
* `Notifications`

Planning rule:

* the navigation should optimize for task clarity rather than mirroring internal service boundaries too literally

### `Overview`

Purpose:

* give the owner one fast read on whether CTB is healthy, current, and trustworthy enough to review in detail

Core content:

* overall system-health summary
* current workflow status for simulator, reporting, and notifications
* active strategy version
* latest report availability and status
* open incidents or degraded-state callouts

Key states:

* loading
* healthy
* warning or degraded
* blocked because required evidence is missing

### `Simulator`

Purpose:

* expose current run state, portfolio summary, positions, and recent trade outcomes

Core content:

* latest run summary
* current portfolio snapshot
* open positions
* recent trade activity

Key states:

* loading
* empty before any simulator evidence exists
* success with current state
* degraded when data is stale or a run failed

### `Strategy`

Purpose:

* expose the active strategy version, decision evidence, and review signals

Core content:

* active strategy id and version
* recent emitted, skipped, blocked, and invalid counts
* top recent reasons for blocked or skipped outcomes
* current review-window summary and strategy-health flags

Key states:

* loading
* no-evidence-yet
* review-ready
* warning when trust or drawdown thresholds are under pressure

### `Reports`

Purpose:

* help the owner find the latest validated report quickly and browse recent report history

Core content:

* latest report card with status
* recent report history list
* links to published static reports
* report-generation issues when the expected report is missing or partial

Key states:

* loading
* latest report available
* latest report missing
* partial or failed report generation

### `Notifications`

Purpose:

* show delivery health, recent operator-facing events, and unresolved operational incidents

Core content:

* recent notification events
* unresolved incidents or retries
* delivery-health status and failure signals

Key states:

* loading
* clear and healthy
* warning for retries or suppressed messages
* critical when delivery failures threaten owner visibility

## Components and Behaviors

### Global shell

The UI should use:

* one page header with current system status and last-updated context
* one content container with section cards or panels
* one lightweight status rail or banner for degraded states that should remain visible across sections

### Overview cards

The overview should use summary cards for:

* simulator health
* strategy status
* report availability
* notification health

Behavior rules:

* each card should show one primary status and one clear next click target
* warning and blocked states should be visible with text, not color alone

### Detail tables and lists

The simulator, strategy, reports, and notifications sections may use tables or lists when the owner needs to inspect recent records.

Behavior rules:

* default to the most relevant recent items first
* show empty-state guidance instead of blank tables
* preserve stable labels for timestamps, statuses, and identifiers

### Report-access pattern

The reports section should distinguish:

* dynamic control-plane metadata, such as generation status and validation readiness
* static published report links for full historical reading

Behavior rules:

* the UI should link out to published reports instead of re-rendering them independently
* if no validated report is available, the UI should explain the current workflow state and recovery context

### Operator actions

Operator actions should appear only where the API exposes supported workflows.

Behavior rules:

* actions should be secondary to inspection and evidence review
* each action should show whether it is available, blocked, or in progress
* confirmation and result messaging should reference the bounded workflow being requested

## Figma References

No Figma reference exists yet for this story.

Implementation note:

* downstream implementation should preserve this written flow and state model even if visual layouts evolve during delivery

## Accessibility Checkpoints

The operator UI must make these explicit:

* semantic page structure with headings for each major section
* visible labels for cards, tables, filters, and action controls
* keyboard-reachable navigation and action controls
* visible focus states for navigation, report links, and buttons
* warning, blocked, and error states described with text and iconography rather than color alone
* empty and failed states that explain the condition in plain language

## Responsive Notes

Desktop-first behavior:

* `Overview` should prioritize a multi-card summary layout with visible status comparisons across domains
* detail views may use wider tables or split panels where space allows

Smaller-screen behavior:

* collapse the dashboard into a single-column stack of summary cards
* keep the most urgent health and report-status information above secondary detail content
* convert wide tables into stacked records or horizontally scrollable containers only when labels remain readable

Responsive rule:

* the owner should still be able to complete the primary review flow on smaller screens without losing status clarity or access to the latest report link

## Downstream Reuse

Future CTB work should reuse this baseline when defining:

* the Next.js operator UI route structure
* component states for loading, empty, warning, blocked, and success conditions
* E2E and accessibility validation targets for the control plane
* the integration path between API responses and published report links
