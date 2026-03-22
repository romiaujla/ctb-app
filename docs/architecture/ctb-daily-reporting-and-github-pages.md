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
* notification transport and retry behavior are defined separately in `docs/architecture/ctb-local-notification-agent.md`

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
* strategy evidence summary for the closed day
* report metadata including workflow version, source snapshot id, and generation timestamp

The reporting workflow must not:

* recalculate cost basis independently
* derive fills from raw market provider payloads
* infer balances from UI state

## Canonical Data Dependency Contract

Daily report generation should remain strictly downstream of canonical system outputs.

Required upstream records:

* portfolio snapshot finalized for the closed reporting day
* canonical ledger totals for realized and unrealized P&L
* normalized open-position records at close
* normalized closed-trade records for the day
* strategy evidence summary for emitted, skipped, and blocked outcomes
* workflow metadata including source snapshot id, workflow version, and generation timestamp

Dependency rules:

* reporting-worker should wait for the closed-day portfolio snapshot to reach a finalized state before shaping report artifacts
* reporting-core should consume canonical portfolio and strategy outputs rather than rebuilding them from raw events
* every report artifact should carry the same source snapshot id and workflow version so HTML, JSON, and publication metadata reconcile
* if a required upstream dependency is missing, stale, or version-incompatible, the run should be classified as `failed` or `partial` before publication is attempted

## Canonical Report Package

The generation pipeline should build one canonical report package before rendering or publication.

The canonical package should contain:

* report header metadata
* daily summary totals
* open-position rows
* closed-trade rows
* strategy evidence summary for the day
* execution notes and data-quality notes
* operational metadata including validation and publication readiness state

Design rules:

* JSON is the machine-readable serialization of the canonical report package
* HTML is a presentation rendering of the same canonical report package
* publication metadata should reference the canonical package instead of introducing separate output-only fields
* later notification and web-link workflows should consume package metadata rather than reconstructing status from multiple sources

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

### 6. Strategy Evidence Summary

Include:

* strategy id and version for the closed day
* emitted opportunity count
* skipped opportunity count
* blocked opportunity count
* top reasons for skipped or blocked outcomes when available

### 7. Operational Footer

Include:

* source snapshot id
* report artifact id
* publication commit or artifact reference
* validation status for the report build

## Output Formats

Each reporting run that reaches artifact generation should produce two artifacts.

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

Static-surface rules:

* GitHub Pages is a distribution surface for already-generated artifacts, not a runtime that recalculates report content
* all report calculation, validation, and status classification must finish before publication begins
* Pages content should be generated ahead of time and served as static files only
* downstream consumers should link to published artifacts rather than duplicating report rendering elsewhere

Recommended publication model:

* a dedicated Pages source branch such as `gh-pages`
* one report path per day, for example `reports/2026-03-21/index.html`
* a matching JSON artifact at `reports/2026-03-21/report.json`
* an index page listing recent report dates and summary values

## Publication Workflow

The publication workflow should remain separate from report generation while consuming its validated outputs.

Publication sequence:

1. Receive the validated canonical report package and rendered artifacts from the reporting pipeline.
2. Confirm the run classification permits publication.
3. Stage the dated report directory containing `index.html` and `report.json`.
4. Regenerate the history index from published-report metadata rather than manual edits.
5. Update any stable alias paths only after the dated directory and history index are ready.
6. Publish the static output atomically to the Pages source branch.
7. Emit operator handoff metadata containing the stable URLs and publication outcome.

Publication boundary rules:

* Pages publication must never upgrade a `failed` report into a visible success state
* the publication step must consume the validated artifact set from CTB-55 rather than rebuilding it
* index generation should rely on canonical publication metadata so link history stays deterministic
* notification and UI consumers should depend on the emitted handoff metadata, not scrape Pages content

Publication rules:

* only `complete` or explicitly labeled `partial` report builds are published to the dated path
* publication should be atomic at the day-folder level so a partially written report is never presented as complete
* the latest index should update only after the dated report artifacts are present

## Report History Index Contract

The Pages history index should be the static entry point for report discovery.

The index should include, at minimum:

* report date
* report status
* summary value snapshot suitable for quick scanning
* link to the dated HTML report
* link to the dated JSON artifact when operator-facing access to machine-readable output is appropriate
* generation timestamp or publication timestamp

Index rules:

* the index should be rebuilt from published metadata on each successful publication cycle
* the most recent report should be visually distinguishable from older entries
* partial reports should be labeled explicitly in the index
* failed runs should appear through status metadata only when the product chooses to expose them, but they must not masquerade as published reports
* the index must stay static and navigable on mobile and desktop surfaces

## End-to-End Workflow

The daily workflow should run in this order:

