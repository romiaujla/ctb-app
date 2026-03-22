# CTB-46 Spec

## Problem

CTB lacks explicit freshness and failure-handling rules for canonical market data, which means stale or malformed inputs could quietly influence simulator and strategy behavior.

## Goal

Define freshness rules, timestamp guardrails, stale-data handling, and failure-visibility expectations so CTB can fail safely when market inputs are untrustworthy.

## Scope

This story covers:

* freshness state definitions
* timestamp guardrails
* stale, delayed, partial, invalid, and unavailable handling
* operator visibility requirements for market-data trust issues

This story does not cover:

* replay persistence mechanics
* ingestion scheduling implementation
* UI screen design
* notification transport decisions

## Requirements

1. CTB must define readiness states for canonical market events.
2. CTB must document timestamp consistency rules and clock-skew handling.
3. CTB must define how stale, partial, invalid, and unavailable data affects downstream consumers.
4. CTB must make trading-session context visible in freshness evaluation.
5. CTB must identify operator-facing failure signals for delayed, stale, malformed, or missing data.

## Success Criteria

The spec is successful when:

* downstream ingestion work can enforce freshness checks without inventing new states
* strategy evaluation can block safely on untrusted market inputs
* operators can tell whether the issue is delay, invalid payloads, or feed loss

## Primary Artifact

Implementation-ready design note:

* `docs/architecture/ctb-market-data-freshness-and-failure-visibility.md`
