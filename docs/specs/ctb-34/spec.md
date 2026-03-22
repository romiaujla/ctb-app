# CTB-34 Spec

## Problem

CTB does not yet define one explicit first strategy hypothesis, which would force later simulator work to invent entry, exit, and risk behavior without a stable planning baseline.

## Goal

Define the initial CTB v1 trading strategy hypothesis, entry and exit rules, guardrails, invalid-trade conditions, and versioning policy for downstream implementation work.

## Scope

This story covers:

* the initial v1 strategy family and objective
* planning-level entry, exit, and sizing rules
* guardrails and invalid-trade conditions
* strategy versioning intent

This story does not cover:

* rule-engine implementation
* simulator fill behavior
* automated strategy switching or optimization

## Requirements

1. CTB must define one explicit v1 strategy hypothesis.
2. CTB must define the planning-level entry and exit behavior for that strategy.
3. CTB must define guardrails, invalid-trade conditions, and conservative sizing limits.
4. CTB must define the initial strategy versioning policy.
5. CTB must provide one reusable baseline that later strategy work can implement without reinterpretation.

## Success Criteria

The spec is successful when:

* two different implementers would build the same intended v1 strategy behavior
* later strategy-engine work can distinguish emitted, blocked, skipped, and invalid outcomes consistently
* later profitability-review work can judge one stable versioned strategy baseline

## Primary Artifact

Implementation-ready strategy baseline:

* `docs/architecture/ctb-v1-strategy-hypothesis.md`
