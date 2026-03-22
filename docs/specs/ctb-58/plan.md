# CTB-58 Plan

## Context

`CTB-58` is a medium-risk local-runtime story because it defines the worker boundary that later notification delivery implementation and integration testing will depend on.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus an implementation-ready update to the notification architecture baseline.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one notification architecture update that defines the local worker path, orchestration boundaries, and delivery-oriented responsibilities

## Domain Boundaries

Affected domains:

* apps/notification-worker orchestration
* notification-core consumption by the worker
* local delivery scheduling, retries, and evidence recording
* Mac mini owner-operated runtime assumptions

Unaffected domains:

* canonical event semantics already defined by CTB-57
* transport-adapter provider specifics
* public broadcast or cloud-hosted notification patterns

## Contracts and Interfaces

Artifacts will define:

* worker intake and dispatch responsibilities
* local worker execution stages
* adapter handoff and evidence-recording boundaries
* retry and dedupe behavior as enforced by the worker path

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* a specific queueing library or background-job framework
* a provider-specific SMTP implementation
* multi-recipient or public notification capabilities
* iMessage-native automation

## Risks

* If the worker boundary is vague, transport adapters may absorb policy and business logic.
* If local-runtime assumptions are weak, later implementation may drift toward unsupported cloud delivery.
* If orchestration stages are underspecified, retry and evidence handling will be inconsistent.

## Open Questions

* Final scheduling and concurrency mechanics can be tuned when the runtime stack is chosen.
* Transport-adapter choice can stay open as long as the worker boundary and evidence contract remain stable.

## Approvals

Recommended review focus:

* clarity of worker-stage responsibilities
* correctness of local-worker-only delivery assumptions
* usefulness of the execution flow for later implementation and integration testing
