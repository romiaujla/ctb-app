import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  strategyEvaluationRecordSchema,
  strategyTradeIntentSchema,
} from '../packages/schemas/src/index.ts';

test('strategy evaluation contracts preserve explainability evidence', () => {
  const record = strategyEvaluationRecordSchema.parse({
    input: {
      evaluationId: 'eval-1',
      strategyId: 'ctb-v1',
      strategyVersion: 'v1.0.0',
      evaluationTimestamp: '2026-03-25T22:30:00.000Z',
      instrumentId: 'AAPL',
      symbol: 'AAPL',
      sessionState: 'regular',
      marketContext: {
        latestEventIds: ['event-1', 'event-2'],
        freshnessState: 'ready',
        summary: 'fresh quote and trade context',
        indicatorSnapshots: [
          {
            name: 'momentum-5m',
            value: '1.15',
            interpretation: 'bullish',
            sourceVersion: 'indicator-v1',
          },
        ],
      },
      portfolioContext: {
        simulationAccountId: 'acct-1',
        cashAvailable: '10000.00',
        currentPositionQuantity: '0',
        averageCostBasis: null,
        instrumentExposure: '0.00',
        portfolioExposure: '1500.00',
        netLiquidationValue: '25000.00',
        openIntentCount: 0,
      },
      riskContext: {
        maxPositionQuantity: '25',
        maxCapitalAtRisk: '5000.00',
        sessionEligible: true,
        blockedReasons: [],
        sizingPolicyVersion: 'risk-v1',
      },
      dataTrust: {
        readinessState: 'ready',
        blockedReason: null,
        normalizationVersion: 'market-v2',
        replayVersion: 'replay-v1',
      },
    },
    evidence: {
      evaluationId: 'eval-1',
      strategyId: 'ctb-v1',
      strategyVersion: 'v1.0.0',
      evaluationTimestamp: '2026-03-25T22:30:00.000Z',
      inputReference: {
        marketEventIds: ['event-1', 'event-2'],
        simulationAccountId: 'acct-1',
        portfolioSnapshotId: 'snapshot-1',
        riskPolicyVersion: 'risk-v1',
      },
      decisionState: 'trade-intent-emitted',
      signalSummary: [
        {
          signalCode: 'momentum-confirmed',
          direction: 'bullish',
          strength: '0.88',
          summary: 'momentum and freshness checks passed',
        },
      ],
      guardrailSummary: [
        {
          guardrailCode: 'capital-limit',
          status: 'passed',
          reason: null,
          detail: 'capital usage remains below threshold',
        },
      ],
      decisionReason: 'Signal and guardrails allowed a long setup.',
      tradeIntentReference: 'intent-1',
    },
    tradeIntent: {
      tradeIntentId: 'intent-1',
      strategyEvaluationId: 'eval-1',
      strategyId: 'ctb-v1',
      strategyVersion: 'v1.0.0',
      evaluationCorrelationId: 'eval-1',
      instrumentId: 'AAPL',
      symbol: 'AAPL',
      side: 'buy',
      requestedQuantity: '10',
      orderType: 'limit',
      intentTimestamp: '2026-03-25T22:30:00.000Z',
      intentMetadata: {
        sizingMode: 'fixed-fraction',
        limitOffsetBps: 15,
      },
    },
  });

  assert.equal(record.evidence.tradeIntentReference, 'intent-1');
  assert.equal(record.tradeIntent?.orderType, 'limit');
});

test('strategy trade intent metadata rejects nested objects', () => {
  assert.throws(() =>
    strategyTradeIntentSchema.parse({
      tradeIntentId: 'intent-2',
      strategyEvaluationId: 'eval-2',
      strategyId: 'ctb-v1',
      strategyVersion: 'v1.0.0',
      evaluationCorrelationId: 'eval-2',
      instrumentId: 'MSFT',
      symbol: 'MSFT',
      side: 'sell',
      requestedQuantity: '5',
      orderType: 'market',
      intentTimestamp: '2026-03-25T22:31:00.000Z',
      intentMetadata: {
        invalid: { nested: true },
      },
    }),
  );
});
