# CTB Validation Matrix

## Purpose

This document defines the reusable CTB validation matrix across testing layers and risk tiers.

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/process/ctb-cicd-validation-baseline.md`
* `docs/process/ctb-test-automation-engineer-agent-workflow.md`
* `docs/process/ctb-qa-agent-workflow.md`
* `docs/process/ctb-security-agent-workflow.md`

## Matrix Goals

The validation matrix should:

* map CTB changes to the right validation layers without guesswork
* align validation depth to CTB risk tiers
* make contract, integration, UI, and workflow testing expectations reusable
* support consistent PR validation notes and release evidence
* expose where automation, exploratory testing, or security review are required

## Validation Layers

CTB should reason about validation using these layers.

### 1. Repository quality

Use for:

* lint
* formatting
* type-check
* markdown or broken-link validation when available

Purpose:

* catch baseline repository integrity issues before deeper testing

### 2. Unit validation

Use for:

* local logic
* edge cases
* deterministic helper behavior
* message shaping or transformation logic

Purpose:

* prove component-level behavior with fast feedback

### 3. Contract validation

Use for:

* schemas
* shared types
* event payloads
* API request and response shapes
* report or notification artifact structures

Purpose:

* keep shared interfaces stable and explicit for downstream consumers

### 4. Integration validation

Use for:

* module-to-module behavior
* worker-to-core boundaries
* persistence or file-system boundaries
* adapter orchestration around external systems

Purpose:

* verify that collaborating units behave correctly together

### 5. API validation

Use for:

* route behavior
* request validation
* response contracts
* auth and error handling

Purpose:

* confirm externally exposed application surfaces behave as designed

### 6. UI validation

Use for:

* rendering of operator-visible states
* accessibility basics
* interaction behavior
* responsive layout behavior where relevant

Purpose:

* confirm operator-facing surfaces remain usable and accurate

### 7. Workflow or end-to-end validation

Use for:

* critical user or operator journeys
* multi-stage reporting flows
* notification delivery paths
* release-sensitive runtime sequences

Purpose:

* verify that the system behaves correctly across multiple layers and handoffs

### 8. Exploratory and release validation

Use for:

* ambiguous behavior
* edge conditions
* operator workflow review
* regression-sensitive areas not fully automated

Purpose:

* expose gaps between automated confidence and real workflow behavior

### 9. Security validation

Use for:

* secrets and credential handling
* owner contact data
* auth and authorization
* protected-path changes

Purpose:

* preserve trust boundaries and make security-sensitive review explicit

## Risk-Tier Expectations

### Low risk

Default expectation:

* repository quality validation
* targeted unit or scope-appropriate checks when executable behavior changed
* PR validation notes calling out any missing automation

Typical examples:

* documentation changes
* isolated UI copy or styling without logic changes
* narrow refactors with unchanged behavior

### Medium risk

Default expectation:

* all low-risk expectations
* unit and integration validation where applicable
* contract validation for shared interfaces or artifact shapes
* exploratory or manual validation when workflow behavior changed

Typical examples:

* business logic changes
* API or contract changes
* reporting or notification behavior changes

### High risk

Default expectation:

* all medium-risk expectations
* security validation
* strongest practical workflow validation for critical paths
* explicit visibility of automation gaps and residual risk

Typical examples:

* financial logic
* secrets handling
* deployment configuration
* auth, authorization, or future tenant boundary changes

## Domain-to-Layer Guidance

### Simulator and financial logic

Expected layers:

* repository quality
* unit validation
* integration validation
* workflow validation for critical trading or reporting handoffs
* security validation when protected-path rules apply

Focus:

* correctness
* determinism
* edge-case safety
* downstream evidence integrity

### API and shared contracts

Expected layers:

* repository quality
* contract validation
* integration validation
* API validation

Focus:

* request and response shape
* consumer compatibility
* error handling
* auth boundary behavior when relevant

### UI and operator-facing surfaces

Expected layers:

* repository quality
* UI validation
* exploratory validation
* workflow validation for critical operator journeys when available

Focus:

* accessibility
* rendering correctness
* status visibility
* responsive behavior

### Reporting

Expected layers:

* repository quality
* contract validation for report payloads or artifacts
* integration validation for generation and publication handoffs
* workflow validation for report generation and publication flows

Focus:

* evidence accuracy
* artifact completeness
* publication safety
* operator visibility of complete, partial, and failed states

### Notification

Expected layers:

* repository quality
* contract validation for notification events and message payloads
* integration validation for worker and adapter orchestration
* workflow validation for critical delivery paths
* security validation for credentials and owner contact handling

Focus:

* transport safety
* dedupe and retry correctness
* delivery evidence
* owner-alert reliability

## Contract and Integration Ownership

Contract validation should be owned where shared interfaces are defined.

Ownership guidance:

* shared schemas and payloads should validate at the contract boundary
* consumers should reuse shared contracts rather than redefining them
* integration validation should target the handoff between collaborating packages or apps
* when consumers are not updated in the same PR, the PR should identify them explicitly in validation notes

## Reuse in Pull Requests

Future CTB PRs should use this matrix to explain validation scope.

PR validation notes should say:

* which validation layers were relevant
* which checks ran
* which layers were intentionally not used and why
* what automation or exploratory gaps remain

This keeps PR evidence aligned to one reusable framework instead of ad hoc narratives.

## Selective Use Rules

Not every change needs every layer.

Selection rules:

* choose layers based on changed scope and risk tier
* include contract validation whenever a shared interface changes
* include exploratory validation whenever operator-visible or workflow-critical behavior changes and automation is incomplete
* include security validation whenever protected-path or sensitive-data concerns apply

If a needed layer cannot be run credibly, the gap must be stated explicitly in the PR and downstream validation notes.
