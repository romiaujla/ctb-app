# CTB-49 Spec

## Problem

CTB does not yet have explicit, versioned strategy logic for turning canonical inputs into reviewable simulated trade intents.

## Goal

Define the v1 strategy rule engine, first-class guardrails, trade-intent generation behavior, and strategy-versioning expectations.

## Scope

This story covers:

* rule-engine boundary and decision states
* trade-intent output expectations
* guardrail behavior
* strategy-version metadata

This story does not cover:

* simulator execution mechanics
* live-money routing
* multi-strategy portfolio allocation

## Requirements

1. CTB must define explicit strategy evaluation outputs.
2. CTB must treat guardrails and invalid-trade conditions as first-class outcomes.
3. CTB must keep trade-intent generation separate from execution and accounting.
4. CTB must attach strategy-version metadata to evaluations and trade intents.
5. CTB must keep the rule-engine boundary replay-safe and reviewable.

## Success Criteria

The spec is successful when:

* later strategy implementation can follow one explicit rule-engine boundary
* trade-intent outputs are attributable to one strategy version
* blocked and skipped decisions are visible instead of implicit

## Primary Artifact

Implementation-ready design note:

* `docs/architecture/ctb-strategy-rule-engine-and-versioning.md`
