# CTB-88 Spec

## Problem

CTB does not yet surface strategy evaluation evidence in the operator-facing web workspace, so recent decisions, strategy version context, and explainability details remain hidden behind backend records.

## Goal

Add the operator-facing strategy view model and API-backed web integration needed to present recent strategy evaluations, decision outcomes, and explainability context clearly.

## Scope

This story covers:

* web-facing strategy operator view models
* API consumption for recent strategy evaluations
* scaffold rendering updates for strategy status and explainability
* automated tests for emitted, skipped, and blocked strategy UI states

This story does not cover:

* backend strategy engine changes
* report-generation workflows
* visual framework migration beyond the current web scaffold

## Requirements

1. The web workspace must consume recent strategy evaluations exposed by the API.
2. The operator-facing view model must show strategy version, decision outcomes, and explainability context.
3. The rendered strategy section must use explicit labels and visible state text aligned to repo UI guidelines.
4. The integration must preserve empty, review-ready, and warning states rather than collapsing them into generic output.
5. Automated tests must cover emitted, skipped, and blocked strategy UI cases.

## Success Criteria

The spec is successful when:

* the operator-facing web scaffold can show recent strategy behavior without reverse-engineering backend records
* strategy status and reasons are visible in clear, labeled UI output
* downstream UI work can inherit one stable strategy-view integration pattern

## Primary Artifact

Operator-facing web integration across:

* `apps/web/src/main.ts`
* `tests/strategy-web.test.ts`
