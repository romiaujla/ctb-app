import http from 'node:http';
import { URL } from 'node:url';

import { createLocalDependencyConfig, loadRuntimeConfig } from '@ctb/config';
import {
  PrismaMarketDataRepository,
  type MarketDataRepository,
} from '@ctb/market-data';
import {
  controlPlaneWorkflowStatusSchema,
  notificationAvailabilitySummarySchema,
  operatorOverviewSchema,
  reportAvailabilitySummarySchema,
  serviceRuntimeDescriptorSchema,
  simulatorOperatorSummarySchema,
  strategyActiveSummarySchema,
  strategyReviewSummarySchema,
} from '@ctb/schemas';
import {
  PrismaSimulatorAccountingRepository,
  PrismaStrategyEvaluationRepository,
  runStrategyEvaluation,
} from '@ctb/simulator-core';
import type {
  ControlPlaneWorkflowStatus,
  NotificationAvailabilitySummary,
  OperatorOverview,
  OperatorSectionStatus,
  OperatorStatusLevel,
  ReportAvailabilitySummary,
  ServiceRuntimeDescriptor,
  SimulatorAccountingRepository,
  SimulatorOperatorSummary,
  StrategyActiveSummary,
  StrategyEvaluationRecord,
  StrategyEvaluationRepository,
  StrategyReviewSummary,
} from '@ctb/types';
import { PrismaClient } from '@prisma/client';

interface ApiControlPlaneState {
  dependencies: ServiceRuntimeDescriptor['dependencies'];
  marketData: ReturnType<typeof summarizeMarketDataHealth>;
  overview: OperatorOverview;
  reports: ReportAvailabilitySummary;
  notifications: NotificationAvailabilitySummary;
  simulator: SimulatorOperatorSummary;
  strategyActive: StrategyActiveSummary;
  strategyReview: StrategyReviewSummary;
  workflows: ControlPlaneWorkflowStatus[];
}

function json(
  response: http.ServerResponse,
  statusCode: number,
  payload: unknown,
) {
  response.writeHead(statusCode, { 'content-type': 'application/json' });
  response.end(JSON.stringify(payload));
}

function html(response: http.ServerResponse, statusCode: number, body: string) {
  response.writeHead(statusCode, {
    'content-type': 'text/html; charset=utf-8',
  });
  response.end(body);
}

function nowIsoTimestamp(): string {
  return new Date().toISOString();
}

function rankOperatorStatus(status: OperatorStatusLevel): number {
  switch (status) {
    case 'healthy':
      return 0;
    case 'empty':
      return 1;
    case 'warning':
      return 2;
    case 'degraded':
      return 3;
    case 'unavailable':
      return 4;
  }
}

function combineOperatorStatus(
  statuses: OperatorStatusLevel[],
): OperatorStatusLevel {
  return statuses.reduce<OperatorStatusLevel>(
    (current, candidate) =>
      rankOperatorStatus(candidate) > rankOperatorStatus(current)
        ? candidate
        : current,
    'healthy',
  );
}

function summarizeMarketDataHealth({
  recentDecisions,
  recentEvents,
  recentRuns,
}: {
  recentRuns: Awaited<ReturnType<MarketDataRepository['getRecentIngestRuns']>>;
  recentDecisions: Awaited<
    ReturnType<MarketDataRepository['getRecentIngestDecisions']>
  >;
  recentEvents: Awaited<
    ReturnType<MarketDataRepository['getCanonicalEventHistory']>
  >;
}) {
  const latestRun = recentRuns[0] ?? null;
  const duplicateCount = recentDecisions.filter(
    (decision) => decision.decisionType === 'duplicate',
  ).length;
  const rejectedCount = recentDecisions.filter(
    (decision) => decision.decisionType === 'rejected',
  ).length;
  const latestEvent = recentEvents.at(-1) ?? null;

  return {
    overallStatus: !latestRun
      ? 'unavailable'
      : latestRun.status === 'succeeded' && rejectedCount === 0
        ? 'healthy'
        : 'degraded',
    latestRun,
    latestEvent,
    duplicateCount,
    rejectedCount,
    recentDecisions,
    recentEvents,
  } as const;
}

