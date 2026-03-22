# CTB-61 Spec

## Problem

CTB does not yet define one reusable security baseline for local-first runtime, reporting, and notification work, which increases the chance of inconsistent secret, config, or dependency hygiene.

## Goal

Define and deliver the CTB security baseline for secret handling, config hygiene, dependency review, and protected-path expectations.

## Scope

This story covers:

* secret-handling expectations for local runtime and automation workflows
* config hygiene and sensitive-path protections
* dependency-review and supply-chain risk expectations at a planning level
* reusable protected-path expectations aligned to repository guidance

This story does not cover:

* enterprise compliance certifications
* brokerage regulatory programs
* non-CTB corporate security programs

## Requirements

1. CTB must define secret-handling expectations for local runtime and automation workflows.
2. CTB must make config hygiene and sensitive-path protections explicit.
3. CTB must make dependency-review and supply-chain risk expectations visible at a planning level.
4. CTB must stay aligned with existing repository security-review and validation guidance.
5. CTB must provide a reusable security baseline that future implementation and release work can inherit.

## Success Criteria

The spec is successful when:

* future CTB changes can reference one minimum security posture instead of ad hoc rules
* secret and config expectations are explicit enough to reduce accidental exposure risk
* security review and CI follow-on work can reuse one clear baseline for sensitive-path changes

## Primary Artifact

Implementation-ready process note:

* `docs/process/ctb-security-baseline.md`
