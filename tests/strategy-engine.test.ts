import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildStrategyEvaluationInput,
  evaluateStrategyInput,
} from '../packages/simulator-core/src/index.ts';

function createMarketDataRepositoryStub(overrides?: {
  freshnessState?: 'ready' | 'stale';
  sessionState?: 'regular' | 'closed';
  barClose?: string;
  barVwap?: string;
}) {
  return {
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
          sessionState: overrides?.sessionState ?? 'regular',
          quality: 'valid' as const,
          freshnessState: overrides?.freshnessState ?? 'ready',
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
          sessionState: overrides?.sessionState ?? 'regular',
          quality: 'valid' as const,
          freshnessState: overrides?.freshnessState ?? 'ready',
          sourceLatencyMs: 500,
          rawReference: 'raw-bar-1',
          normalizationVersion: 'market-v2',
          payload: {
            open: '188.90',
            high: '189.40',
            low: '188.80',
            close: overrides?.barClose ?? '189.35',
            volume: 5000,
            vwap: overrides?.barVwap ?? '189.10',
            barStartTimestamp: '2026-03-25T14:00:00.000Z',
            barEndTimestamp: '2026-03-25T14:05:00.000Z',
            barResolution: '5m',
          },
        },
      ];
    },
  };
}

function createSimulatorRepositoryStub(overrides?: {
  quantity?: string;
  openOrders?: number;
}) {
  return {
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
        positions:
          overrides?.quantity && overrides.quantity !== '0'
            ? [
                {
                  positionId: 'position-1',
                  simulationAccountId: 'acct-1',
                  instrumentId: 'AAPL',
                  quantity: overrides.quantity,
                  averageEntryCost: '188.50',
                  marketValue: '1893.50',
                  realizedPnl: '0.00',
                  unrealizedPnl: '8.50',
                  lastUpdatedTimestamp: '2026-03-25T14:05:00.500Z',
                },
              ]
            : [],
        openOrders: Array.from({ length: overrides?.openOrders ?? 0 }).map(
          (_, index) => ({
            simulatedOrderId: `order-${index + 1}`,
            simulationAccountId: 'acct-1',
            tradeIntentId: `intent-${index + 1}`,
            instrumentId: 'AAPL',
            side: 'buy' as const,
            orderType: 'limit' as const,
            requestedQuantity: '10',
            acceptedQuantity: '10',
            status: 'accepted' as const,
            submittedTimestamp: '2026-03-25T14:05:00.500Z',
            executionModelVersion: 'execution-v1',
          }),
        ),
        recentFills: [],
      };
    },
  };
}

test('strategy engine emits a deterministic long trade intent for bullish regular-session context', async () => {
  const input = await buildStrategyEvaluationInput(
    {
      simulationAccountId: 'acct-1',
      instrumentId: 'AAPL',
      evaluationTimestamp: '2026-03-25T14:05:00.500Z',
    },
    {
      marketDataRepository: createMarketDataRepositoryStub() as never,
      simulatorAccountingRepository: createSimulatorRepositoryStub() as never,
    },
  );

  const evaluation = evaluateStrategyInput(input);

  assert.equal(evaluation.evidence.decisionState, 'trade-intent-emitted');
  assert.equal(evaluation.tradeIntent?.side, 'buy');
  assert.equal(evaluation.tradeIntent?.orderType, 'limit');
  assert.equal(
    evaluation.evidence.tradeIntentReference,
    evaluation.tradeIntent?.tradeIntentId,
  );
});

test('strategy engine blocks when an open position already exists', async () => {
  const input = await buildStrategyEvaluationInput(
    {
      simulationAccountId: 'acct-1',
      instrumentId: 'AAPL',
      evaluationTimestamp: '2026-03-25T14:05:00.500Z',
    },
    {
      marketDataRepository: createMarketDataRepositoryStub() as never,
      simulatorAccountingRepository: createSimulatorRepositoryStub({
        quantity: '10',
      }) as never,
    },
  );

  const evaluation = evaluateStrategyInput(input);

  assert.equal(evaluation.evidence.decisionState, 'blocked');
  assert.equal(evaluation.tradeIntent, null);
  assert.match(evaluation.evidence.decisionReason, /open position/i);
});
