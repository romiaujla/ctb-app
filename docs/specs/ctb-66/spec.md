# CTB-66 Spec

## Problem

CTB does not yet define the profitability and risk evidence required before simulator performance can be considered strong enough to justify live-money planning.

## Goal

Define the initial CTB promotion gate for profitability, review-window coverage, drawdown limits, and minimum supporting evidence.

## Scope

This story covers:

* planning-level profitability expectations for promotion consideration
* minimum review-window expectations for simulator evidence
* drawdown and trust-protection limits that block premature progression
* supporting evidence expectations from reporting, observability, and validation outputs

This story does not cover:

* approval workflow or ADR signoff steps
* final promotion checklist packaging
* live brokerage or real-money implementation work

## Requirements

1. CTB must define a profitability gate for promotion consideration.
2. CTB must define a minimum review window for evaluating simulator evidence.
3. CTB must define drawdown or trust-protection limits that block promotion consideration when breached.
4. CTB must acknowledge daily reporting and observability evidence as required inputs.
5. CTB must keep promotion consideration as a gated future decision rather than an automatic result of short-term performance.

## Success Criteria

The spec is successful when:

* future reviewers can tell what baseline profit and drawdown evidence CTB must show before promotion is considered
* review-window expectations are explicit enough to prevent cherry-picked short runs
* the baseline clearly states that stronger results only unlock the next review stage rather than live execution work

## Primary Artifact

Implementation-ready process note:

* `docs/process/ctb-promotion-readiness-gates.md`
