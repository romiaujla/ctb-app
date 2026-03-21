# AI-Agent Prompt Help Registry

Use `--help` to discover the repository-supported AI-agent prompt patterns without scanning multiple files.

## Supported Prompt Patterns

| Prompt pattern | Behavior |
| --- | --- |
| `--help` | Show this help registry so engineers can discover the supported repository AI-agent prompts. |
| `--speckit CTB-<id>` | Start the full Spec Kit delivery path for the Jira issue: resolve the issue, run `git co main && git pull` before creating a new Jira-linked branch, then create or validate the Jira-linked branch and proceed through `/specify`, `/plan`, `/tasks`, implementation, and pull request creation. |
| `--implement CTB-<id>` | Start the implementation-only path for the Jira issue: resolve the issue, run `git co main && git pull` before creating a new Jira-linked branch, then create or validate the Jira-linked branch and skip `/specify`, `/plan`, and `/tasks` to proceed directly to implementation. |

## Registry Rules

* `--help` is the canonical discovery command for repository AI-agent prompts.
* Add new documented prompt patterns here instead of redefining the contract in multiple files.
* Workflow semantics remain governed by `AGENTS.md` and `docs/process/engineering-constitution.md`.
