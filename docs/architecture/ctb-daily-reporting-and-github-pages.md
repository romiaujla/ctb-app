# CTB Daily P&L Reporting and GitHub Pages Publication Design

## Purpose

This document defines the end-to-end design for CTB daily simulator profit and loss reporting and GitHub Pages publication.

It is the implementation-ready reporting baseline for `CTB-15`.

## Design Goals

The daily reporting workflow should:

* publish a single canonical daily report for each closed reporting day
* consume simulator and portfolio outputs without duplicating accounting logic
* produce a shareable web artifact that can be hosted on GitHub Pages
* preserve enough evidence to explain how report values were derived
* make failures visible so missed or partial reporting is never silent

## Scope

Included in scope:

* daily P&L report contents
* report generation timing
* publication workflow to GitHub Pages
* retention of published reports and machine-readable artifacts
* owner-facing link delivery expectations
* failure handling for incomplete or missed runs

Explicitly out of scope:

* live brokerage account reporting
* intraday public dashboards
* investor-grade statements or tax documents
* notification transport implementation details beyond the contract needed to surface report links

## Architectural Position

This workflow extends the boundaries defined in:

* `docs/architecture/ctb-simulator-architecture.md`
* `docs/architecture/ctb-monorepo-structure.md`

Design rules:

* `packages/simulator-core` remains the source of truth for positions, valuation, and realized or unrealized P&L
* `packages/reporting-core` shapes report views from canonical portfolio snapshots and simulation events
* `apps/reporting-worker` assembles the daily report package and prepares publication artifacts
* `apps/web` or owner-facing notifications surface links to already-published reports rather than recalculating them

## Daily Reporting Boundary

The daily report represents a closed trading day for the simulator.

Default boundary:

* reporting timezone: `America/Detroit`
* reporting day close: `11:59:59 PM America/Detroit`
* report generation window opens after the day closes
* the workflow targets one report per calendar day, even if no trades occurred

If trading calendars or multi-market support are introduced later, the reporting boundary may evolve, but the initial design should stay calendar-day based for clarity and deterministic retention.

## Canonical Inputs

The reporting workflow should consume the following canonical inputs only:

* end-of-day portfolio snapshot
* realized P&L totals for the day
* unrealized P&L at close
* cash balance and net liquidation value at close
* open positions at close
* closed trades executed during the day
* report metadata including workflow version, source snapshot id, and generation timestamp

The reporting workflow must not:

* recalculate cost basis independently
* derive fills from raw market provider payloads
* infer balances from UI state

## Required Report Contents

Each daily report should include the following sections.

### 1. Report Header

Fields:

* report date
* reporting timezone
* generation timestamp
* workflow version
* simulation account identifier

### 2. Daily Summary

Fields:

* starting net liquidation value
* ending net liquidation value
* daily realized P&L
* end-of-day unrealized P&L
* net daily change
* ending cash balance
* open position count
* closed trade count

### 3. Open Positions

For each open position:

* symbol
* quantity
* average cost basis
* closing market price
* market value
* unrealized P&L
* weight in portfolio

### 4. Closed Trade Activity

For each closed trade or position-closing event:

* symbol
* side
* quantity closed
* average entry price
* exit price
* realized P&L
* close timestamp

### 5. Execution Notes

Include:

* any execution-model assumptions that materially affected values
* whether stale market data protections were triggered
* whether any data fallbacks or partial inputs were used

### 6. Operational Footer

Include:

* source snapshot id
* report artifact id
* publication commit or artifact reference
* validation status for the report build

## Output Formats

Each successful reporting run should produce two artifacts.

### Human-readable artifact

Format:

* static HTML page suitable for GitHub Pages

Characteristics:

* no server-side dependency
* mobile-readable and desktop-readable layout
* semantic headings and tables for accessibility
* plain-language labels so the owner can interpret the report quickly

### Machine-readable artifact

Format:

* JSON document stored alongside the HTML report

Purpose:

* audit and replay support
* future notification summaries
* downstream comparison or validation jobs

The JSON artifact should mirror the published report content closely enough that the HTML output can be reproduced from canonical report data.

## Publication Design

GitHub Pages should be used as the publication surface for report history.

Recommended publication model:

* a dedicated Pages source branch such as `gh-pages`
* one report path per day, for example `reports/2026-03-21/index.html`
* a matching JSON artifact at `reports/2026-03-21/report.json`
* an index page listing recent report dates and summary values

Publication rules:

* only successful report builds are published to the dated path
* publication should be atomic at the day-folder level so a partially written report is never presented as complete
* the latest index should update only after the dated report artifacts are present

