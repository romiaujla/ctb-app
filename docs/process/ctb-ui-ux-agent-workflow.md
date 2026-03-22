# CTB UI / UX Agent Design and Figma Handoff Workflow

## Purpose

This document defines how the UI / UX Agent produces CTB design outputs that engineering and QA can consume directly.

It provides:

* user-flow output expectations
* a standard screen, state, and component handoff format
* Figma-linked implementation notes
* accessibility and responsive design checkpoints

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/process/ui-guidlines.md`
* `docs/process/ctb-jira-workflow.md`
* `docs/process/ctb-solution-architect-agent-workflow.md`

## Workflow Goals

The UI / UX Agent workflow should:

* make user intent and interaction flow explicit before implementation
* give engineering enough detail to build without reinterpreting the design
* give QA enough clarity to validate expected behavior and edge states
* preserve accessibility and responsive behavior as first-class design requirements

## Required Inputs

The UI / UX Agent should work from:

* Jira issue scope and acceptance criteria
* backlog assumptions or open questions that affect the user flow
* architecture or domain constraints when they affect UX behavior
* existing design-system or component guidance

If those inputs are incomplete, the design handoff should call out the gap instead of inventing product behavior silently.

## Required Output Format

Design handoff output should use these sections:

* `## User Flow`
* `## Screens and States`
* `## Components and Behaviors`
* `## Figma References`
* `## Accessibility Checkpoints`
* `## Responsive Notes`

## User Flow Rules

The user-flow section should describe:

* the starting point
* the primary success path
* important alternate or error paths
* any gating conditions or decision points

Downstream teams should be able to understand how a user or operator moves through the workflow without reverse-engineering the design.

## Screens, States, and Components

The handoff should make these explicit where relevant:

* screens, views, or surfaces involved
* key states such as loading, empty, error, success, and blocked states
* component behavior that affects implementation or QA validation
* content or interaction details that are easy to misinterpret from visuals alone

## Figma Reference Rules

If Figma is used, the handoff should include:

* the relevant file or frame link
* what part of the workflow the link represents
* any implementation notes that are not obvious from the frame itself

Figma links should support the handoff, not replace the written explanation.

## Accessibility Checkpoints

The UI / UX Agent should explicitly call out:

* semantic structure and labeling needs
* keyboard and focus expectations
* error or validation visibility
* places where color alone must not carry meaning

Accessibility notes should align with `docs/process/ui-guidlines.md`.

## Responsive Notes

Responsive notes should describe:

* behavior differences across key viewport sizes when relevant
* content or action prioritization on smaller screens
* layout constraints that engineering should preserve

If the design is desktop-first or mobile-first for a given flow, the handoff should say so.

## Handoff to Engineering and QA

The design output should leave downstream teams with:

* implementation-ready flow and state guidance
* clear references to visuals and non-obvious interaction expectations
* explicit accessibility and responsive checkpoints
* enough detail to validate the intended experience without re-scoping the issue

## Escalation Rules

Escalate when:

* the user flow conflicts with acceptance criteria or architecture constraints
* key states or interactions remain ambiguous
* accessibility or responsive expectations materially affect scope
* design decisions exceed the current issue boundary

Escalation outcomes:

* clarify the issue scope
* request architecture or backlog refinement
* split follow-up UX work into a separate issue
* pause implementation until design ambiguity is resolved

## Definition of Done for UI / UX Workflow

The UI / UX Agent workflow is complete when:

* user flow is explicit
* screens, states, and components are implementation-ready
* Figma references are linked with supporting notes
* accessibility and responsive expectations are visible
* engineering and QA can consume the handoff directly
