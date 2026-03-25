import assert from 'node:assert/strict';
import http from 'node:http';
import { test } from 'node:test';

import {
  buildApiRuntimeDescriptor,
  createApiRequestHandler,
  startApiWorkspace,
} from '../apps/api/src/index.ts';

function createRuntimeEnvironment() {
  return {
    ...process.env,
    PORT: '0',
    POSTGRES_URL: 'https://example.com/postgres',
    REDIS_URL: 'https://example.com/redis',
  };
}

function createStrategyEvaluationRecord() {
  return {
    input: {
      evaluationId: 'eval-90-1',
      strategyId: 'ctb-v1',
      strategyVersion: 'ctb-v1.1.0',
      evaluationTimestamp: '2026-03-25T18:00:00.000Z',
      instrumentId: 'AAPL',
      symbol: 'AAPL',
      sessionState: 'regular' as const,
      marketContext: {
        latestEventIds: ['bar-90-1'],
        freshnessState: 'ready' as const,
        summary: 'fresh market data',
        indicatorSnapshots: [],
      },
      portfolioContext: {
        simulationAccountId: 'acct-90-1',
        cashAvailable: '99874.65',
        currentPositionQuantity: '0',
        averageCostBasis: null,
        instrumentExposure: '0',
        portfolioExposure: '130',
        netLiquidationValue: '100004.65',
        openIntentCount: 0,
      },
      riskContext: {
        maxPositionQuantity: '10',
        maxCapitalAtRisk: '25001.1625',
        sessionEligible: true,
        blockedReasons: [],
        sizingPolicyVersion: 'risk-v1',
      },
      dataTrust: {
        readinessState: 'ready' as const,
        blockedReason: null,
        normalizationVersion: 'market-v2',
        replayVersion: 'replay-v1',
      },
    },
    evidence: {
      evaluationId: 'eval-90-1',
      strategyId: 'ctb-v1',
      strategyVersion: 'ctb-v1.1.0',
      evaluationTimestamp: '2026-03-25T18:00:00.000Z',
      inputReference: {
        marketEventIds: ['bar-90-1'],
        simulationAccountId: 'acct-90-1',
        portfolioSnapshotId: 'snapshot-90-1',
        riskPolicyVersion: 'risk-v1',
      },
      decisionState: 'trade-intent-emitted' as const,
      signalSummary: [],
      guardrailSummary: [],
      decisionReason: 'Signal and guardrails passed.',
      tradeIntentReference: 'intent-90-1',
    },
    tradeIntent: {
      tradeIntentId: 'intent-90-1',
      strategyEvaluationId: 'eval-90-1',
      strategyId: 'ctb-v1',
      strategyVersion: 'ctb-v1.1.0',
      evaluationCorrelationId: 'eval-90-1',
      instrumentId: 'AAPL',
      symbol: 'AAPL',
      side: 'buy' as const,
      requestedQuantity: '10',
      orderType: 'limit' as const,
      intentTimestamp: '2026-03-25T18:00:00.000Z',
      intentMetadata: {
        setup: 'bullish-continuation',
      },
    },
  };
}

