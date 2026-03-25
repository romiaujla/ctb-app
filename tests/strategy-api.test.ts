import assert from 'node:assert/strict';
import { test } from 'node:test';

import { startApiWorkspace } from '../apps/api/src/index.ts';

function createStrategyApiStubDependencies() {
  const evaluations = [
    {
      input: {
        evaluationId: 'eval-existing',
        strategyId: 'ctb-v1',
        strategyVersion: 'ctb-v1.0.0',
        evaluationTimestamp: '2026-03-25T14:05:00.500Z',
        instrumentId: 'AAPL',
        symbol: 'AAPL',
        sessionState: 'regular' as const,
        marketContext: {
          latestEventIds: ['bar-1'],
          freshnessState: 'ready' as const,
          summary: 'existing evaluation',
          indicatorSnapshots: [],
        },
        portfolioContext: {
          simulationAccountId: 'acct-1',
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
        evaluationId: 'eval-existing',
        strategyId: 'ctb-v1',
        strategyVersion: 'ctb-v1.0.0',
        evaluationTimestamp: '2026-03-25T14:05:00.500Z',
        inputReference: {
          marketEventIds: ['bar-1'],
          simulationAccountId: 'acct-1',
          portfolioSnapshotId: null,
          riskPolicyVersion: 'risk-v1',
        },
        decisionState: 'trade-intent-emitted' as const,
        signalSummary: [],
        guardrailSummary: [],
        decisionReason: 'existing evaluation',
        tradeIntentReference: 'intent-existing',
      },
      tradeIntent: {
        tradeIntentId: 'intent-existing',
        strategyEvaluationId: 'eval-existing',
        strategyId: 'ctb-v1',
        strategyVersion: 'ctb-v1.0.0',
        evaluationCorrelationId: 'eval-existing',
        instrumentId: 'AAPL',
        symbol: 'AAPL',
        side: 'buy' as const,
        requestedQuantity: '10',
        orderType: 'limit' as const,
        intentTimestamp: '2026-03-25T14:05:00.500Z',
        intentMetadata: {
          sizingMode: 'fixed',
        },
      },
    },
  ];

  return {
    marketDataRepository: {
      async getRecentIngestRuns() {
        return [];
      },
      async getRecentIngestDecisions() {
        return [];
      },
      async getCanonicalEventHistory() {
        return [
          {
            eventId: 'quote-1',
            eventType: 'quote' as const,
            instrumentId: 'AAPL',
            symbol: 'AAPL',
            provider: 'polygon',
            providerEventId: 'provider-quote-1',
            providerTimestamp: '2026-03-25T14:05:00.000Z',
            observedTimestamp: '2026-03-25T14:05:00.500Z',
            normalizedTimestamp: '2026-03-25T14:05:00.500Z',
            sessionState: 'regular' as const,
            quality: 'valid' as const,
            freshnessState: 'ready' as const,
            sourceLatencyMs: 500,
            rawReference: 'raw-quote-1',
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
          {
            eventId: 'bar-1',
            eventType: 'bar' as const,
            instrumentId: 'AAPL',
            symbol: 'AAPL',
            provider: 'polygon',
            providerEventId: 'provider-bar-1',
            providerTimestamp: '2026-03-25T14:05:00.000Z',
            observedTimestamp: '2026-03-25T14:05:00.500Z',
            normalizedTimestamp: '2026-03-25T14:05:00.500Z',
            sessionState: 'regular' as const,
            quality: 'valid' as const,
            freshnessState: 'ready' as const,
            sourceLatencyMs: 500,
            rawReference: 'raw-bar-1',
            normalizationVersion: 'market-v2',
            payload: {
              open: '188.90',
              high: '189.40',
              low: '188.80',
              close: '189.35',
              volume: 5000,
              vwap: '189.10',
              barStartTimestamp: '2026-03-25T14:00:00.000Z',
              barEndTimestamp: '2026-03-25T14:05:00.000Z',
              barResolution: '5m',
            },
          },
        ];
      },
    },
    simulatorAccountingRepository: {
      async getCurrentPortfolioView() {
        return {
          simulationAccount: {
            simulationAccountId: 'acct-1',
            baseCurrency: 'USD',
            startingBalance: '100000.00',
            currentCashBalance: '99874.65',
            status: 'active' as const,
            createdTimestamp: '2026-03-25T13:00:00.000Z',
            configurationVersion: 'sim-v1',
          },
          portfolio: {
            portfolioId: 'portfolio-1',
            simulationAccountId: 'acct-1',
            netLiquidationValue: '100004.65',
            grossExposure: '130.00',
            realizedPnl: '0.00',
            unrealizedPnl: '5.00',
            valuationTimestamp: '2026-03-25T14:05:00.500Z',
          },
          positions: [],
          openOrders: [],
          recentFills: [],
        };
      },
    },
    strategyEvaluationRepository: {
      async persistEvaluation(evaluation: (typeof evaluations)[number]) {
        evaluations.unshift(evaluation);
        return evaluation;
      },
      async getEvaluation(evaluationId: string) {
        return (
          evaluations.find(
            (evaluation) => evaluation.input.evaluationId === evaluationId,
          ) ?? null
        );
      },
      async getRecentEvaluations() {
        return evaluations;
      },
    },
  };
}

test('api exposes recent strategy evaluations and on-demand strategy execution', async () => {
  const dependencies = createStrategyApiStubDependencies();
  const { server } = await startApiWorkspace(
    0,
    process.env,
    dependencies as never,
  );

  try {
    const address = server.address();
    assert.ok(address && typeof address === 'object');

    const recentResponse = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/strategy/evaluations?limit=5`,
    );
    const recentPayload = await recentResponse.json();

    assert.equal(recentPayload.evaluations.length, 1);
    assert.equal(
      recentPayload.evaluations[0]?.evidence.decisionState,
      'trade-intent-emitted',
    );

    const evaluateResponse = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/strategy/evaluate?simulationAccountId=acct-1&instrumentId=AAPL&evaluationTimestamp=2026-03-25T14:05:00.500Z`,
    );
    const evaluatePayload = await evaluateResponse.json();

    assert.equal(
      evaluatePayload.evaluation.evidence.decisionState,
      'trade-intent-emitted',
    );
    assert.equal(evaluatePayload.evaluation.tradeIntent.side, 'buy');
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
