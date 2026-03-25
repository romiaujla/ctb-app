import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildStrategyOperatorViewModel,
  loadStrategyOperatorViewModel,
  renderStrategyOperatorView,
} from '../apps/web/src/main.ts';

function createStrategyEvaluationRecord(decisionState: {
  value: 'trade-intent-emitted' | 'skipped' | 'blocked';
  reason: string;
  version?: string;
}) {
  return {
    input: {
      evaluationId: `eval-${decisionState.value}`,
      strategyId: 'ctb-v1',
      strategyVersion: decisionState.version ?? 'ctb-v1.0.0',
      evaluationTimestamp: '2026-03-25T14:05:00.500Z',
      instrumentId: 'AAPL',
      symbol: 'AAPL',
      sessionState: 'regular' as const,
      marketContext: {
        latestEventIds: ['bar-1'],
        freshnessState: 'ready' as const,
        summary: 'fresh market data',
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
      evaluationId: `eval-${decisionState.value}`,
      strategyId: 'ctb-v1',
      strategyVersion: decisionState.version ?? 'ctb-v1.0.0',
      evaluationTimestamp: '2026-03-25T14:05:00.500Z',
      inputReference: {
        marketEventIds: ['bar-1'],
        simulationAccountId: 'acct-1',
        portfolioSnapshotId: null,
        riskPolicyVersion: 'risk-v1',
      },
      decisionState: decisionState.value,
      signalSummary: [],
      guardrailSummary: [],
      decisionReason: decisionState.reason,
      tradeIntentReference:
        decisionState.value === 'trade-intent-emitted' ? 'intent-1' : null,
    },
    tradeIntent:
      decisionState.value === 'trade-intent-emitted'
        ? {
            tradeIntentId: 'intent-1',
            strategyEvaluationId: 'eval-trade-intent-emitted',
            strategyId: 'ctb-v1',
            strategyVersion: decisionState.version ?? 'ctb-v1.0.0',
            evaluationCorrelationId: 'eval-trade-intent-emitted',
            instrumentId: 'AAPL',
            symbol: 'AAPL',
            side: 'buy' as const,
            requestedQuantity: '10',
            orderType: 'limit' as const,
            intentTimestamp: '2026-03-25T14:05:00.500Z',
            intentMetadata: {
              setup: 'bullish-continuation',
            },
          }
        : null,
  };
}

test('strategy operator view model surfaces review-ready and warning states', () => {
  const reviewReadyModel = buildStrategyOperatorViewModel({
    evaluations: [
      createStrategyEvaluationRecord({
        value: 'trade-intent-emitted',
        reason: 'Signal and guardrails passed.',
      }),
      createStrategyEvaluationRecord({
        value: 'skipped',
        reason: 'Momentum confirmation was incomplete.',
      }),
    ],
  });

  assert.equal(reviewReadyModel.overallStatus, 'review-ready');
  assert.equal(reviewReadyModel.emittedCount, 1);
  assert.equal(reviewReadyModel.skippedCount, 1);

  const warningModel = buildStrategyOperatorViewModel({
    evaluations: [
      createStrategyEvaluationRecord({
        value: 'blocked',
        reason: 'Open position guardrail blocked new entry.',
      }),
    ],
  });

  assert.equal(warningModel.overallStatus, 'warning');
  assert.equal(warningModel.blockedCount, 1);
});

test('strategy operator rendering uses clear labels for decision outcomes', () => {
  const rendered = renderStrategyOperatorView(
    buildStrategyOperatorViewModel({
      evaluations: [
        createStrategyEvaluationRecord({
          value: 'blocked',
          reason: 'Open position guardrail blocked new entry.',
          version: 'ctb-v1.0.1',
        }),
      ],
    }),
  );

  assert.match(rendered, /CTB Strategy Overview/);
  assert.match(rendered, /Active strategy version: ctb-v1.0.1/);
  assert.match(rendered, /Latest decision: blocked/);
  assert.match(rendered, /Recent strategy reasons:/);
});

test('strategy operator loader consumes API strategy evidence', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    ({
      async json() {
        return {
          evaluations: [
            createStrategyEvaluationRecord({
              value: 'trade-intent-emitted',
              reason: 'Signal and guardrails passed.',
            }),
          ],
        };
      },
    }) as Response) as typeof fetch;

  try {
    const model = await loadStrategyOperatorViewModel('http://example.test');

    assert.equal(model.activeStrategyVersion, 'ctb-v1.0.0');
    assert.equal(model.latestDecisionState, 'trade intent emitted');
    assert.equal(model.emittedCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