test('control-plane API exposes overview, workflow, and docs surfaces', async () => {
  const strategyEvaluation = createStrategyEvaluationRecord();
  const { server } = await startApiWorkspace(0, createRuntimeEnvironment(), {
    marketDataRepository: {
      async getRecentIngestRuns() {
        return [
          {
            ingestRunId: 'run-90-1',
            provider: 'polygon',
            ingestMode: 'poll' as const,
            status: 'succeeded' as const,
            adapterVersion: 'adapter-v1',
            startedAt: '2026-03-25T17:59:00.000Z',
            completedAt: '2026-03-25T18:00:00.000Z',
            requestedInstruments: ['AAPL'],
            notes: null,
          },
        ];
      },
      async getRecentIngestDecisions() {
        return [
          {
            ingestDecisionId: 'decision-90-1',
            ingestRunId: 'run-90-1',
            rawRecordId: 'raw-90-1',
            marketDataEventId: 'event-90-1',
            decisionType: 'accepted' as const,
            duplicateKey: null,
            rejectionReason: null,
            freshnessState: 'ready' as const,
            quality: 'valid' as const,
            decidedTimestamp: '2026-03-25T18:00:00.000Z',
          },
        ];
      },
      async getCanonicalEventHistory() {
        return [
          {
            eventId: 'event-90-1',
            eventType: 'quote' as const,
            instrumentId: 'AAPL',
            symbol: 'AAPL',
            provider: 'polygon',
            providerEventId: 'provider-90-1',
            providerTimestamp: '2026-03-25T17:59:59.000Z',
            observedTimestamp: '2026-03-25T18:00:00.000Z',
            normalizedTimestamp: '2026-03-25T18:00:00.000Z',
            sessionState: 'regular' as const,
            quality: 'valid' as const,
            freshnessState: 'ready' as const,
            sourceLatencyMs: 1000,
            rawReference: 'raw-90-1',
            normalizationVersion: 'market-v2',
            payload: {
              bidPrice: '189.20',
              askPrice: '189.30',
              bidSize: 10,
              askSize: 12,
              midPrice: '189.25',
              lastTradePrice: '189.28',
            },
          },
        ];
      },
      async persist() {
        throw new Error('not used in control-plane API tests');
      },
      async getIngestSnapshot() {
        return null;
      },
    } as never,
    simulatorAccountingRepository: {
      async persist() {
        throw new Error('not used in control-plane API tests');
      },
      async getCurrentPortfolioView() {
        return {
          simulationAccount: {
            simulationAccountId: 'acct-90-1',
            baseCurrency: 'USD',
            startingBalance: '100000.00',
            currentCashBalance: '99874.65',
            status: 'active' as const,
            createdTimestamp: '2026-03-25T17:00:00.000Z',
            configurationVersion: 'sim-v1',
          },
          portfolio: {
            portfolioId: 'portfolio-90-1',
            simulationAccountId: 'acct-90-1',
            netLiquidationValue: '100004.65',
            grossExposure: '130.00',
            realizedPnl: '0.00',
            unrealizedPnl: '5.00',
            valuationTimestamp: '2026-03-25T18:00:00.000Z',
          },
          positions: [],
          openOrders: [],
          recentFills: [],
        };
      },
      async getPortfolioHistory() {
        return {
          orders: [],
          events: [],
          fills: [],
          snapshots: [],
        };
      },
    },
    strategyEvaluationRepository: {
      async persistEvaluation() {
        return strategyEvaluation;
      },
      async getEvaluation() {
        return strategyEvaluation;
      },
      async getRecentEvaluations() {
        return [strategyEvaluation];
      },
    },
  });

  try {
    const address = server.address();
    assert.ok(address && typeof address === 'object');

    const overviewResponse = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/status`,
    );
    const overviewPayload = await overviewResponse.json();
    assert.equal(overviewPayload.overallStatus, 'unavailable');
    assert.equal(overviewPayload.docsUrl, '/docs');
    assert.equal(overviewPayload.sections.length, 5);

    const simulatorResponse = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/simulator/summary`,
    );
    const simulatorPayload = await simulatorResponse.json();
    assert.equal(simulatorPayload.status, 'healthy');
    assert.equal(simulatorPayload.simulationAccountId, 'acct-90-1');

    const strategyReviewResponse = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/strategy/review`,
    );
    const strategyReviewPayload = await strategyReviewResponse.json();
    assert.equal(strategyReviewPayload.status, 'healthy');
    assert.equal(strategyReviewPayload.emittedCount, 1);

    const workflowResponse = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/status/workflows`,
    );
    const workflowPayload = await workflowResponse.json();
    assert.equal(workflowPayload.workflows.length, 5);
    assert.equal(workflowPayload.workflows[3]?.key, 'reports');
    assert.equal(workflowPayload.workflows[3]?.status, 'unavailable');

    const docsResponse = await fetch(`http://127.0.0.1:${address.port}/docs`);
    const docsHtml = await docsResponse.text();
    assert.match(docsHtml, /CTB Control Plane Docs/);
    assert.match(docsHtml, /\/api\/v1\/openapi\.json/);

    const openApiResponse = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/openapi.json`,
    );
    const openApiPayload = await openApiResponse.json();
    assert.equal(openApiPayload.openapi, '3.1.0');
    assert.ok(openApiPayload.paths['/api/v1/status']);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});

test('control-plane API falls back to explicit empty and unavailable states without repositories', async () => {
  const descriptor = buildApiRuntimeDescriptor(createRuntimeEnvironment());
  const server = http.createServer(
    createApiRequestHandler({
      descriptor,
    }),
  );

  await new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });

  try {
    const address = server.address();
    assert.ok(address && typeof address === 'object');

    const overviewResponse = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/status`,
    );
    const overviewPayload = await overviewResponse.json();
    assert.equal(overviewPayload.overallStatus, 'unavailable');

    const simulatorResponse = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/simulator/summary`,
    );
    const simulatorPayload = await simulatorResponse.json();
    assert.equal(simulatorPayload.status, 'unavailable');

    const strategyActiveResponse = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/strategy/active`,
    );
    const strategyActivePayload = await strategyActiveResponse.json();
    assert.equal(strategyActivePayload.status, 'empty');

    const reportResponse = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/reports/latest`,
    );
    const reportPayload = await reportResponse.json();
    assert.equal(reportPayload.status, 'unavailable');

    const notificationResponse = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/notifications`,
    );
    const notificationPayload = await notificationResponse.json();
    assert.equal(notificationPayload.status, 'unavailable');
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});
