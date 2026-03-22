# CTB-68 Spec

## Problem

CTB does not yet define the final promotion checklist and evidence package that must exist before any future live-money planning can be considered, which leaves room for simulator success to blur into unapproved execution scope.

## Goal

Define the final promotion checklist, evidence package expectations, and explicit boundary that prevents live execution work from starting without a separate approved program.

## Scope

This story covers:

* final checklist content for promotion consideration
* evidence package expectations across reporting, validation, observability, and governance
* the boundary between promotion approval and future live-execution work
* reusable guidance for future go or no-go promotion reviews

This story does not cover:

* revising the threshold gate metrics
* revising the governance or ADR approval workflow
* implementing live-money trading capabilities

## Requirements

1. CTB must define the final promotion checklist content at a planning level.
2. CTB must define the minimum evidence package used for final promotion review.
3. CTB must make the boundary against unapproved live execution explicit.
4. CTB must require future live-money work to open as separate approved Jira and architecture scope.
5. CTB must complete the reusable promotion-criteria planning chain.

## Success Criteria

The spec is successful when:

* future reviewers can tell what evidence package is required before a go or no-go review
* the checklist makes it difficult to confuse promotion readiness with approval to implement live execution
* the document closes the simulator-first chain with an explicit requirement for separate future program approval

## Primary Artifact

Implementation-ready process note:

* `docs/process/ctb-promotion-checklist-and-evidence-package.md`
