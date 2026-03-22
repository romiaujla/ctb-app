# CTB-60 Spec

## Problem

CTB does not yet define one reusable validation matrix across testing layers and risk tiers, which would make simulator, API, UI, reporting, and notification changes use inconsistent quality gates.

## Goal

Define the CTB validation matrix across unit, integration, contract, API, UI, and risk-tier-aware evidence requirements.

## Scope

This story covers:

* validation layers relevant to simulator, API, UI, reporting, and notification work
* risk-tier-aware evidence expectations aligned to repository process rules
* planning-level ownership of contract and integration testing responsibilities
* reusable matrix guidance for future stories and PR validation notes

This story does not cover:

* production incident response
* live broker compliance review
* enterprise-wide QA standards outside CTB

## Requirements

1. CTB must identify the validation layers relevant to simulator, API, UI, reporting, and notification concerns where applicable.
2. CTB must align risk-tier-aware evidence expectations with repository process guidance.
3. CTB must make contract and integration testing responsibilities visible at a planning level.
4. CTB must provide a reusable matrix that future implementation stories and pull requests can reference.
5. CTB must preserve clear layer ownership so validation work is neither duplicated nor skipped.

## Success Criteria

The spec is successful when:

* future CTB changes can map their validation plan to one documented matrix
* PR validation notes can reference consistent layer and risk expectations
* teams can tell which validation layers are required, recommended, or selectively applicable for a given change

## Primary Artifact

Implementation-ready process note:

* `docs/process/ctb-validation-matrix.md`
