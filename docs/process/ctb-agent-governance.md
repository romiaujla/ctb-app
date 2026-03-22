# CTB Agent Governance, Metrics, and Rollout Plan

## Purpose

This document defines the governance model, rollout sequencing, and measurement framework for the CTB 8-agent SDLC.

It builds on:

* `docs/process/engineering-constitution.md`
* `docs/process/ctb-jira-workflow.md`

## Governance Principles

CTB uses agents to accelerate delivery, not to replace ownership.

The governance model must ensure:

* humans retain approval authority over architecture, security, and release
* agent work is reviewable and auditable
* speed improvements are measured alongside defect and risk trends
* rollout happens in controlled phases rather than full adoption on day one
* the operating model improves through scheduled review instead of ad hoc reaction

## Decision Rights

### Human-owned decisions

The following decisions cannot be delegated to agents:

* business priority and roadmap sequencing
* architecture approval for cross-domain or high-risk changes
* approval of auth, tenancy, security, or sensitive data decisions
* release authorization for production-facing changes
* incident command and customer-impact tradeoffs
* acceptance of policy exceptions

### Agent-supported decisions

Agents may prepare drafts, analysis, or recommendations for:

* backlog decomposition
* UX flow definitions
* technical design drafts
* implementation drafts
* automated validation plans
* QA scenario definitions
* deployment checklists
* security findings

### Human override rule

At any point, a designated human lead may:

* reject agent output
* require rework
* narrow scope
* require a follow-up issue
* add approval gates or reviewers

Human override does not require agent consensus.

## Approval Gates

CTB enforces three approval gate classes.

### 1. Architecture gate

Required when a change affects:

* multiple domains
* external contracts
* shared packages
* simulator core boundaries
* reporting integrity
* notification architecture
* data models or event flows

Approval owner:

* human tech lead, architect, or designated senior reviewer

Minimum evidence:

* design note or ADR
* affected domains and interfaces
* rollout constraints
* identified risks

### 2. Security gate

Required when a change affects:

* secrets or credentials
* PII or owner contact data
* auth or authorization logic
* tenant isolation
* deployment configuration
* notification delivery credentials
* external market-data provider credentials

Approval owner:

* human security reviewer or designated engineering lead with security responsibility

Minimum evidence:

* security findings
* remediation status
* residual risks
* escalation note for unresolved high-risk findings

### 3. Release gate

Required before marking a release-ready issue as complete.

Approval owner:

* human release owner

Minimum evidence:

* implementation summary
* automated validation status
* QA status
* security status if applicable
* deployment and rollback plan
* monitoring expectations

## Responsibility Model

### Responsible roles

Each stage has a primary operator responsible for producing the next artifact set.

### Accountable roles

Each critical gate has a named human accountable for the decision.

### Consulted roles

Specialist reviewers are consulted when the change affects their domain.

### Informed roles

Stakeholders are informed through Jira status, linked artifacts, and release notes.

## Escalation Rules

Escalation is required when:

* scope grows beyond the current Jira issue
* a change cannot satisfy the required evidence for its risk tier
* design intent conflicts with implementation constraints
* testability is materially insufficient
* a security finding is unresolved
* rollback is not credible
* metrics indicate the process is increasing rework or defects

Escalation outcomes:

* clarify the current issue
* split into a follow-up issue
* create an ADR
* add an approval gate
* pause release

## Metrics Framework

CTB should measure both speed and safety.

### Delivery speed metrics

Track:

* lead time from `In Progress` to merge
* lead time from merge to release
* review turnaround time
* deployment frequency
* issue aging in each Jira state

### Quality and safety metrics

Track:

* escaped defect rate
* change failure rate
* rework rate on agent-produced artifacts
* flaky validation rate
* rollback frequency
* mean time to restore service

### Agent operating metrics

Track:

* handoff acceptance rate by stage
* number of issues requiring stage rework
* percentage of issues with complete evidence at each gate
* number of scope-drift incidents
* number of policy-exception requests

### CTB-specific metrics

Track:

* simulator run failures
* report-generation failures
* notification-delivery failures
* incidents tied to secrets, PII, auth, or tenant safety
* percentage of market-data or reporting issues detected before release

## Scorecard Cadence

### Weekly

Review:

* in-flight delivery bottlenecks
* blocked issues
* review queue delays
* major validation failures

### Biweekly

Review:

* rollout progress by phase
* rework trends
* handoff quality
* open governance or policy gaps

### Monthly

Review:

* lead time trends
* escaped defects
* change failure rate
* security or process exceptions
* areas where prompts or templates need improvement

### Quarterly

Review:

* whether the 8-agent model still fits current CTB scale
* whether governance rules need tightening or simplification
* whether additional automation should be promoted to standard workflow

## Rollout Plan

CTB should adopt the agent model in four phases.

### Phase 1: workflow foundation

Primary issues:

* `CTB-2`
* `CTB-11`

Goals:

* establish repository contracts
* standardize Jira workflow and evidence expectations
* define governance and metrics

Exit criteria:

* repo-local process docs exist
* branch and commit rules are working
* Jira workflow expectations are documented
* scorecard and cadence are defined

### Phase 2: product and platform foundations

Primary issues:

* `CTB-13`
* `CTB-36`
* `CTB-15`
* `CTB-16`
* `CTB-37`
* `CTB-18`
* `CTB-19`

Goals:

* define simulator-first architecture
* define monorepo structure
* define reporting and notification workflows
* establish CI/CD and policy guardrails
* define observability expectations

Exit criteria:

* architecture boundaries are explicit
* protected paths and validation baseline are defined
* daily reporting and notification designs are implementation-ready

### Phase 3: agent workflow enablement

Primary issues:

* `CTB-3`
* `CTB-4`
* `CTB-5`
* `CTB-6`
* `CTB-7`
* `CTB-8`
* `CTB-9`
* `CTB-10`

Goals:

* operationalize each agent role with templates and expectations
* make handoffs executable in day-to-day delivery
* enforce stage-level evidence and approvals

Exit criteria:

* each agent role has usable operating guidance
* at least one end-to-end change has run through the full workflow
* review and release gates are actually used

### Phase 4: optimization and enforcement

Goals:

* tighten automation around the best-performing workflow paths
* reduce handoff friction
* convert recurring review findings into policy or tooling
* measure return on the agent operating model

Exit criteria:

* recurring issues are captured in templates or automation
* metrics show stable or improving speed and safety
* governance exceptions are rare and explicit

## Review Cadence and Owners

| Cadence | Owner | Focus |
| --- | --- | --- |
| Weekly delivery review | engineering lead | blockers, handoff failures, validation delays |
| Biweekly operating review | engineering lead + senior reviewers | rollout progress, rework, policy gaps |
| Monthly governance review | engineering lead + security/release owners | scorecard trends, exceptions, incident learnings |
| Quarterly model review | engineering leadership | structure, scale, and adoption strategy |

## Definition of Success

The CTB agent operating model is succeeding when:

* cycle time decreases without an increase in escaped defects
* handoff artifacts are consistently complete
* reviewers spend more time on real risk and less time on missing context
* security and release decisions stay explicitly human-owned
* prompt and template quality improves over time
