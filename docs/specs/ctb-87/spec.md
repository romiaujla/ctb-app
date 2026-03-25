# CTB-87 Spec

## Problem

CTB does not yet execute the planned strategy rules against canonical market and simulator inputs, so there is no runtime path for generating versioned trade-intent decisions or recent strategy evidence.

## Goal

Implement the deterministic strategy evaluation engine, guardrail handling, and API and worker integration required to produce and persist explicit strategy decisions.

## Scope

This story covers:

* deterministic strategy input construction from canonical market and simulator truth
* rule evaluation and guardrail handling for accepted, skipped, blocked, and invalid outcomes
* API and worker-facing runtime integration for strategy evaluations
* automated tests for deterministic rule behavior and API visibility

This story does not cover:

* operator UI rendering
* strategy performance reporting
* live-money execution

## Requirements

1. CTB must derive `StrategyEvaluationInput` from canonical market-data history and simulator portfolio truth.
2. CTB must evaluate one versioned strategy rule set and emit explicit `trade-intent-emitted`, `skipped`, `blocked`, or `invalid-input` outcomes.
3. CTB must persist emitted evaluations and trade intents through the CTB-86 repository boundary.
4. CTB must expose recent evaluations and on-demand evaluation execution through runtime-approved API and worker integration points.
5. CTB must provide automated tests for deterministic strategy behavior and API integration.

## Success Criteria

The spec is successful when:

* CTB can execute one explainable strategy version from canonical inputs without hidden reads
* emitted and non-emitted outcomes are persisted and queryable
* downstream API and worker consumers reuse one runtime boundary instead of duplicating rule logic

## Primary Artifact

Runtime implementation across:

* `packages/simulator-core/src/strategy-engine.ts`
* `apps/api/src/index.ts`
* `apps/simulator-worker/src/strategy.ts`
