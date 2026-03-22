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

## Canonical Notification Event Model

Notification events should be modeled as canonical downstream facts, not transport commands.

Event-model rules:

* simulator and reporting domains own when a noteworthy condition exists
* notification-core owns how that condition maps to owner-facing alert classes
* notification-worker owns when and how delivery attempts are executed
* transport adapters must never invent new notification semantics

Each canonical notification event should carry:

* stable event id
* event class
* source workflow and source record id when available
* occurred timestamp
* severity
* deduplication key
* canonical payload
* recommended alert class
* evidence requirements for downstream delivery logging

### Event Class Definitions

#### `dailyReportPublished`

Purpose:

* represent a validated report publication that is eligible for owner delivery

Required payload fields:

* report date
* publication status
* dated report URL
* history index URL
* daily outcome summary
* artifact id

Deduplication intent:

* one logical event per report date and publication version

#### `dailyReportFailed`

Purpose:

* represent a report run that ended in `partial` or `failed` state and requires owner visibility

Required payload fields:

* report date
* failure stage
* failure classification
* short reason
* retry expectation

Deduplication intent:

* one logical event per report date, stage, and unchanged failure classification

#### `portfolioThresholdBreached`

Purpose:

* represent a portfolio-level change that exceeded configured alert thresholds

Required payload fields:

* trigger timestamp
* baseline timestamp
* net liquidation value
* absolute change
* percentage change
* threshold band

Deduplication intent:

* suppress repeated alerts for the same threshold band and direction during the cooldown window

#### `workflowCriticalFailure`

Purpose:

* represent a blocked operational state that threatens expected CTB progress

Required payload fields:

* workflow name
* severity
* short error summary
* next automatic action
* incident state

Deduplication intent:

* treat one unresolved incident as one active notification subject until state changes materially

#### `notificationDeliveryFailed`

Purpose:

* represent failure of the notification system itself so delivery-health issues stay observable

Required payload fields:

* notification id
* failed adapter
* failure classification
* attempt count
* next retry or terminal outcome

Deduplication intent:

* one logical event per notification id and terminally changed delivery state

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

## Message Class Mapping Rules

Message classes should stay stable even as transport implementations evolve.

Mapping guidance:

* `dailyReportPublished` -> `report-success`
* `dailyReportFailed` with `partial` outcome -> `report-warning`
* `dailyReportFailed` with `failed` outcome -> `critical-error` or `report-warning` depending on severity
* `portfolioThresholdBreached` -> `pnl-alert`
* `workflowCriticalFailure` -> `critical-error`
* `notificationDeliveryFailed` -> internal delivery evidence first, owner-facing escalation only when repeated failure blocks communication materially

Mapping rules:

* message class selection should be deterministic from the event class and severity
* alert templates may vary in wording, but class semantics should not
* message shaping must consume canonical event payloads and may not recompute business facts

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

## Local Notification Worker Model

`apps/notification-worker` should be the executable local boundary that turns canonical notification events into owner-visible delivery.

Worker-model rules:

* the worker runs on the owner-controlled Mac mini and is the only v1 component allowed to initiate owner-facing message dispatch
* the worker consumes canonical notification events from CTB-57 and must not invent new event classes
* the worker may coordinate retries, suppression, and evidence recording, but it must not recompute simulator, portfolio, or reporting business facts
* transport adapters remain replaceable implementation details beneath the worker orchestration layer

## Worker Responsibilities By Alert Path

### Report delivery path

The worker should:

* consume `dailyReportPublished` events only after validated publication completes
* load the final dated report URL and summary fields from the canonical event payload
* render a `report-success` message through `packages/notification-core`
* dispatch one owner-facing delivery attempt per deduplicated report publication event
* record final delivery evidence tied to the report artifact id

### Reporting or workflow failure path

The worker should:

