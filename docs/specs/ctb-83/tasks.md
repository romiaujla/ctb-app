# CTB-83 Tasks

## Specify

- [x] Capture the operator-facing market-data visibility problem, goal, and success criteria.
- [x] Identify the API, web, and test artifacts required for the story.

## Plan

- [x] Define the health and history response surface for operator inspection.
- [x] Define how the current web scaffold should render healthy versus degraded market-data states.
- [x] Keep broader control-plane UI work out of scope.

## Implement

- [x] Add market-data health and history endpoints to `apps/api`.
- [x] Add a market-data operator summary model and render function to `apps/web`.
- [x] Add tests for the API and web visibility surfaces.

## Validate

- [x] Run `POSTGRES_URL='postgresql://ctb:ctb@localhost:5432/ctb_app' pnpm validate`.
