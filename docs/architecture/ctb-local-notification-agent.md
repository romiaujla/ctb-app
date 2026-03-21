# CTB Local Notification Agent Design

## Purpose

This document defines the local notification architecture for Crown Trade Bot owner alerts and report delivery.

It is the implementation-ready notification baseline for `CTB-16`.

## Design Goals

The notification workflow should:

* deliver owner-facing alerts from the local Mac mini environment without introducing cloud-only execution dependencies
* consume canonical simulator and reporting events without recalculating portfolio or reporting logic
* make daily report delivery, major P&L changes, workflow failures, and critical operational issues visible quickly
* preserve explicit delivery evidence so notification success or failure is observable
* protect owner contact data and delivery credentials as sensitive local configuration

## Scope

Included in scope:

* notification-trigger events for report delivery, major P&L changes, failures, and critical workflow errors
* local delivery architecture for the Mac mini runtime
* owner-facing message classes and formatting rules
* rate limiting, retry expectations, and failure handling
* configuration, secrets, and local environment requirements
* boundaries between local notification delivery and cloud-hosted CTB services

Explicitly out of scope:

* direct iMessage automation through the Messages app UI
* push-notification services or mobile app infrastructure
* live brokerage trade alerts
* investor-facing distribution beyond the owner
* portfolio or reporting calculations inside the notification workflow

## Architectural Position

This workflow extends the boundaries defined in:

* `docs/architecture/ctb-simulator-architecture.md`
* `docs/architecture/ctb-monorepo-structure.md`
* `docs/architecture/ctb-daily-reporting-and-github-pages.md`

Design rules:

* `packages/notification-core` owns notification classes, message templates, delivery policies, and payload shaping
* `apps/notification-worker` owns local delivery orchestration, retries, status recording, and adapter execution
* simulator and reporting domains publish canonical events that the notification workflow consumes
* the notification workflow must not derive P&L, rebuild report artifacts, or infer state from UI pages
* cloud-hosted services may publish report URLs or status events, but final owner delivery remains a local worker responsibility in the initial design

## Local Delivery Boundary

The initial notification system should run on the owner-controlled Mac mini environment.

Boundary assumptions:

* local timezone: `America/Detroit`
* runtime host: always-on or regularly available Mac mini used for CTB workflows
* delivery target: owner mobile device via carrier email-to-SMS or email-to-MMS gateway that surfaces in the Messages app
* outbound transport: standards-based SMTP from the local runtime to the configured mail provider or relay

This design intentionally uses email-to-number delivery rather than brittle desktop UI scripting. If future requirements demand true Apple Messages or iMessage-native automation, that should be introduced as a separate adapter with additional approval and security review.

## Notification Use Cases

The workflow must explicitly support these use cases.

### 1. Daily report delivery

Trigger:

* successful completion and publication of the daily report

Required message fields:

* report date
* publication status
* public report URL
* one-line daily outcome summary

Default behavior:

* send once per completed report day after publication succeeds

### 2. Major P&L change alert

Trigger:

* portfolio net liquidation value changes by a configured threshold within a configured evaluation window

Default threshold guidance:

* percentage threshold: `5%`
* absolute threshold: `$100`
* evaluation mode: trigger when either threshold is exceeded

Required message fields:

* trigger timestamp
* current net liquidation value
* absolute change
* percentage change
* comparison baseline timestamp

Thresholds must be configurable because the initial simulator balance is small and fixed defaults will likely need tuning.

### 3. Reporting failure alert

Trigger:

* daily report generation, validation, or publication finishes with `partial` or `failed` status

Required message fields:

* report date
* failure stage
* short failure reason
* whether a rerun is expected automatically

### 4. Critical workflow error alert

Trigger:

* simulator, reporting, or notification workflows encounter an error that blocks expected system progress

Examples:

* simulator closeout did not produce the expected daily snapshot
* notification delivery credentials are invalid
* repeated transport failures prevent owner communication

Required message fields:

* workflow name
* severity
* short error summary
* next automatic action, if any

## Event Contract

The notification workflow should consume canonical internal events with stable payloads.

Minimum event classes:

* `dailyReportPublished`
* `dailyReportFailed`
* `portfolioThresholdBreached`
* `workflowCriticalFailure`
* `notificationDeliveryFailed`

Each event should include:

* event id
* event type
* occurred timestamp
* source workflow
* severity
* canonical payload for the specific event type
* deduplication key

Deduplication keys should be stable for logically identical alerts so retries do not create duplicate owner messages.

## Message Classes and Formatting

Owner-facing messages should prioritize speed and clarity.

Formatting rules:

* first line states the alert class and outcome
* second line provides the most important numeric or operational context
* optional third line provides the report URL or next action
* keep the total message length short enough for SMS-friendly rendering
* do not include secrets, stack traces, or raw provider payloads

Recommended classes:

* `report-success`
* `report-warning`
* `pnl-alert`
* `critical-error`

Example shapes:

* `CTB report ready for 2026-03-20. Daily change +$84.12 (+4.2%).`
* `View report: https://...`
* `CTB alert: report publish failed for 2026-03-20 at validation. Auto-retry scheduled.`

## Delivery Architecture

The initial implementation should use a layered local-delivery pipeline.

### `packages/notification-core`

Responsibilities:

* validate notification event payloads
* map events to owner-facing message classes
* apply deduplication and rate-limit policy decisions
* render final transport-ready message bodies

### `apps/notification-worker`

Responsibilities:

* subscribe to or poll canonical reporting and simulator events
* load typed local configuration and secrets
* enqueue messages for delivery
* execute SMTP transport through a local adapter
* record delivery attempts and final outcomes

