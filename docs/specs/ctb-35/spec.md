# CTB-35 Spec

## Problem

CTB does not yet define one repeatable way to judge simulator profitability or decide when the active strategy version should continue, be revised, or be paused.

## Goal

Define the profitability evaluation rules, review cadence, strategy-switch decision outcomes, and reporting-evidence expectations that CTB should use once simulation runs begin.

## Scope

This story covers:

* review cadence for daily, weekly, and formal strategy review
* planning-level profitability and drawdown evaluation rules
* strategy-switch and pause-decision outcomes
* the evidence future reporting and observability work must surface

This story does not cover:

* dashboard implementation
* automated strategy switching
* live-money promotion approval

## Requirements

1. CTB must document profitability evaluation criteria at a planning level.
2. CTB must define a repeatable review cadence for simulation performance.
3. CTB must define the decision outcomes and triggers for continuing, revising, or pausing the active strategy.
4. CTB must identify the evidence future reporting and observability work should expose.
5. CTB must provide one reusable baseline that downstream review and reporting work can inherit.

## Success Criteria

The spec is successful when:

* the owner can apply one repeatable review process instead of ad hoc judgment
* future reporting and observability stories know what evidence matters
* strategy-version changes reset review expectations in a traceable way

## Primary Artifact

Implementation-ready review-policy baseline:

* `docs/process/ctb-profitability-review-and-strategy-switch-policy.md`