async function loadMarketDataHealth(
  repository?: MarketDataRepository,
): Promise<ReturnType<typeof summarizeMarketDataHealth>> {
  if (!repository) {
    return summarizeMarketDataHealth({
      recentRuns: [],
      recentDecisions: [],
      recentEvents: [],
    });
  }

  const [recentRuns, recentDecisions, recentEvents] = await Promise.all([
    repository.getRecentIngestRuns(5),
    repository.getRecentIngestDecisions(10),
    repository.getCanonicalEventHistory({ limit: 10 }),
  ]);

  return summarizeMarketDataHealth({
    recentRuns,
    recentDecisions,
    recentEvents,
  });
}

function deriveStatusTimestamp(
  timestamps: Array<string | null | undefined>,
): string | null {
  const ordered = timestamps.filter((value): value is string => Boolean(value));
  return ordered.sort().at(-1) ?? null;
}

function buildReportsSummary(): ReportAvailabilitySummary {
  return reportAvailabilitySummarySchema.parse({
    status: 'unavailable',
    latestReportDate: null,
    latestReportUrl: null,
    historyUrl: '/reports',
    summary:
      'Validated daily reports are not yet exposed through the runtime control plane.',
    updatedAt: null,
  });
}

function buildNotificationsSummary(): NotificationAvailabilitySummary {
  return notificationAvailabilitySummarySchema.parse({
    status: 'unavailable',
    unresolvedCount: 0,
    summary:
      'Notification delivery health is not yet exposed through the runtime control plane.',
    updatedAt: null,
  });
}

function buildStrategyActiveSummary(
  evaluations: StrategyEvaluationRecord[],
): StrategyActiveSummary {
  const latestEvaluation = evaluations[0] ?? null;

  return strategyActiveSummarySchema.parse({
    status: latestEvaluation ? 'healthy' : 'empty',
    strategyId: latestEvaluation?.input.strategyId ?? null,
    strategyVersion: latestEvaluation?.input.strategyVersion ?? null,
    latestDecisionState: latestEvaluation?.evidence.decisionState ?? null,
    latestDecisionReason:
      latestEvaluation?.evidence.decisionReason ??
      'No strategy evaluation evidence has been emitted yet.',
    updatedAt: latestEvaluation?.input.evaluationTimestamp ?? null,
  });
}

function buildStrategyReviewSummary(
  evaluations: StrategyEvaluationRecord[],
): StrategyReviewSummary {
  const blockedCount = evaluations.filter(
    (evaluation) => evaluation.evidence.decisionState === 'blocked',
  ).length;
  const invalidCount = evaluations.filter(
    (evaluation) => evaluation.evidence.decisionState === 'invalid-input',
  ).length;
  const emittedCount = evaluations.filter(
    (evaluation) =>
      evaluation.evidence.decisionState === 'trade-intent-emitted',
  ).length;
  const skippedCount = evaluations.filter(
    (evaluation) => evaluation.evidence.decisionState === 'skipped',
  ).length;

  return strategyReviewSummarySchema.parse({
    status:
      evaluations.length === 0
        ? 'empty'
        : blockedCount > 0 || invalidCount > 0
          ? 'warning'
          : 'healthy',
    reviewWindowSize: evaluations.length,
    emittedCount,
    skippedCount,
    blockedCount,
    invalidCount,
    recentReasons: evaluations
      .slice(0, 5)
      .map((evaluation) => evaluation.evidence.decisionReason),
    updatedAt: evaluations[0]?.input.evaluationTimestamp ?? null,
  });
}