### Local transport adapter

Responsibilities:

* connect to the configured SMTP provider
* send messages to the configured carrier gateway address
* surface provider response metadata when available

The adapter should stay transport-specific and must not contain business rules for when an owner should be notified.

## Scheduling and Dispatch Expectations

Dispatch expectations should differ by alert class.

* daily report delivery: dispatch immediately after successful publication
* reporting failure: dispatch immediately after terminal failure or partial result classification
* critical workflow error: dispatch immediately when the workflow becomes blocked
* major P&L change: evaluate on a scheduled cadence or on valuation events, but suppress repeated alerts for the same direction and threshold band during the cooldown window

Default cooldown guidance:

* report-success: no cooldown beyond one message per report date
* report-warning: one alert per report date per failure stage unless state changes
* critical-error: one alert per deduplication key every `30` minutes while unresolved
* pnl-alert: one alert per symbol set or portfolio-level threshold band every `60` minutes

## Reliability and Retry Expectations

Notification delivery must be explicit and observable.

Required behavior:

* each delivery attempt records attempt time, target, adapter, and outcome
* transient transport failures retry automatically with backoff
* permanent configuration failures do not spin indefinitely and instead emit a critical workflow alert
* repeated notification failures remain visible in operational logs or status artifacts

Recommended retry policy:

* retry schedule: immediate attempt plus retries after `1`, `5`, and `15` minutes
* max attempts per notification: `4`
* classify final outcome as `sent`, `suppressed`, `failed-transient`, or `failed-permanent`

If SMTP acceptance succeeds but final carrier delivery cannot be confirmed, the system should record the result as `sent-to-gateway` rather than pretending end-device delivery is guaranteed.

## Rate Limiting and Suppression

The owner should be informed, not flooded.

Rate-limit rules:

* suppress duplicate notifications that share the same deduplication key and unchanged status
* aggregate repeated workflow errors into a single active incident notification when possible
* never suppress the first notification for a new critical incident
* allow explicit escalation when a failure remains unresolved past a configured interval

Recommended escalation guidance:

* critical incident reminder after `2` hours if unresolved
* reporting failure reminder before the next report window if the prior day remains unresolved

## Configuration and Secrets

Sensitive configuration must be local, typed, and validated before delivery attempts.

Required configuration:

* SMTP host
* SMTP port
* SMTP username
* SMTP password or app-specific credential
* sender email address
* owner carrier gateway address
* enabled notification classes
* P&L threshold settings
* cooldown settings

Security rules:

* store credentials in local environment variables or a local secret manager, not in Git
* treat owner phone-routing details as sensitive contact data
* validate all required settings at startup and fail closed when critical settings are missing
* redact secrets and contact identifiers from logs unless explicitly needed for debugging

## Failure Handling

Failure handling must be explicit at two layers.

### Notification workflow failures

Examples:

* invalid SMTP credentials
* network or DNS failure from the Mac mini
* unsupported carrier gateway address format

Required handling:

* classify the failure cause
* retry only when the failure is plausibly transient
* record the final outcome in a delivery log or artifact

### Upstream workflow failures

Examples:

* report generation failed
* report publication did not produce a public URL
* simulator day-close snapshot is missing

Required handling:

* send a concise owner-facing alert that names the blocked workflow
* include whether CTB will retry automatically
* avoid pretending a report exists when publication is incomplete

## Cloud and Local Boundary

The notification architecture should preserve a clean line between cloud-hosted CTB functions and owner-local delivery.

Cloud-hosted responsibilities may include:

* publishing report artifacts
* storing non-sensitive workflow metadata
* emitting canonical status events

Local Mac mini responsibilities should include:

* loading delivery credentials
* resolving owner destination addresses
* applying owner-specific rate limits and suppression
* sending outbound messages
* storing local delivery evidence when it contains sensitive contact metadata

This split keeps sensitive owner routing details and credentials off shared cloud infrastructure in the initial design.

## Observability and Evidence

Notification flows must produce operational evidence rather than opaque side effects.

Each notification should record:

* notification id
* source event id
* alert class
* destination label or redacted target
* attempt count
* final status
* final status timestamp

Recommended evidence outputs:

* append-only local delivery log
* structured JSON delivery records for debugging and audits
* daily summary counts of sent, suppressed, and failed notifications

## Risks and Constraints

### Risk 1: carrier gateway delivery is unreliable or delayed

Mitigation:

* treat SMTP acceptance as gateway delivery, not guaranteed handset receipt
* keep notifications concise and retry only when gateway submission fails
* preserve a future adapter seam for alternate transports

### Risk 2: local host downtime causes missed alerts

Mitigation:

* run the notification worker on the same always-on Mac mini that owns local CTB automation
* emit backlog-aware notifications on restart for unresolved critical incidents
* make missed-delivery evidence visible in local logs

### Risk 3: owner alert fatigue reduces usefulness

Mitigation:

* apply class-specific cooldowns and deduplication keys
* define a narrow initial alert set
* tune thresholds through local configuration rather than code changes

### Risk 4: sensitive contact or credential data leaks through logs

Mitigation:

* keep credentials local
* redact targets in operational output
* avoid copying contact routes into cloud-hosted metadata

## Recommended Implementation Work

This design should directly feed:

* `packages/notification-core` contracts for event parsing, policy, and message rendering
* `apps/notification-worker` local orchestration and SMTP adapter wiring
* shared config parsing for local notification credentials and thresholds
* future validation stories for delivery evidence and retry behavior
