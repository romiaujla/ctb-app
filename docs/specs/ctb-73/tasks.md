# CTB-73 Tasks

## Specify

- [x] Capture issue-scoped Prisma and typed-config requirements.
- [x] Identify the baseline schema, migration, and runtime-loader artifacts required for local boot.

## Plan

- [x] Define the shared runtime env contract.
- [x] Define the initial Prisma model and migration boundary.
- [x] Keep Redis runtime-flow and integration-harness concerns scoped out for CTB-74.

## Implement

- [x] Add Prisma schema and tracked migration assets.
- [x] Add shared Zod-backed runtime config loading.
- [x] Update the API and simulator worker to consume the shared runtime config loader.

## Validate

- [ ] Run `pnpm install` after adding Prisma dependencies.
- [ ] Run `pnpm validate` with the shared config loader changes.
- [ ] Run `pnpm db:generate` and `pnpm db:validate`.
