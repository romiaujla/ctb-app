# CTB AI Usage Policy and ADR Governance

## Purpose

This document defines the operational rules for AI usage in CTB and the architectural decision record (ADR) triggers that preserve durable engineering intent.

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/process/ctb-jira-workflow.md`
* `docs/process/ctb-agent-governance.md`
* `docs/architecture/ctb-simulator-architecture.md`
* `docs/architecture/ctb-monorepo-structure.md`

## Policy Goals

The policy must:

* enable safe, reviewable AI-assisted delivery
* protect CTB business logic, tenant boundaries, and operational data
* make human ownership explicit for high-risk decisions
* define when architectural choices require durable records
* support the current simulator-first scope while staying compatible with CTB's multi-tenant future state

## Core Rules

### Human accountability is mandatory

AI may assist with drafting, analysis, implementation, testing ideas, and documentation, but human owners remain accountable for:

* scope definition
* architectural direction
* approval of high-risk changes
* release authorization
* acceptance of policy exceptions

Agent output is never a substitute for reviewer judgment.

### AI output must stay reviewable

All AI-assisted changes must be:

* traceable to a Jira issue
* reviewable in small, scoped pull requests
* validated at the layer appropriate to the risk tier
* accompanied by clear rationale when the generated output affects architecture, contracts, security, or financial correctness

### Sensitive context must be minimized

Prompts, attachments, and copied context should include only the minimum information required to complete the task safely.

Do not expose secrets, credentials, tokens, private keys, production-only configuration values, or regulated or sensitive customer data to AI tools.

## Approved AI Usage Patterns

AI is approved for:

* drafting documentation, handoff artifacts, and process updates
* summarizing repository context and surfacing likely change locations
* generating implementation drafts for bounded issues
* proposing test cases, validation plans, and rollout checklists
* identifying code review risks, edge cases, and follow-up work
* translating existing architectural direction into reusable templates or guardrails

These uses remain subject to normal review, validation, and approval gates.

## Prohibited or Restricted AI Usage

AI must not be used to:

* approve its own high-risk output without human review
* make final architecture, release, or security approval decisions
* invent requirements that are not grounded in Jira, repository policy, or confirmed direction
* process secrets or sensitive data that should not leave a trusted runtime or storage boundary
* bypass repository hooks, branch protection, or validation requirements
* bulk-change unrelated areas of the codebase under a single issue

Restricted use cases require explicit human approval before proceeding:

* auth and authorization changes
* tenant isolation logic
* financial or simulator decision logic
* deployment and infrastructure configuration
* contract changes with downstream consumers

## Prompt and Data-Handling Rules

When using AI tooling for CTB work:

* share the minimum repository excerpts needed for the task
* redact or omit secrets, credentials, and sensitive identifiers
* avoid pasting production logs or data that include contact details or sensitive operational content
* prefer repository documents and typed contracts over free-form descriptions when providing context
* state assumptions explicitly when the available context is incomplete

If safe context cannot be provided, stop and escalate instead of improvising.

## Reviewer Expectations for AI-Assisted Changes

Reviewers should verify:

* the change is still within the linked Jira scope
* acceptance criteria are addressed directly
* generated content did not introduce unsupported claims or hidden scope
* validation depth matches the issue risk tier
* sensitive workflows received the right human gate
* follow-up work is captured instead of being silently deferred

High-risk AI-assisted changes require reviewers to challenge both correctness and decision quality, not just code style or formatting.

## When an ADR Is Required

Create or update an ADR when a change affects:

* domain boundaries or monorepo package ownership
* shared contracts, schemas, or integration patterns
* simulator architecture, decision flow, or determinism guarantees
* reporting or notification architecture with operational evidence implications
* multi-tenant assumptions, isolation boundaries, or future tenant-scoping strategy
* security posture, secrets handling, or deployment topology
* a tradeoff where multiple reasonable approaches exist and future contributors will need the rationale

## When an ADR Is Usually Not Required

An ADR is usually unnecessary for:

* localized documentation improvements
* copy updates
* small refactors with unchanged architecture
* test-only changes that do not alter design direction
* implementation details that stay within an already approved design

If uncertainty remains, prefer a short ADR over an undocumented high-impact decision.

## ADR Minimum Content

Every CTB ADR should capture:

* decision statement
* context and constraints
* options considered
* selected approach and rationale
* consequences and follow-up implications
* owner and linked Jira issue

The goal is durable reasoning, not exhaustive prose.

## Exceptions and Escalation

Escalate when:

* AI output conflicts with repository policy or accepted architecture
* a reviewer cannot verify the source or reasoning behind a high-risk change
* sensitive data would be needed to continue safely
* a change appears to create a new architectural boundary without a durable record
* scope expands beyond the active Jira issue

Exception requests must identify:

* what rule is being bypassed
* why the exception is necessary
* who accepts the risk
* what follow-up action restores the standard control

## Operating Guidance for CTB's Future State

CTB is currently simulator-first, but this policy should be applied as if future tenant separation, operational reporting, and controlled release workflows already matter.

That means AI-assisted work should:

* preserve clean domain boundaries now
* avoid assumptions that collapse future tenant isolation
* treat financial and reporting logic as high scrutiny areas
* leave behind decision records when future scale or safety depends on the rationale
