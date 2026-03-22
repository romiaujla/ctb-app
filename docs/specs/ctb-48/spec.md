# CTB-48 Spec

## Problem

CTB does not yet have one stable strategy input model, so the strategy engine could end up coupling directly to provider payloads or ad hoc simulator reads.

## Goal

Define the canonical strategy input contract that combines trusted market context, simulator truth, and risk context for deterministic CTB v1 strategy evaluation.

## Scope

This story covers:

* market, portfolio, and risk inputs to strategy evaluation
* deterministic and replay-safe evaluation requirements
* boundary rules that exclude provider-specific and unrelated runtime state

This story does not cover:

* specific strategy rules
* live execution
* UI strategy controls
* reporting flows

## Requirements

1. CTB must define a canonical `StrategyEvaluationInput`.
2. CTB must identify required simulator truth and risk context.
3. CTB must exclude provider-specific fields from the strategy boundary.
4. CTB must make the contract suitable for replay and deterministic testing.
5. CTB must define ownership of each major input area.

## Success Criteria

The spec is successful when:

* later strategy logic can operate from one declared input contract
* the strategy layer no longer needs direct provider or hidden state reads
* deterministic strategy testing can be planned from the contract alone

## Primary Artifact

Implementation-ready design note:

* `docs/architecture/ctb-strategy-input-contract.md`
