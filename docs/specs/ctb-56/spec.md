# CTB-56 Spec

## Problem

CTB does not yet define one predictable publication workflow for turning validated daily report artifacts into stable GitHub Pages history and operator-facing links.

## Goal

Define the GitHub Pages publication workflow, report-history index, link conventions, and operator handoff expectations for validated CTB daily reports.

## Scope

This story covers:

* GitHub Pages publication as a static delivery surface
* dated report path and history index expectations
* stable link conventions for notification and operator UI consumers
* operator handoff metadata for published reports

This story does not cover:

* dynamic dashboards on GitHub Pages
* authenticated public user accounts
* real-money disclosure workflows

## Requirements

1. CTB must use GitHub Pages only as a static reporting surface for validated daily report artifacts.
2. CTB must define the publication workflow and history-index expectations for published reports.
3. CTB must define stable link conventions that downstream notifications and UI can reference directly.
4. CTB must restrict publication eligibility to validated report artifacts only.
5. CTB must define the minimum operator handoff metadata for published report access and status.

## Success Criteria

The spec is successful when:

* publication implementation can follow one static Pages workflow without adding runtime reporting logic
* notifications and operator UI can link to one stable report-history contract
* unvalidated artifacts are excluded from publication by design

## Primary Artifact

Implementation-ready design note update:

* `docs/architecture/ctb-daily-reporting-and-github-pages.md`