async function buildSimulatorSummary(input: {
  requestedAccountId?: string;
  repository?: SimulatorAccountingRepository;
  strategyEvaluations: StrategyEvaluationRecord[];
}): Promise<SimulatorOperatorSummary> {
  const simulationAccountId =
    input.requestedAccountId ??
    input.strategyEvaluations[0]?.input.portfolioContext.simulationAccountId ??
    null;

  if (!input.repository) {
    return simulatorOperatorSummarySchema.parse({
      status: 'unavailable',
      simulationAccountId,
      accountStatus: null,
      netLiquidationValue: null,
      openPositionCount: 0,
      openOrderCount: 0,
      recentFillCount: 0,
      summary: 'Simulator accounting state is not yet available to the API.',
      updatedAt: null,
    });
  }

  if (!simulationAccountId) {
    return simulatorOperatorSummarySchema.parse({
      status: 'empty',
      simulationAccountId: null,
      accountStatus: null,
      netLiquidationValue: null,
      openPositionCount: 0,
      openOrderCount: 0,
      recentFillCount: 0,
      summary:
        'No simulation account could be inferred yet from current strategy evidence.',
      updatedAt: null,
    });
  }

  const view =
    await input.repository.getCurrentPortfolioView(simulationAccountId);

  if (!view) {
    return simulatorOperatorSummarySchema.parse({
      status: 'empty',
      simulationAccountId,
      accountStatus: null,
      netLiquidationValue: null,
      openPositionCount: 0,
      openOrderCount: 0,
      recentFillCount: 0,
      summary:
        'No simulator portfolio view is available yet for the requested account.',
      updatedAt: null,
    });
  }

  const summaryStatus =
    view.simulationAccount.status === 'active' ? 'healthy' : 'warning';

  return simulatorOperatorSummarySchema.parse({
    status: summaryStatus,
    simulationAccountId: view.simulationAccount.simulationAccountId,
    accountStatus: view.simulationAccount.status,
    netLiquidationValue: view.portfolio?.netLiquidationValue ?? null,
    openPositionCount: view.positions.length,
    openOrderCount: view.openOrders.length,
    recentFillCount: view.recentFills.length,
    summary:
      view.portfolio === null
        ? 'Simulator account exists, but no portfolio snapshot has been persisted yet.'
        : `Simulator portfolio is ${view.simulationAccount.status} with ${view.positions.length} open positions.`,
    updatedAt:
      view.portfolio?.valuationTimestamp ??
      view.positions[0]?.lastUpdatedTimestamp ??
      view.simulationAccount.createdTimestamp,
  });
}

function buildOverview(input: {
  marketData: ReturnType<typeof summarizeMarketDataHealth>;
  simulator: SimulatorOperatorSummary;
  strategyActive: StrategyActiveSummary;
  strategyReview: StrategyReviewSummary;
  reports: ReportAvailabilitySummary;
  notifications: NotificationAvailabilitySummary;
}): OperatorOverview {
  const sections: OperatorSectionStatus[] = [
    {
      key: 'market-data',
      label: 'Market Data',
      status: input.marketData.overallStatus,
      summary: input.marketData.latestRun
        ? `Latest ingest run ${input.marketData.latestRun.ingestRunId} is ${input.marketData.latestRun.status}.`
        : 'No market-data ingest evidence is available yet.',
      detailPath: '/api/v1/status/market-data',
      updatedAt: deriveStatusTimestamp([
        input.marketData.latestRun?.completedAt,
        input.marketData.latestEvent?.normalizedTimestamp,
      ]),
    },
    {
      key: 'simulator',
      label: 'Simulator',
      status: input.simulator.status,
      summary: input.simulator.summary,
      detailPath: '/api/v1/simulator/summary',
      updatedAt: input.simulator.updatedAt,
    },
    {
      key: 'strategy',
      label: 'Strategy',
      status: combineOperatorStatus([
        input.strategyActive.status,
        input.strategyReview.status,
      ]),
      summary: input.strategyActive.latestDecisionReason,
      detailPath: '/api/v1/strategy/review',
      updatedAt: input.strategyActive.updatedAt,
    },
    {
      key: 'reports',
      label: 'Reports',
      status: input.reports.status,
      summary: input.reports.summary,
      detailPath: '/api/v1/reports/latest',
      updatedAt: input.reports.updatedAt,
    },
    {
      key: 'notifications',
      label: 'Notifications',
      status: input.notifications.status,
      summary: input.notifications.summary,
      detailPath: '/api/v1/notifications',
      updatedAt: input.notifications.updatedAt,
    },
  ];

  return operatorOverviewSchema.parse({
    overallStatus: combineOperatorStatus(
      sections.map((section) => section.status),
    ),
    generatedAt: nowIsoTimestamp(),
    docsUrl: '/docs',
    sections,
  });
}

