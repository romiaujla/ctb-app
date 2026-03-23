# CTB-69 Spec

## Problem

CTB remains docs-first on `main`, so there is no executable workspace scaffold that developers can clone, install, and extend without inventing repository structure on the fly.

## Goal

Create the initial executable TypeScript monorepo scaffold with working workspace wiring for applications, shared package locations, infrastructure assets, docs, and scripts.

## Scope

This story covers:

* root workspace wiring for the monorepo
* executable TypeScript entrypoints for the initial app workspaces
* placeholder shared package locations that align to the approved monorepo structure
* repository updates needed to make a fresh install resolve workspaces without path fixes

This story does not cover:

* linting, formatting, and CI enforcement
* executable shared package implementations
* Docker runtime setup, Prisma, or Redis-backed behavior

## Requirements

1. The repo must expose one installable workspace root for `apps`, `packages`, `infra`, `docs`, and `scripts`.
2. The scaffold must create valid application workspaces for API, web, simulator worker, reporting worker, and notification worker.
3. Shared package locations must exist now so later issues can implement them without adding new top-level structure.
4. A fresh clone must be able to install dependencies and resolve workspace manifests from the repository root.

## Success Criteria

The spec is successful when:

* contributors can see and install the executable monorepo scaffold from the repository root
* every planned app workspace contains a valid package manifest and TypeScript entrypoint
* later stories can implement shared packages and runtime assets without reshaping the repository root

## Primary Artifacts

Executable scaffold assets:

* root `package.json`, `pnpm-workspace.yaml`, and TypeScript config
* initial `apps/*` workspace manifests and entrypoints
* placeholder `packages/*`, `infra`, and `scripts` locations