* consume `dailyReportFailed` and `workflowCriticalFailure` events
* classify whether the owner-facing output is a warning or critical incident notification
* include retry expectations or next automatic action when present in the canonical event
* suppress duplicate incident alerts until state changes materially or the reminder interval is reached
* preserve evidence for both suppressed and attempted sends

### Major P&L signal path

The worker should:

* consume `portfolioThresholdBreached` events generated by canonical upstream workflows
* respect the configured threshold band, direction, and cooldown policy
* render concise `pnl-alert` messages without recomputing financial values
* prevent repeated sends for unchanged threshold-band conditions during the cooldown window

## Worker Execution Flow

The local notification worker should run through explicit stages.

### Stage 1: Event Intake

Responsibilities:

* receive canonical notification events from reporting, simulator, or workflow-status sources
* validate the event shape and required fields
* reject or quarantine malformed events instead of guessing missing data

Exit criteria:

* the event is validated and classified for worker processing
* event identity, severity, and deduplication key are available

### Stage 2: Policy Evaluation

Responsibilities:

* determine the owner-facing alert class
* check suppression and cooldown rules
* decide whether the event should dispatch now, defer, or record as suppressed

Exit criteria:

* the worker has one explicit action: dispatch, suppress, or hold for retry/reminder
* policy decisions are recorded for later evidence and debugging

### Stage 3: Message Preparation

Responsibilities:

* load local configuration and enabled-notification-class settings
* request the final transport-ready message body from `packages/notification-core`
* attach destination routing metadata without exposing sensitive values broadly

Exit criteria:

* the final message payload is ready for adapter submission
* worker metadata references the source event and target delivery attempt

### Stage 4: Local Delivery Attempt

Responsibilities:

* invoke the configured local transport adapter
* classify the outcome as sent, sent-to-gateway, failed-transient, failed-permanent, or suppressed
* trigger retry scheduling only when the failure class is plausibly transient

Exit criteria:

* the attempt outcome is classified explicitly
* a retry decision or terminal status is recorded

### Stage 5: Evidence and Follow-up

Responsibilities:

* append delivery evidence for the attempt outcome
* emit any follow-up notification workflow events when delivery itself fails materially
* preserve unresolved incident state for reminder or escalation handling

Exit criteria:

* delivery evidence is durable and reviewable
* any required retry, reminder, or terminal-failure follow-up is scheduled or recorded

## Local Runtime Assumptions

The worker should operate as an owner-managed background runtime on the Mac mini.

Runtime assumptions:

* it starts automatically with the local CTB automation environment or a supervised local service
* it can read local typed configuration and secrets at startup
* it can persist delivery evidence to local storage without depending on always-available cloud infrastructure
* it can resume unresolved reminders or transient retries after restart using preserved local evidence

These assumptions keep v1 delivery aligned to the owner-operated model and prevent accidental drift into cloud-only execution.

## Adapter Handoff Boundary

The worker should pass only transport-ready inputs to the adapter layer.

The adapter handoff should include:

* destination routing value or resolved target handle
* final message body
* delivery metadata needed for provider response logging
* retry-attempt context

The adapter handoff must not include:

* business rules for whether to notify
* logic for classifying report or simulator states
* dedupe or cooldown policy decisions

This keeps the adapter replaceable while preserving the worker as the authoritative orchestration layer.

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

## Delivery Evidence Contract

Every notification attempt should leave one reviewable evidence trail.

Required evidence fields:

* notification id
* source event id
* event class
* alert class
* deduplication key
* destination label or redacted target
* adapter name
* attempt number
* attempt timestamp
* outcome status
* outcome reason or provider response summary
* final status timestamp when terminal

Evidence rules:

* evidence should be append-only so retries are auditable
* terminal outcomes should preserve the full attempt count
* suppressed notifications should still leave evidence that explains why no send occurred
* evidence records should be structured enough for downstream observability summaries and debugging

## Retry and Dedupe Policy Intent

Retry and dedupe policy should be explicit before transport implementation begins.

Dedupe intent:

