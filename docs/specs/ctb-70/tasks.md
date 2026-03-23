# CTB-70 Tasks

## Specify

- [x] Capture issue-scoped shared-tooling requirements and boundaries.
- [x] Identify the reusable root configs and CI assets required for the tooling baseline.

## Plan

- [x] Define the root validation command set for lint, format, typecheck, and tests.
- [x] Define package-manifest conventions for active workspaces.
- [x] Keep runtime and shared-package implementation concerns scoped out for later issues.

## Implement

- [x] Add repo-wide linting and formatting configuration.
- [x] Add root scripts for validation and a package-convention enforcement script.
- [x] Add a baseline GitHub Actions workflow that runs the shared validation suite.

## Validate

- [ ] Run the package-convention check from the repository root.
- [ ] Run lint, typecheck, tests, and formatting checks locally.
- [ ] Confirm PR metadata records the shared validation suite for the issue.
