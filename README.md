# CTB App

This repository holds the implementation and operating artifacts for Crown Trade Bot (CTB).

Current repository priorities:

- establish the CTB agent operating framework
- define the Jira workflow, handoff artifacts, and release evidence model
- prepare the repository for simulator-first product implementation
- stand up the executable Milestone 1 monorepo scaffold

Executable repository scaffold:

- `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `apps/api`
- `apps/web`
- `apps/simulator-worker`
- `apps/reporting-worker`
- `apps/notification-worker`
- `packages/types`
- `packages/schemas`
- `packages/config`
- `packages/test-utils`
- `infra`
- `scripts`

Shared validation commands:

- `pnpm package:conventions`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:integration`
- `pnpm format:check`
- `pnpm validate`

Local Docker runtime:

- `pnpm dev:stack:up` builds and starts the API, simulator worker, Postgres, and Redis stack.
- `pnpm dev:stack:logs` tails the stack logs for troubleshooting local boot issues.
- `pnpm dev:stack:down` stops the stack and removes the local Postgres volume.
- the API health route is available at `http://localhost:3010/health` once the stack is healthy.

Database and config baseline:

- copy `.env.example` to `.env` or export the same variables before local startup.
- `pnpm db:generate` generates the Prisma client from `prisma/schema.prisma`.
- `pnpm db:migrate:deploy` applies the tracked local migration baseline.
- `pnpm db:prepare` runs generation plus migration deployment for a fresh clone.

Bootstrap and seed workflow:

- `pnpm bootstrap:local` installs dependencies, generates Prisma client code, and runs baseline tests for a fresh clone.
- `pnpm bootstrap:local -- --with-integration` also runs the containerized integration harness when Docker is available.
- `pnpm seed:runtime-heartbeat` writes a baseline `RuntimeHeartbeat` record using the active `POSTGRES_URL`.
- `pnpm test:integration` provisions ephemeral Postgres and Redis containers to validate the API runtime and simulator-worker Redis dedupe flow.

Core repository contracts:

