# CTB-55 Spec

## Problem

CTB does not yet define one concrete daily report generation pipeline that turns canonical simulator outputs into validated HTML and JSON report artifacts ready for publication.

## Goal

Define the daily report generation pipeline, canonical data dependencies, artifact contract, and validation checks that should run before CTB publishes a daily simulator report.

## Scope

This story covers:

* canonical upstream dependencies required for report generation
* stage-by-stage report assembly from input collection through artifact creation
* HTML and JSON artifact expectations
* publish-readiness validation checks for completeness and schema shape

This story does not cover:

* notification transport delivery
* dynamic operator UI controls
* live-money reporting statements

## Requirements

1. CTB must define the ordered daily report generation stages from canonical input collection through final artifact creation.
2. CTB must keep report generation downstream of canonical simulator, portfolio, and strategy outputs.
3. CTB must support both HTML and machine-readable JSON daily report artifacts.
4. CTB must define validation checks for completeness, schema shape, reconciliation, and publish readiness.
5. CTB must make partial or failed report states explicit instead of silently publishing incomplete output.

## Success Criteria

The spec is successful when:

* reporting implementation can follow one concrete generation pipeline
* downstream publication and notification work can consume validated artifacts without recalculating report content
* operators can distinguish successful, partial, and failed report outcomes from the artifact contract alone

## Primary Artifact

Implementation-ready design note update:

* `docs/architecture/ctb-daily-reporting-and-github-pages.md`
