# CTB-72 Tasks

## Specify

- [x] Capture issue-scoped local-runtime requirements and boundaries.
- [x] Identify the Docker assets and startup commands required for the baseline CTB stack.

## Plan

- [x] Define the local service graph for API, simulator worker, Postgres, and Redis.
- [x] Define the health and troubleshooting feedback required for local boot.
- [x] Keep Prisma and Redis runtime-flow concerns scoped out for later stories.

## Implement

- [x] Add Dockerfiles for the API and simulator-worker workspaces.
- [x] Add a Docker Compose stack for API, simulator worker, Postgres, and Redis.
- [x] Add root stack scripts and local boot documentation.

## Validate

- [ ] Run `pnpm validate` with the updated runtime assets.
- [ ] Run `docker compose -f infra/docker/compose.yml config`.
- [ ] Confirm the API health route and simulator-worker dependency wiring remain explicit in code and docs.