## End-to-End Workflow

The daily workflow should run in this order:

1. Detect the close of the reporting day in `America/Detroit`.
2. Wait for the simulator-worker to finalize the end-of-day portfolio snapshot for that day.
3. Load canonical snapshot, ledger, and closed-trade data for the closed day.
4. Validate input completeness and freshness before rendering.
5. Build the machine-readable report payload in `packages/reporting-core`.
6. Render the HTML report artifact from the canonical report payload.
7. Run report validation checks against totals, required fields, and artifact completeness.
8. Publish the dated report folder and updated index to the GitHub Pages source.
9. Emit a publication event containing the public URL, report date, artifact id, and validation result.
10. Surface the published link to the owner through the web UI and notification workflow.

## Surfacing Report Links

The owner should be able to discover reports in two ways:

* a report history view in `apps/web`
* an owner-facing notification containing the latest report link and outcome summary

The minimum link contract should include:

* report date
* publication URL
* publication status
* whether the report is complete, partial, or failed

The web experience should prioritize:

* a latest report link
* recent history access
* explicit status when the most recent report was not published successfully

## Timing and Scheduling

Default scheduling guidance:

* start the reporting workflow shortly after local day close
* allow a short buffer for final simulator event processing
* consider a target run start of `12:10 AM America/Detroit`

This buffer reduces the chance that late-arriving simulation events or portfolio finalization tasks create false partial reports.

If the system supports manual replay later, reruns should replace the dated report atomically and append an updated generation timestamp and workflow version.

## Retention Policy

Retention should preserve both usability and traceability.

Recommended policy:

* retain the GitHub Pages HTML and JSON report artifacts for the full lifetime of the simulator environment unless storage pressure requires pruning
* retain the most recent 30 days in the report index by default
* keep older dated report paths directly accessible even when they age out of the index

If pruning is introduced later, the system should archive machine-readable artifacts before removing published pages.

## Failure Handling

The workflow must classify failures explicitly.

### Failure Class 1: upstream data missing

Examples:

* end-of-day portfolio snapshot not produced
* closed trade data missing
* valuation inputs incomplete

Required behavior:

* do not publish a dated report as successful
* emit a failed report status with the missing dependency named
* surface the failure in the latest report status view

### Failure Class 2: partial data detected

Examples:

* positions available but closed trades incomplete
* valuation produced with stale market data fallback

Required behavior:

* publish only if the artifact is explicitly marked `partial`
* show a visible warning banner in HTML output
* include the partial reason in the JSON payload and owner-facing link metadata

### Failure Class 3: render or publication failure

Examples:

* HTML generation fails
* GitHub Pages branch update fails
* index update fails after report rendering

Required behavior:

* preserve the machine-readable artifact when available for retry
* do not update the latest index to imply success
* retry publication separately from report calculation when the canonical payload is already valid

## Validation Rules

Every report build should validate:

* required fields are present
* summary totals reconcile to canonical portfolio outputs
* dated HTML and JSON artifacts are both generated
* publication path matches the report date
* partial or failed states are labeled explicitly

Recommended automated checks:

* schema validation for the JSON report payload
* snapshot or structural tests for HTML sections
* reconciliation checks for summary totals against canonical snapshots

## Security and Access Considerations

The initial GitHub Pages design assumes reports are shareable by URL and do not contain secrets.

Therefore:

* published artifacts must not include credentials, internal tokens, or raw provider payloads
* the report should avoid exposing sensitive personal data beyond what the owner already expects in a simulator summary
* if privacy expectations change, publication must move behind an authenticated delivery surface rather than weakening data handling rules

## Risks and Mitigations

### Risk 1: published P&L diverges from canonical portfolio state

Mitigation:

* only consume canonical end-of-day snapshots
* prohibit duplicate accounting logic in reporting
* validate totals before publication

### Risk 2: GitHub Pages shows incomplete reports

Mitigation:

* publish atomically by dated folder
* update the latest index only after successful artifact publication
* label partial outputs clearly

### Risk 3: missed daily runs go unnoticed

Mitigation:

* emit explicit failed or missing-report status
* surface status in both the web history view and owner notification contract

### Risk 4: retention changes break auditability

Mitigation:

* keep machine-readable artifacts aligned with the HTML output
* archive before pruning
* preserve source snapshot references in every report

## Recommended Next Implementation Work

This design should directly feed:

* reporting-core interfaces for canonical daily report payloads
* reporting-worker jobs for report assembly and publication
* GitHub Pages publishing automation
* web UI report history views
* owner-facing notification templates for daily report delivery
