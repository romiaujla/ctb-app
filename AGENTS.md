# AGENTS.md

## Mandatory Policy

All AI agents working in this repository must follow:

* `docs/process/engineering-constitution.md`
* `docs/process/ui-guidlines.md`

This is mandatory for code changes, branch naming, commits, Jira issue updates, pull requests, and release-related work.

## Required Workflow

* Use Jira-linked branches and commits per constitution.
* Keep Jira issue descriptions aligned with the Lean Jira template.
* Use tagged workflow commands to select delivery mode:
  * `--help` for prompt discovery and supported command lookup
  * `--speckit CTB-<id>` for full Spec Kit delivery
  * `--implement CTB-<id>` for implementation-only delivery
* Keep the prompt help registry in `docs/process/ai-agent-prompt-help.md` aligned with any documented prompt behavior changes.

## Prompt-Driven Start Workflow

When a user prompt is in the form `--speckit CTB-<id>` or `--implement CTB-<id>`:

1. Resolve the Jira issue first and use that issue as the only delivery scope unless the user explicitly broadens it.
2. Use `docs/process/engineering-constitution.md` as the governing policy for branch naming, commits, pull requests, and release-safe metadata.
3. Create or validate the Jira-linked branch that matches the issue type before editing files.
4. When a Jira-linked branch is created for the issue, transition that issue to `In Progress`.
5. If the prompt is `--implement CTB-<id>`, skip `/specify`, `/plan`, and `/tasks` and proceed directly to implementation.
6. If the prompt is `--speckit CTB-<id>`, begin with `/specify`, then continue in this order only: `/plan`, `/tasks`, implementation, and pull request creation.
7. Pause for user clarification instead of auto-advancing when scope, requirements, repository state, validation evidence, or Jira-to-branch alignment are ambiguous or blocked.
8. Create the final pull request only after implementation is complete, committed, and pushed, and include Jira linkage, scope, and validation notes in the PR description.
9. When a Jira-linked pull request is created for the issue, transition that issue to `In Review`.

When a user prompt is `--help`:

1. Use `docs/process/ai-agent-prompt-help.md` as the source-of-truth registry for supported repository AI-agent prompt patterns.
2. Return the documented prompt patterns with concise behavior descriptions.
3. Keep the response limited to prompts that are actually documented in the repository.

## Operational Rules

* Do not bypass repository hooks, CI checks, or branch protection requirements.
* Do not widen PR scope beyond the Jira issue(s) named in the branch or PR.
* Prefer additive, reviewable commits and explicit rationale for policy exceptions.

## Precedence

Order of precedence for repository rules:

1. `docs/process/engineering-constitution.md`
2. `AGENTS.md`
3. future workflow-specific process docs
4. CI and hook automation rules
