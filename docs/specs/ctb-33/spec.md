# CTB-33 Spec

## Problem

CTB does not yet define one explicit v1 product boundary, which makes later backlog, architecture, and implementation work vulnerable to scope drift and conflicting assumptions.

## Goal

Define the CTB v1 product boundary, exclusions, success metrics, and planning-level operator workflow that downstream work must inherit.

## Scope

This story covers:

* CTB v1 product intent and boundary rules
* in-scope and out-of-scope capability definitions
* planning-level operator workflow expectations
* initial product-level success metrics and health signals

This story does not cover:

* detailed strategy logic
* profitability thresholds or promotion gates
* API, UI, or reporting implementation details

## Requirements

1. CTB must define v1 as single-owner, single-tenant, and simulator-only.
2. CTB must document the in-scope and out-of-scope product boundary.
3. CTB must document the planning-level operator workflow for daily CTB use.
4. CTB must identify initial product-level success metrics and health signals.
5. CTB must provide one reusable baseline that later stories can reference without re-stating the boundary.

## Success Criteria

The spec is successful when:

* later stories can tell whether requested work belongs inside CTB v1 without ambiguity
* downstream API, UI, and strategy work can inherit one operator workflow instead of inventing parallel flows
* product-level health and trust expectations are visible before implementation begins

## Primary Artifact

Implementation-ready product baseline:

* `docs/architecture/ctb-v1-product-boundary.md`
