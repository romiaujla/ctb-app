# CTB-36 Spec

## Problem

CTB does not yet have an explicit monorepo structure baseline, which leaves future planning work free to invent inconsistent top-level directories and unclear repository boundaries.

## Goal

Define the top-level TypeScript monorepo layout for CTB and document the planning-level responsibility of each major workspace category.

## Scope

This story covers:

* the top-level layout for `apps/`, `packages/`, `infra/`, `docs/`, and `scripts/`
* planning-level responsibility notes for each top-level workspace category
* alignment notes that connect the layout to the current simulator-first architecture direction
* handoff guidance for follow-on repository-foundation stories

This story does not cover:

* defining the shared tooling stack or CI command set
* naming or creating the concrete application and package workspaces
* implementing actual code, runtime services, or deployment infrastructure

## Requirements

1. CTB must define the top-level monorepo layout for apps, packages, infra, docs, and scripts.
2. CTB must document the intended responsibility of each top-level workspace category at a planning level.
3. CTB must show how the layout supports the current CTB architecture direction.
4. CTB must give downstream stories a stable repository baseline to reference instead of inventing new top-level patterns.
5. CTB must keep workspace-specific and tooling-specific design out of this story.

## Success Criteria

The spec is successful when:

* future stories can name the correct top-level location for their work without ambiguity
* the baseline makes repository boundaries visible before implementation begins
* the document clearly hands off shared tooling work to `CTB-37` and concrete workspace-target planning to `CTB-38`

## Primary Artifact

Implementation-ready architecture baseline:

* `docs/architecture/ctb-monorepo-structure.md`
