# CTB-50 Spec

## Problem

CTB does not yet define one canonical output and explainability model for strategy evaluation, which would make later reporting and review dependent on reverse-engineering engine behavior.

## Goal

Define the strategy evaluation outputs, explainability trail, and future-safe strategy-switch hooks that should accompany CTB v1 strategy execution.

## Scope

This story covers:

* strategy evidence outputs
* explainability expectations for signals, guardrails, and skipped trades
* stable strategy identity and version attribution for future-safe switching

This story does not cover:

* automated production strategy switching
* public analytics surfaces
* live-money approval workflows

## Requirements

1. CTB must define canonical strategy evidence outputs.
2. CTB must define explainability expectations for emitted, skipped, and blocked outcomes.
3. CTB must preserve strategy identity and version attribution.
4. CTB must support downstream reporting and observability consumption directly.
5. CTB must stay single-strategy in v1 while preserving future replacement hooks.

## Success Criteria

The spec is successful when:

* reporting and observability stories can consume one strategy evidence record
* unexpected strategy behavior can be explained without reverse-engineering the engine
* future strategy replacement does not require redefining the evidence contract

## Primary Artifact

Implementation-ready design note:

* `docs/architecture/ctb-strategy-output-and-explainability.md`
