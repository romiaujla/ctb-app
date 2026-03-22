# CTB-43 Spec

## Problem

CTB now has a canonical simulator domain-model baseline, but it still does not define the accounting responsibilities and event-history rules that should govern balances, positions, orders, fills, and portfolio-state derivation.

Without that baseline:

* accounting behavior can drift across services or read models
* portfolio state may be treated as mutable truth instead of event-derived state
* downstream reporting and validation work can lose a shared explanation path

## Goal

Define the simulator accounting model, event-history relationship, and portfolio-state derivation rules that future CTB implementation must reuse.

## Scope

This story covers:

* simulation account and ledger responsibilities
* orders, fills, positions, and portfolio snapshots as accounting records
* the relationship between immutable event history and derived portfolio state
* accounting invariants that reporting and notification work must trust

This story does not cover:

* replay-processing safeguards and determinism policy details
* exact table shapes, indexes, or migration scripts
* strategy decision logic
* report rendering or notification delivery behavior

## Requirements

### Functional requirements

1. CTB must identify the simulator account and ledger responsibilities.
2. CTB must define how orders, fills, positions, and portfolio snapshots participate in the accounting model.
3. CTB must make event history the explanation path for derived portfolio state.
4. CTB must define the accounting outputs that downstream reporting and notification work may trust.
5. CTB must give later implementation stories one reusable accounting-model baseline.

### Non-functional requirements

1. The accounting model must remain event-derived and auditable.
2. The baseline must preserve clear separation between canonical facts and derived views.
3. The artifact must be explicit enough to support later correctness-focused validation work.
4. The deliverable must stay planning-level and avoid hard-coding storage or execution mechanics.

## Success Criteria

The spec is successful when:

* future simulator-core implementation can apply one explicit accounting responsibility model
* event history and derived portfolio state are related clearly enough to support audit and reporting trust
* downstream stories can consume canonical portfolio outputs without recalculating business truth independently

## Primary Artifact

Implementation-ready design note:

* `docs/architecture/ctb-simulator-accounting-and-event-history-model.md`