function buildWorkflowStatuses(input: {
  marketData: ReturnType<typeof summarizeMarketDataHealth>;
  simulator: SimulatorOperatorSummary;
  strategyReview: StrategyReviewSummary;
  reports: ReportAvailabilitySummary;
  notifications: NotificationAvailabilitySummary;
}): ControlPlaneWorkflowStatus[] {
  return [
    controlPlaneWorkflowStatusSchema.parse({
      key: 'market-data',
      label: 'Market Data',
      status: input.marketData.overallStatus,
      summary: input.marketData.latestRun
        ? `Ingest run ${input.marketData.latestRun.ingestRunId} is ${input.marketData.latestRun.status}.`
        : 'No market-data ingest run is available yet.',
      updatedAt: deriveStatusTimestamp([
        input.marketData.latestRun?.completedAt,
        input.marketData.latestEvent?.normalizedTimestamp,
      ]),
    }),
    controlPlaneWorkflowStatusSchema.parse({
      key: 'simulator',
      label: 'Simulator',
      status: input.simulator.status,
      summary: input.simulator.summary,
      updatedAt: input.simulator.updatedAt,
    }),
    controlPlaneWorkflowStatusSchema.parse({
      key: 'strategy',
      label: 'Strategy',
      status: input.strategyReview.status,
      summary:
        input.strategyReview.reviewWindowSize === 0
          ? 'No strategy review evidence is available yet.'
          : `${input.strategyReview.reviewWindowSize} recent strategy evaluations are available.`,
      updatedAt: input.strategyReview.updatedAt,
    }),
    controlPlaneWorkflowStatusSchema.parse({
      key: 'reports',
      label: 'Reports',
      status: input.reports.status,
      summary: input.reports.summary,
      updatedAt: input.reports.updatedAt,
    }),
    controlPlaneWorkflowStatusSchema.parse({
      key: 'notifications',
      label: 'Notifications',
      status: input.notifications.status,
      summary: input.notifications.summary,
      updatedAt: input.notifications.updatedAt,
    }),
  ];
}

async function buildControlPlaneState(
  requestUrl: URL,
  options: {
    descriptor: ServiceRuntimeDescriptor;
    marketDataRepository?: MarketDataRepository;
    simulatorAccountingRepository?: SimulatorAccountingRepository;
    strategyEvaluationRepository?: StrategyEvaluationRepository;
  },
): Promise<ApiControlPlaneState> {
  const marketData = await loadMarketDataHealth(options.marketDataRepository);
  const strategyEvaluations = options.strategyEvaluationRepository
    ? await options.strategyEvaluationRepository.getRecentEvaluations({
        limit: 10,
      })
    : [];
  const strategyActive = buildStrategyActiveSummary(strategyEvaluations);
  const strategyReview = buildStrategyReviewSummary(strategyEvaluations);
  const simulator = await buildSimulatorSummary({
    requestedAccountId:
      requestUrl.searchParams.get('simulationAccountId') ?? undefined,
    repository: options.simulatorAccountingRepository,
    strategyEvaluations,
  });
  const reports = buildReportsSummary();
  const notifications = buildNotificationsSummary();
  const overview = buildOverview({
    marketData,
    simulator,
    strategyActive,
    strategyReview,
    reports,
    notifications,
  });
  const workflows = buildWorkflowStatuses({
    marketData,
    simulator,
    strategyReview,
    reports,
    notifications,
  });

  return {
    dependencies: options.descriptor.dependencies,
    marketData,
    overview,
    reports,
    notifications,
    simulator,
    strategyActive,
    strategyReview,
    workflows,
  };
}

