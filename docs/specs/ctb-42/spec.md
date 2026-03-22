# CTB-42 Spec

## Problem

CTB does not yet define one canonical simulator domain model that implementation, reporting, notification, and future validation work can share safely.

Without that baseline:

* core trading records can drift across services or packages
* event and schema expectations can be reinterpreted by downstream consumers
* persistence ownership can blur between canonical simulator truth and downstream read models

## Goal

Define the canonical simulator entities, event contracts, schema expectations, and persistence boundaries that downstream CTB work must reuse.

## Scope

This story covers:

* canonical simulator entities and their responsibilities
* simulator event families and shared metadata expectations
* schema ownership intent for future TypeScript and Zod contracts
* persistence boundaries between canonical simulator truth and downstream projections

This story does not cover:

* detailed accounting rules for fills, positions, or P&L recognition
* determinism or replay-processing policy details
* concrete database tables, indexes, or migration code
* reporting or notification implementation

## Requirements

### Functional requirements

1. CTB must identify the canonical simulator entities at a planning level.
2. CTB must define the shared simulator event contract boundary.
3. CTB must document schema ownership expectations for simulator records.
4. CTB must define what data belongs in canonical simulator persistence versus downstream derived views.
5. CTB must give follow-on stories one reusable simulator-domain baseline.

### Non-functional requirements

1. The domain model must stay simulator-first and broker-agnostic.
2. The boundary must support future shared TypeScript and Zod definitions.
3. Persistence ownership must keep reporting and notification downstream of simulator truth.
4. The artifact must stay planning-level and avoid locking CTB into premature storage mechanics.

## Success Criteria

The spec is successful when:

* follow-on stories can point to one canonical simulator model instead of inventing parallel records
* event and schema ownership are explicit enough to guide future package boundaries
* persistence boundaries are clear enough to protect canonical simulator truth from downstream drift

## Primary Artifact

Implementation-ready design note:

* `docs/architecture/ctb-simulator-domain-model-and-persistence-boundaries.md`
