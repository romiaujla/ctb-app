# CTB-67 Spec

## Problem

CTB does not yet define the governance review path that must stand between strong simulator results and any future live-money planning.

## Goal

Define the strategy-comparison review, approval workflow, and ADR requirements that must be satisfied before CTB can enter live-money planning.

## Scope

This story covers:

* strategy-comparison expectations for promotion review
* explicit architecture and governance approval steps
* ADR requirements before live-money planning can be proposed
* reusable review guidance for future promotion decisions

This story does not cover:

* the quantitative profitability threshold itself
* the final promotion checklist or evidence package template
* live execution implementation work

## Requirements

1. CTB must define a strategy-comparison review before live-money planning is considered.
2. CTB must require explicit architecture and governance approval for promotion progression.
3. CTB must define when an ADR is required before live-money planning can begin.
4. CTB must keep promotion review separate from implementation of live-trading capabilities.
5. CTB must provide a reusable governance baseline for downstream promotion decisions.

## Success Criteria

The spec is successful when:

* future reviewers can tell who approves promotion progression and what they are reviewing
* ADR expectations are explicit enough to prevent informal or undocumented promotion decisions
* profitable simulator results are clearly treated as inputs to governance review rather than as automatic approval

## Primary Artifact

Implementation-ready process note:

* `docs/process/ctb-promotion-governance-and-adr-workflow.md`