function buildOpenApiDocument(): Record<string, unknown> {
  const statusEnum = ['healthy', 'warning', 'degraded', 'empty', 'unavailable'];

  return {
    openapi: '3.1.0',
    info: {
      title: 'CTB Control Plane API',
      version: 'v1',
      description:
        'Supported operator-facing control-plane runtime for CTB, including overview reads and contract exploration.',
    },
    paths: {
      '/api/v1/status': {
        get: {
          summary: 'Get the operator overview surface.',
          responses: {
            '200': {
              description: 'Overview of the control-plane runtime.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/OperatorOverview' },
                },
              },
            },
          },
        },
      },
      '/api/v1/status/dependencies': {
        get: {
          summary:
            'Get runtime dependency configuration for the API workspace.',
          responses: {
            '200': {
              description: 'Runtime dependency descriptors.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      dependencies: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/DependencyDescriptor',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/status/workflows': {
        get: {
          summary: 'Get workflow health summaries for control-plane domains.',
          responses: {
            '200': {
              description: 'Workflow status summaries.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      workflows: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/ControlPlaneWorkflowStatus',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/status/market-data': {
        get: {
          summary: 'Get market-data ingest health for operators.',
          responses: {
            '200': {
              description: 'Market-data runtime health.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      overallStatus: { type: 'string', enum: statusEnum },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/simulator/summary': {
        get: {
          summary: 'Get the current simulator portfolio summary.',
          responses: {
            '200': {
              description: 'Simulator portfolio summary.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/SimulatorOperatorSummary',
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/strategy/active': {
        get: {
          summary: 'Get the currently active strategy summary.',
          responses: {
            '200': {
              description: 'Active strategy summary.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/StrategyActiveSummary',
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/strategy/review': {
        get: {
          summary: 'Get recent strategy review metrics.',
          responses: {
            '200': {
              description: 'Strategy review summary.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/StrategyReviewSummary',
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/strategy/evaluations': {
        get: {
          summary: 'Get recent strategy evaluations.',
          responses: {
            '200': {
              description: 'Recent strategy evaluation records.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      evaluations: {
                        type: 'array',
                        items: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/strategy/evaluate': {
        get: {
          summary: 'Run an on-demand strategy evaluation.',
          responses: {
            '200': {
              description: 'On-demand strategy evaluation result.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      evaluation: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/reports': {
        get: {
          summary: 'Get report availability for the operator control plane.',
          responses: {
            '200': {
              description: 'Report availability summary.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ReportAvailabilitySummary',
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/reports/latest': {
        get: {
          summary: 'Get the latest report availability summary.',
          responses: {
            '200': {
              description: 'Latest report summary.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ReportAvailabilitySummary',
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/notifications': {
        get: {
          summary: 'Get notification runtime availability for operators.',
          responses: {
            '200': {
              description: 'Notification availability summary.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/NotificationAvailabilitySummary',
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/openapi.json': {
        get: {
          summary: 'Get the OpenAPI document for the control-plane runtime.',
          responses: {
            '200': {
              description: 'OpenAPI document.',
            },
          },
        },
      },
      '/docs': {
        get: {
          summary:
            'Inspect the supported control-plane contract in the browser.',
          responses: {
            '200': {
              description: 'HTML documentation surface.',
            },
          },
        },
      },
    },
    components: {
      schemas: {
        DependencyDescriptor: {
          type: 'object',
          properties: {
            name: { type: 'string', enum: ['postgres', 'redis'] },
            url: { type: 'string', format: 'uri' },
            state: { type: 'string', enum: ['configured', 'placeholder'] },
          },
          required: ['name', 'url', 'state'],
        },
        OperatorSectionStatus: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            label: { type: 'string' },
            status: { type: 'string', enum: statusEnum },
            summary: { type: 'string' },
            detailPath: { type: ['string', 'null'] },
            updatedAt: { type: ['string', 'null'], format: 'date-time' },
          },
          required: [
            'key',
            'label',
            'status',
            'summary',
            'detailPath',
            'updatedAt',
          ],
        },
        OperatorOverview: {
          type: 'object',
          properties: {
            overallStatus: { type: 'string', enum: statusEnum },
            generatedAt: { type: 'string', format: 'date-time' },
            docsUrl: { type: 'string' },
            sections: {
              type: 'array',
              items: { $ref: '#/components/schemas/OperatorSectionStatus' },
            },
          },
          required: ['overallStatus', 'generatedAt', 'docsUrl', 'sections'],
        },
        ControlPlaneWorkflowStatus: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            label: { type: 'string' },
            status: { type: 'string', enum: statusEnum },
            summary: { type: 'string' },
            updatedAt: { type: ['string', 'null'], format: 'date-time' },
          },
          required: ['key', 'label', 'status', 'summary', 'updatedAt'],
        },
        SimulatorOperatorSummary: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: statusEnum },
            simulationAccountId: { type: ['string', 'null'] },
            accountStatus: { type: ['string', 'null'] },
            netLiquidationValue: { type: ['string', 'null'] },
            openPositionCount: { type: 'integer' },
            openOrderCount: { type: 'integer' },
            recentFillCount: { type: 'integer' },
            summary: { type: 'string' },
            updatedAt: { type: ['string', 'null'], format: 'date-time' },
          },
          required: [
            'status',
            'simulationAccountId',
            'accountStatus',
            'netLiquidationValue',
            'openPositionCount',
            'openOrderCount',
            'recentFillCount',
            'summary',
            'updatedAt',
          ],
        },
        StrategyActiveSummary: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: statusEnum },
            strategyId: { type: ['string', 'null'] },
            strategyVersion: { type: ['string', 'null'] },
            latestDecisionState: { type: ['string', 'null'] },
            latestDecisionReason: { type: 'string' },
            updatedAt: { type: ['string', 'null'], format: 'date-time' },
          },
          required: [
            'status',
            'strategyId',
            'strategyVersion',
            'latestDecisionState',
            'latestDecisionReason',
            'updatedAt',
          ],
        },
        StrategyReviewSummary: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: statusEnum },
            reviewWindowSize: { type: 'integer' },
            emittedCount: { type: 'integer' },
            skippedCount: { type: 'integer' },
            blockedCount: { type: 'integer' },
            invalidCount: { type: 'integer' },
            recentReasons: { type: 'array', items: { type: 'string' } },
            updatedAt: { type: ['string', 'null'], format: 'date-time' },
          },
          required: [
            'status',
            'reviewWindowSize',
            'emittedCount',
            'skippedCount',
            'blockedCount',
            'invalidCount',
            'recentReasons',
            'updatedAt',
          ],
        },
        ReportAvailabilitySummary: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: statusEnum },
            latestReportDate: { type: ['string', 'null'] },
            latestReportUrl: { type: ['string', 'null'] },
            historyUrl: { type: ['string', 'null'] },
            summary: { type: 'string' },
            updatedAt: { type: ['string', 'null'], format: 'date-time' },
          },
          required: [
            'status',
            'latestReportDate',
            'latestReportUrl',
            'historyUrl',
            'summary',
            'updatedAt',
          ],
        },
        NotificationAvailabilitySummary: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: statusEnum },
            unresolvedCount: { type: 'integer' },
            summary: { type: 'string' },
            updatedAt: { type: ['string', 'null'], format: 'date-time' },
          },
          required: ['status', 'unresolvedCount', 'summary', 'updatedAt'],
        },
      },
    },
  };
}

function renderDocsHtml(openApiDocument: Record<string, unknown>): string {
  const paths = Object.keys(
    (openApiDocument.paths as Record<string, unknown>) ?? {},
  ).sort();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CTB Control Plane Docs</title>
    <style>
      :root {
        color-scheme: light;
        font-family: "SF Mono", "Menlo", "Monaco", monospace;
        background: #f4f1ea;
        color: #1f2933;
      }
      body {
        margin: 0;
        padding: 2rem;
      }
      main {
        max-width: 72rem;
        margin: 0 auto;
        display: grid;
        gap: 1.5rem;
      }
      section {
        background: #fffdf8;
        border: 1px solid #d7c7a8;
        border-radius: 1rem;
        padding: 1.25rem;
      }
      a {
        color: #7c2d12;
      }
      pre {
        white-space: pre-wrap;
        word-break: break-word;
        background: #1f2933;
        color: #f8fafc;
        border-radius: 0.75rem;
        padding: 1rem;
        overflow-x: auto;
      }
      ul {
        padding-left: 1.25rem;
      }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>CTB Control Plane Docs</h1>
        <p>
          Supported contract surface for the CTB operator runtime. Use
          <a href="/api/v1/openapi.json">/api/v1/openapi.json</a> for the raw
          OpenAPI document.
        </p>
      </section>
      <section>
        <h2>Supported Paths</h2>
        <ul>
          ${paths.map((path) => `<li><code>${path}</code></li>`).join('')}
        </ul>
      </section>
      <section>
        <h2>OpenAPI</h2>
        <pre>${JSON.stringify(openApiDocument, null, 2)}</pre>
      </section>
    </main>
  </body>
</html>`;
}

export function createApiRequestHandler(options: {
  descriptor: ServiceRuntimeDescriptor;
  marketDataRepository?: MarketDataRepository;
  simulatorAccountingRepository?: SimulatorAccountingRepository;
  strategyEvaluationRepository?: StrategyEvaluationRepository;
}) {
  return async (
    request: http.IncomingMessage,
    response: http.ServerResponse,
  ) => {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');

    if (requestUrl.pathname === '/health') {
      json(response, 200, { ok: true, service: 'api' });
      return;
    }

    if (requestUrl.pathname === '/api/v1/openapi.json') {
      json(response, 200, buildOpenApiDocument());
      return;
    }

    if (requestUrl.pathname === '/docs') {
      html(response, 200, renderDocsHtml(buildOpenApiDocument()));
      return;
    }

    if (requestUrl.pathname === '/api/v1/status/market-data') {
      json(
        response,
        200,
        await loadMarketDataHealth(options.marketDataRepository),
      );
      return;
    }

    if (requestUrl.pathname === '/api/v1/status') {
      const controlPlaneState = await buildControlPlaneState(
        requestUrl,
        options,
      );
      json(response, 200, controlPlaneState.overview);
      return;
    }

    if (requestUrl.pathname === '/api/v1/status/dependencies') {
      json(response, 200, { dependencies: options.descriptor.dependencies });
      return;
    }

    if (requestUrl.pathname === '/api/v1/status/workflows') {
      const controlPlaneState = await buildControlPlaneState(
        requestUrl,
        options,
      );
      json(response, 200, { workflows: controlPlaneState.workflows });
      return;
    }

    if (requestUrl.pathname === '/api/v1/simulator/summary') {
      const controlPlaneState = await buildControlPlaneState(
        requestUrl,
        options,
      );
      json(response, 200, controlPlaneState.simulator);
      return;
    }

    if (requestUrl.pathname === '/api/v1/strategy/active') {
      const controlPlaneState = await buildControlPlaneState(
        requestUrl,
        options,
      );
      json(response, 200, controlPlaneState.strategyActive);
      return;
    }

    if (requestUrl.pathname === '/api/v1/strategy/review') {
      const controlPlaneState = await buildControlPlaneState(
        requestUrl,
        options,
      );
      json(response, 200, controlPlaneState.strategyReview);
      return;
    }

    if (requestUrl.pathname === '/api/v1/reports') {
      json(response, 200, buildReportsSummary());
      return;
    }

    if (requestUrl.pathname === '/api/v1/reports/latest') {
      json(response, 200, buildReportsSummary());
      return;
    }

    if (requestUrl.pathname === '/api/v1/notifications') {
      json(response, 200, buildNotificationsSummary());
      return;
    }

    if (requestUrl.pathname === '/api/v1/strategy/evaluations') {
      const limitValue = requestUrl.searchParams.get('limit');
      const evaluations = options.strategyEvaluationRepository
        ? await options.strategyEvaluationRepository.getRecentEvaluations({
            limit: limitValue ? Number(limitValue) : undefined,
            strategyId: requestUrl.searchParams.get('strategyId') ?? undefined,
            instrumentId:
              requestUrl.searchParams.get('instrumentId') ?? undefined,
            decisionState:
              (requestUrl.searchParams.get('decisionState') as
                | 'trade-intent-emitted'
                | 'skipped'
                | 'blocked'
                | 'invalid-input'
                | null) ?? undefined,
          })
        : [];

      json(response, 200, { evaluations });
      return;
    }

    if (
      requestUrl.pathname === '/api/v1/strategy/evaluate' &&
      options.marketDataRepository &&
      options.simulatorAccountingRepository &&
      options.strategyEvaluationRepository
    ) {
      const simulationAccountId =
        requestUrl.searchParams.get('simulationAccountId') ?? undefined;
      const instrumentId =
        requestUrl.searchParams.get('instrumentId') ?? undefined;

      if (!simulationAccountId || !instrumentId) {
        json(response, 400, {
          error:
            'simulationAccountId and instrumentId are required to evaluate strategy state.',
        });
        return;
      }

      try {
        const evaluation = await runStrategyEvaluation(
          {
            simulationAccountId,
            instrumentId,
            strategyId: requestUrl.searchParams.get('strategyId') ?? undefined,
            strategyVersion:
              requestUrl.searchParams.get('strategyVersion') ?? undefined,
            evaluationTimestamp:
              requestUrl.searchParams.get('evaluationTimestamp') ?? undefined,
          },
          {
            marketDataRepository: options.marketDataRepository,
            simulatorAccountingRepository:
              options.simulatorAccountingRepository,
            strategyEvaluationRepository: options.strategyEvaluationRepository,
          },
        );

        json(response, 200, { evaluation });
        return;
      } catch (error) {
        if (
          error instanceof Error &&
          /Simulation account .* is not available/.test(error.message)
        ) {
          json(response, 404, { error: error.message });
          return;
        }

        throw error;
      }
    }

    if (requestUrl.pathname === '/api/v1/market-data/history') {
      const instrumentId =
        requestUrl.searchParams.get('instrumentId') ?? undefined;
      const eventType = requestUrl.searchParams.get('eventType') ?? undefined;
      const limitValue = requestUrl.searchParams.get('limit');
      const limit = limitValue ? Number(limitValue) : undefined;
      const events = options.marketDataRepository
        ? await options.marketDataRepository.getCanonicalEventHistory({
            instrumentId,
            eventType: eventType as
              | 'quote'
              | 'trade'
              | 'bar'
              | 'status'
              | undefined,
            limit,
          })
        : [];

      json(response, 200, { events });
      return;
    }

    json(response, 200, options.descriptor);
  };
}

export function buildApiRuntimeDescriptor(
  rawEnvironment: NodeJS.ProcessEnv = process.env,
): ServiceRuntimeDescriptor {
  const runtimeConfig = loadRuntimeConfig('api', rawEnvironment);

  return serviceRuntimeDescriptorSchema.parse({
    name: 'api',
    role: 'CTB control-plane placeholder runtime',
    startupMessage: `CTB API workspace is listening on port ${runtimeConfig.port} with local dependency placeholders.`,
    dependencies: createLocalDependencyConfig({
      postgresUrl: runtimeConfig.postgresUrl,
      redisUrl: runtimeConfig.redisUrl,
    }),
  });
}

export async function startApiWorkspace(
  port?: number,
  rawEnvironment: NodeJS.ProcessEnv = process.env,
  options?: {
    marketDataRepository?: MarketDataRepository;
    simulatorAccountingRepository?: SimulatorAccountingRepository;
    strategyEvaluationRepository?: StrategyEvaluationRepository;
  },
) {
  const serviceEnvironment = {
    ...rawEnvironment,
    PORT: String(port ?? rawEnvironment.PORT ?? 3010),
  };
  const runtimeConfig = loadRuntimeConfig('api', serviceEnvironment);
  const descriptor = buildApiRuntimeDescriptor(serviceEnvironment);
  const prisma = options?.marketDataRepository
    ? null
    : new PrismaClient({
        datasourceUrl: runtimeConfig.postgresUrl,
      });
  const marketDataRepository =
    options?.marketDataRepository ??
    (prisma ? new PrismaMarketDataRepository(prisma) : undefined);
  const simulatorAccountingRepository =
    options?.simulatorAccountingRepository ??
    (prisma ? new PrismaSimulatorAccountingRepository(prisma) : undefined);
  const strategyEvaluationRepository =
    options?.strategyEvaluationRepository ??
    (prisma ? new PrismaStrategyEvaluationRepository(prisma) : undefined);

  const server = http.createServer(
    createApiRequestHandler({
      descriptor,
      marketDataRepository,
      simulatorAccountingRepository,
      strategyEvaluationRepository,
    }),
  );

  await new Promise<void>((resolve) => {
    server.listen(runtimeConfig.port, resolve);
  });

  console.log(
    `${descriptor.startupMessage} Port: ${(server.address() as { port: number }).port}`,
  );

  return { descriptor, server, prisma };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void startApiWorkspace();
}