1. Detect the close of the reporting day in `America/Detroit`.
2. Wait for the simulator-worker to finalize the end-of-day portfolio snapshot for that day.
3. Load canonical snapshot, ledger, closed-trade, and strategy-evidence data for the closed day.
4. Validate dependency completeness, freshness, and version compatibility before artifact shaping.
5. Build one canonical report package in `packages/reporting-core`.
6. Serialize the machine-readable JSON artifact from the canonical report package.
7. Render the HTML artifact from the same canonical report package.
8. Run report validation checks against schema shape, required sections, totals reconciliation, and artifact completeness.
9. Classify the run as `complete`, `partial`, or `failed` before any publication step executes.
10. Publish the dated report folder and updated index to the GitHub Pages source only when the run classification permits publication.
11. Emit a publication event containing the public URL, report date, artifact id, and validation result.
12. Surface the published link and report outcome to the owner through the web UI and notification workflow.

## Generation Pipeline Stages

The reporting pipeline should be treated as four explicit stages with gated handoffs.

### Stage 1: Dependency Collection

Responsibilities:

* identify the closed reporting day
* gather the canonical upstream records for that day
* verify that all records reference the same reporting boundary and workflow lineage

Exit criteria:

* all required upstream dependencies are present
* source snapshot id and strategy version metadata reconcile
* no dependency is marked stale beyond the permitted reporting window

### Stage 2: Canonical Package Build

Responsibilities:

* shape daily summary, positions, trades, strategy evidence, and operational metadata into one canonical report package
* attach execution notes and data-quality notes without altering canonical accounting logic

Exit criteria:

* the canonical report package is structurally complete
* summary values reconcile to canonical portfolio totals
* package status is ready for artifact rendering

### Stage 3: Artifact Rendering

Responsibilities:

* serialize `report.json` from the canonical report package
* render `index.html` from the same canonical report package
* ensure both artifacts describe the same report date, artifact id, and run status

Exit criteria:

* both HTML and JSON artifacts are generated
* artifact metadata matches the canonical report package exactly
* partial warnings are visible when the package status is not `complete`

### Stage 4: Publish Readiness and Publication

Responsibilities:

* run publish-readiness validation
* classify the run as `complete`, `partial`, or `failed`
* publish only the allowed outputs to the dated path and update the latest index safely

Exit criteria:

* publication rules for the classified run are satisfied
* dated artifacts and index updates remain atomic
* publication metadata is emitted for downstream consumers

## Surfacing Report Links

The owner should be able to discover reports in two ways:

* a report history view in `apps/web`
* an owner-facing notification containing the latest report link and outcome summary

## Link Conventions

Published report URLs should be stable enough that downstream consumers can reference them without custom rewriting.

Recommended link set:

* dated HTML report: `/reports/YYYY-MM-DD/`
* dated JSON artifact: `/reports/YYYY-MM-DD/report.json`
* history index: `/reports/`
* latest report alias, if adopted later: `/reports/latest/`

Link rules:

* the dated path is the canonical immutable link for a specific reporting day
* notifications should prefer dated links when referencing a completed day
* operator UI may use the history index for browsing and the dated link for direct navigation
* any latest alias should resolve to the most recent published `complete` or explicitly labeled `partial` report without replacing dated paths
* reruns should preserve the dated path contract while updating underlying artifacts atomically

The minimum link contract should include:

* report date
* publication URL
* publication status
* whether the report is complete, partial, or failed

The web experience should prioritize:

* a latest report link
* recent history access
* explicit status when the most recent report was not published successfully

## Operator Handoff Contract

After publication, CTB should emit one operator-facing handoff record.

The handoff record should include:

* report date
* run classification
* dated HTML report URL
* dated JSON artifact URL when available
* history index URL
* publication timestamp
* artifact id
* source snapshot id
* short outcome summary suitable for notifications and web surfaces

Handoff rules:

* handoff metadata should be emitted only after publication outcome is final
* notification and web consumers should display the published status from the handoff record rather than infer it from URL existence
* partial publications must carry the warning reason into the handoff record
* failed publications must expose the blocking reason without advertising a successful report URL

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

## Publish-Readiness Contract

Publication should be gated by an explicit readiness decision.

### `complete`

Required conditions:

* all required dependencies are present and current
* canonical report package passes schema validation
* summary totals reconcile
* HTML and JSON artifacts are both generated and metadata-matched

Publication behavior:

* publish the dated report path
* update the latest index
* emit success metadata for downstream notification and UI consumers

### `partial`

Allowed only when:

* canonical accounting totals are trustworthy
* a non-fatal deficiency is captured explicitly, such as fallback usage or reduced explanatory detail
* HTML and JSON artifacts both display the same warning state

Publication behavior:

* publish only if the partial condition is labeled visibly in both artifacts and metadata
* update the latest index with explicit partial status
* emit the partial reason for downstream consumers

### `failed`

Required when:

* a mandatory dependency is missing, stale, or incompatible
* totals cannot be reconciled credibly
* one required artifact is missing
* publication safety guarantees cannot be met

Publication behavior:

* do not publish or update the dated report path as successful
* preserve retryable intermediate artifacts when safe
* emit failure metadata naming the blocking validation error

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
