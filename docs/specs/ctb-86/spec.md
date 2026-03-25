# CTB-86 Spec

## Problem

CTB does not yet persist the strategy evaluation records, emitted trade intents, or explainability evidence needed to turn the CTB-48 through CTB-50 planning chain into durable production data.

## Goal

Add the persistence baseline for versioned strategy evaluations, explainability evidence, and emitted trade intents so downstream API, replay, and operator work can consume one canonical source of truth.

## Scope

This story covers:

* strategy evaluation persistence records
* emitted trade-intent persistence records
* shared contracts and repository interfaces for strategy evidence
* database and repository tests for explicit decision-state storage

This story does not cover:

* strategy rule execution
* API endpoint delivery
* operator UI rendering

## Requirements

1. CTB must persist one canonical strategy evaluation record for each evaluation attempt.
2. CTB must persist emitted trade intents separately from simulator execution records.
3. CTB must preserve strategy identity, version, decision state, and explainability evidence.
4. CTB must expose shared TypeScript and Zod contracts for strategy persistence records.
5. CTB must provide repository and integration tests that validate trade-intent linkage and recent evaluation retrieval.

## Success Criteria

The spec is successful when:

* strategy evidence is durable rather than implied by later simulator records
* emitted trade intents remain attributable to one strategy evaluation and version
* downstream implementation can query one repository boundary instead of reconstructing strategy state

## Primary Artifact

Production code and migration changes across:

* `prisma/schema.prisma`
* `packages/types/src/index.ts`
* `packages/schemas/src/index.ts`
* `packages/simulator-core/src/strategy-repository.ts`