* deduplication keys should represent logical alert identity, not individual transport attempts
* retries must reuse the same deduplication key as the original send attempt
* a materially changed event state should generate a new deduplication key or versioned state
* identical unchanged events should be suppressed within the applicable cooldown window

Retry intent:

* retry only when the failure class is plausibly transient
* configuration or validation failures should become terminal quickly and surface as workflow issues
* retry state should remain visible in delivery evidence and downstream observability outputs
* final terminal failure should preserve both the original event identity and the delivery outcome classification

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

## Transport Configuration Contract

Notification transport configuration should be explicit, typed, and security-reviewed before the worker attempts delivery.

Required transport fields:

* transport adapter name
* SMTP or relay host
* SMTP or relay port
* sender identity
* authentication mode
* credential reference location
* destination routing target
* enabled message classes
* timeout and retry policy settings

Configuration rules:

* configuration parsing should fail closed when required delivery fields are missing or malformed
* secrets should be referenced through environment variables or an owner-local secret store rather than committed files
* destination routing and credential values should be redacted from normal logs and evidence outputs
* non-secret transport settings should still be typed and validated so misconfiguration is visible before runtime delivery begins

Security rules:

* store credentials in local environment variables or a local secret manager, not in Git
* treat owner phone-routing details as sensitive contact data
* validate all required settings at startup and fail closed when critical settings are missing
* redact secrets and contact identifiers from logs unless explicitly needed for debugging

## Template Validation Baseline

Notification templates should be validated before delivery attempts are allowed.

Validation expectations:

* every alert class should define the required canonical fields it expects
* template rendering should fail explicitly when required fields are absent
* rendered output should remain short, clear, and safe for SMS-friendly delivery
* rendered messages should be checked for accidental secret leakage, raw payload leakage, or unresolved placeholder tokens

Template-validation rules:

* template validation should happen before adapter submission, not after transport failure
* a template validation failure should be classified separately from provider transport failure
* invalid template output should produce delivery evidence and a visible workflow issue for follow-up
* class-specific template checks should be strong enough that later automation can test them deterministically

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

### Template or validation failures

Examples:

* required event fields missing for a message class
* unresolved placeholder token remains in rendered output
* message body exceeds acceptable transport or readability limits materially

Required handling:

* classify as a pre-send validation failure
* do not attempt transport dispatch for invalid output
* record the failure in delivery evidence with the blocking validation reason
* surface a workflow issue when invalid templates block required owner notifications

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

## Delivery Audit Contract

Delivery evidence should support both debugging and operational trust.

Audit record expectations:

* preserve one append-only record per attempt and terminal notification outcome
* retain enough metadata to correlate a notification back to the source event, worker decision, and transport result
* keep sensitive routing or credential values redacted while preserving enough context for troubleshooting

Minimum audit fields:

* notification id
* source event id
* event class
* alert class
* transport adapter
* validation status
* attempt count
* final delivery status
* final failure classification when applicable
* redacted destination label
* timestamps for render, attempt, retry scheduling, and terminal outcome

Audit rules:

* suppressed notifications must still leave audit evidence with the suppression reason
* pre-send validation failures must be distinguishable from transport failures
* terminal delivery failures should remain queryable for observability dashboards and follow-up analysis
* audit outputs should align with the notification-delivery dashboard expectations in `docs/process/ctb-observability-dashboards-and-alerts.md`

## Transport Failure Classification

Transport and validation failures should use stable classes so debugging and observability stay consistent.

Recommended classes:

* `validation-failed`
* `config-invalid`
* `auth-failed`
* `network-transient`
* `provider-rejected`
* `destination-invalid`
* `delivery-suppressed`

Classification rules:

* classes should be chosen before free-form error text is recorded
* retry policy should key off the failure class, not raw provider messages
* security-sensitive details should remain redacted even when the failure class is explicit
* the final classification should feed both local evidence and downstream observability summaries

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
