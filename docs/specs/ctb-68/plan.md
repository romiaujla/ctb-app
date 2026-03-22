# CTB-68 Plan

## Context

`CTB-68` is a medium-risk process story because it closes the simulator-first promotion chain and defines the final boundary before any future live-money initiative could be proposed.

The repo remains docs-first, so the implementation for this issue is an issue-scoped Spec Kit plus a reusable process document for the final promotion checklist and evidence package.

## Decision

Deliver the story as:

* one issue-scoped spec
* one issue-scoped plan
* one issue-scoped task list
* one reusable promotion-checklist document under `docs/process`
* small repository link updates so future promotion reviews can find the completed chain directly

## Domain Boundaries

Affected domains:

* promotion review readiness
* cross-domain evidence packaging
* explicit separation between simulator success and live execution work
* future program-entry controls

Unaffected domains:

* simulator threshold calculations
* governance approval role definitions
* broker or live-trading implementation design

## Contracts and Interfaces

Artifacts will define:

* final checklist items for promotion review
* the minimum evidence package and evidence sources
* the hard boundary against unapproved live execution
* the rule that future live-money work requires separate Jira and architecture scope

## Rollout Constraints

This issue must stay planning-level and must not pre-commit CTB to:

* direct live-money implementation after checklist completion
* broker-specific readiness procedures
* any assumption that the simulator-first backlog can expand into live execution without a new approved program

## Risks

* If the final checklist is vague, promotion reviews may be improvised inconsistently.
* If the evidence package is incomplete, decisions may be made from partial operational history.
* If the live-execution boundary is soft, future work may drift into unapproved execution scope.

## Open Questions

* The evidence package format may become more structured as CTB accumulates longer operating history.
* Future live-money programs may require additional controls once brokerage, funding, or regulatory questions become concrete.

## Approvals

Recommended review focus:

* clarity of the final promotion checklist and evidence package
* strength of the explicit boundary against unapproved live execution
* consistency with the earlier threshold and governance baselines