- [`AGENTS.md`](AGENTS.md)
- [`docs/process/engineering-constitution.md`](docs/process/engineering-constitution.md)
- [`docs/process/ctb-jira-workflow.md`](docs/process/ctb-jira-workflow.md)
- [`docs/process/ctb-agent-governance.md`](docs/process/ctb-agent-governance.md)
- [`docs/process/ctb-ba-po-agent-workflow.md`](docs/process/ctb-ba-po-agent-workflow.md)
- [`docs/process/ctb-ui-ux-agent-workflow.md`](docs/process/ctb-ui-ux-agent-workflow.md)
- [`docs/process/ctb-operator-ui-information-architecture.md`](docs/process/ctb-operator-ui-information-architecture.md)
- [`docs/process/ctb-solution-architect-agent-workflow.md`](docs/process/ctb-solution-architect-agent-workflow.md)
- [`docs/process/ctb-senior-software-engineer-agent-workflow.md`](docs/process/ctb-senior-software-engineer-agent-workflow.md)
- [`docs/process/ctb-test-automation-engineer-agent-workflow.md`](docs/process/ctb-test-automation-engineer-agent-workflow.md)
- [`docs/process/ctb-qa-agent-workflow.md`](docs/process/ctb-qa-agent-workflow.md)
- [`docs/process/ctb-devops-platform-sre-agent-workflow.md`](docs/process/ctb-devops-platform-sre-agent-workflow.md)
- [`docs/process/ctb-observability-dashboards-and-alerts.md`](docs/process/ctb-observability-dashboards-and-alerts.md)
- [`docs/process/ctb-observability-model.md`](docs/process/ctb-observability-model.md)
- [`docs/process/ctb-telemetry-baseline.md`](docs/process/ctb-telemetry-baseline.md)
- [`docs/process/ctb-profitability-review-and-strategy-switch-policy.md`](docs/process/ctb-profitability-review-and-strategy-switch-policy.md)
- [`docs/process/ctb-operational-ownership-and-runbooks.md`](docs/process/ctb-operational-ownership-and-runbooks.md)
- [`docs/process/ctb-security-agent-workflow.md`](docs/process/ctb-security-agent-workflow.md)
- [`docs/process/ctb-security-baseline.md`](docs/process/ctb-security-baseline.md)
- [`docs/process/ctb-cicd-validation-baseline.md`](docs/process/ctb-cicd-validation-baseline.md)
- [`docs/process/ctb-validation-matrix.md`](docs/process/ctb-validation-matrix.md)
- [`docs/process/ctb-release-readiness-gates.md`](docs/process/ctb-release-readiness-gates.md)
- [`docs/process/ctb-promotion-readiness-gates.md`](docs/process/ctb-promotion-readiness-gates.md)
- [`docs/process/ctb-promotion-governance-and-adr-workflow.md`](docs/process/ctb-promotion-governance-and-adr-workflow.md)
- [`docs/process/ctb-promotion-checklist-and-evidence-package.md`](docs/process/ctb-promotion-checklist-and-evidence-package.md)
- [`docs/process/ctb-ai-usage-and-adr-governance.md`](docs/process/ctb-ai-usage-and-adr-governance.md)
- [`docs/architecture/ctb-simulator-architecture.md`](docs/architecture/ctb-simulator-architecture.md)
- [`docs/architecture/ctb-v1-product-boundary.md`](docs/architecture/ctb-v1-product-boundary.md)
- [`docs/architecture/ctb-v1-strategy-hypothesis.md`](docs/architecture/ctb-v1-strategy-hypothesis.md)
- [`docs/architecture/ctb-operator-api-surface.md`](docs/architecture/ctb-operator-api-surface.md)
- [`docs/architecture/ctb-control-plane-integration.md`](docs/architecture/ctb-control-plane-integration.md)
- [`docs/architecture/ctb-simulator-domain-model-and-persistence-boundaries.md`](docs/architecture/ctb-simulator-domain-model-and-persistence-boundaries.md)
- [`docs/architecture/ctb-simulator-accounting-and-event-history-model.md`](docs/architecture/ctb-simulator-accounting-and-event-history-model.md)
- [`docs/architecture/ctb-simulator-determinism-replay-and-correctness-policy.md`](docs/architecture/ctb-simulator-determinism-replay-and-correctness-policy.md)
- [`docs/architecture/ctb-market-data-event-contract.md`](docs/architecture/ctb-market-data-event-contract.md)
- [`docs/architecture/ctb-market-data-freshness-and-failure-visibility.md`](docs/architecture/ctb-market-data-freshness-and-failure-visibility.md)
- [`docs/architecture/ctb-market-data-ingestion-replay-workflow.md`](docs/architecture/ctb-market-data-ingestion-replay-workflow.md)
- [`docs/architecture/ctb-strategy-input-contract.md`](docs/architecture/ctb-strategy-input-contract.md)
- [`docs/architecture/ctb-strategy-rule-engine-and-versioning.md`](docs/architecture/ctb-strategy-rule-engine-and-versioning.md)
- [`docs/architecture/ctb-strategy-output-and-explainability.md`](docs/architecture/ctb-strategy-output-and-explainability.md)
- [`docs/architecture/ctb-daily-reporting-and-github-pages.md`](docs/architecture/ctb-daily-reporting-and-github-pages.md)
- [`docs/architecture/ctb-local-data-and-config-foundation.md`](docs/architecture/ctb-local-data-and-config-foundation.md)
- [`docs/architecture/ctb-local-notification-agent.md`](docs/architecture/ctb-local-notification-agent.md)
- [`docs/architecture/ctb-local-development-runtime-stack.md`](docs/architecture/ctb-local-development-runtime-stack.md)
- [`docs/architecture/ctb-monorepo-structure.md`](docs/architecture/ctb-monorepo-structure.md)
- [`docs/architecture/ctb-runtime-state-and-integration-test-policy.md`](docs/architecture/ctb-runtime-state-and-integration-test-policy.md)

Reusable delivery artifacts live under [`docs/templates`](docs/templates).
