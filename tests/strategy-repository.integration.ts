import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { test } from 'node:test';
import { promisify } from 'node:util';

import { PrismaClient } from '@prisma/client';

import { PrismaStrategyEvaluationRepository } from '../packages/simulator-core/src/index.ts';
import {
  createRuntimeDependencyHarness,
  isContainerRuntimeUnavailable,
} from '../packages/test-utils/src/index.ts';

const execFileAsync = promisify(execFile);
const repositoryRoot = new URL('../', import.meta.url);

function createStrategyEvaluationFixture(overrides?: {
  evaluationId?: string;
  strategyVersion?: string;
  decisionState?: 'trade-intent-emitted' | 'blocked';
  tradeIntentId?: string | null;
}) {
  const evaluationId = overrides?.evaluationId ?? 'eval-79';
  const decisionState = overrides?.decisionState ?? 'trade-intent-emitted';
  const tradeIntentId =
    overrides?.tradeIntentId === undefined
      ? 'intent-79'
      : overrides.tradeIntentId;

  return {
    input: {
      evaluationId,
      strategyId: 'ctb-v1',
      strategyVersion: overrides?.strategyVersion ?? 'v1.0.0',
      evaluationTimestamp: '2026-03-25T22:45:00.000Z',
      instrumentId: 'AAPL',
      symbol: 'AAPL',
      sessionState: 'regular' as const,
      marketContext: {
        latestEventIds: ['market-1', 'market-2'],
        freshnessState: 'ready' as const,
        summary: 'quote and trade context were strategy-safe',
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
        simulationAccountId: 'acct-79',
        cashAvailable: '99874.65',
        currentPositionQuantity: '0',
        averageCostBasis: null,
        instrumentExposure: '0.00',
        portfolioExposure: '130.00',
        netLiquidationValue: '100004.65',
        openIntentCount: 0,
      },
      riskContext: {
        maxPositionQuantity: '10',
        maxCapitalAtRisk: '5000.00',
        sessionEligible: true,
        blockedReasons:
          decisionState === 'blocked' ? ['capital guardrail failed'] : [],
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
      evaluationId,
      strategyId: 'ctb-v1',
      strategyVersion: overrides?.strategyVersion ?? 'v1.0.0',
      evaluationTimestamp: '2026-03-25T22:45:00.000Z',
      inputReference: {
        marketEventIds: ['market-1', 'market-2'],
        simulationAccountId: 'acct-79',
        portfolioSnapshotId: 'snapshot-79',
        riskPolicyVersion: 'risk-v1',
      },
      decisionState,
      signalSummary: [
        {
          signalCode: 'momentum-confirmed',
          direction: 'bullish' as const,
          strength: decisionState === 'blocked' ? null : '0.90',
          summary:
            decisionState === 'blocked'
              ? 'signal was qualified before the guardrail blocked action'
              : 'signal met the strategy threshold',
        },
      ],
      guardrailSummary: [
        {
          guardrailCode: 'capital-limit',
          status:
            decisionState === 'blocked'
              ? ('blocked' as const)
              : ('passed' as const),
          reason:
            decisionState === 'blocked'
              ? 'available capital could not support the requested size'
              : null,
          detail: 'validated against risk-v1 capital threshold',
        },
      ],
      decisionReason:
        decisionState === 'blocked'
          ? 'Capital guardrail prevented a new intent.'
          : 'Strategy emitted a long trade intent.',
      tradeIntentReference: tradeIntentId,
    },
    tradeIntent:
      tradeIntentId === null
        ? null
        : {
            tradeIntentId,
            strategyEvaluationId: evaluationId,
            strategyId: 'ctb-v1',
            strategyVersion: overrides?.strategyVersion ?? 'v1.0.0',
            evaluationCorrelationId: evaluationId,
            instrumentId: 'AAPL',
            symbol: 'AAPL',
            side: 'buy' as const,
            requestedQuantity: '10',
            orderType: 'limit' as const,
            intentTimestamp: '2026-03-25T22:45:00.000Z',
            intentMetadata: {
              sizingMode: 'fixed-fraction',
              limitOffsetBps: 15,
            },
          },
  };
}

test('strategy evaluation repository persists emitted and blocked evidence records', async (t) => {
  let harness;

  try {
    harness = await createRuntimeDependencyHarness();
  } catch (error) {
    if (isContainerRuntimeUnavailable(error)) {
      t.skip('Docker or another supported container runtime is unavailable.');
      return;
    }

    throw error;
  }

  const runtimeEnvironment = {
    ...process.env,
    POSTGRES_URL: harness.postgresUrl,
    REDIS_URL: harness.redisUrl,
  };

  const prisma = new PrismaClient({
    datasourceUrl: harness.postgresUrl,
  });

  try {
    await execFileAsync('pnpm', ['db:migrate:deploy'], {
      cwd: repositoryRoot,
      env: runtimeEnvironment,
    });

    const repository = new PrismaStrategyEvaluationRepository(prisma);

    const emitted = await repository.persistEvaluation(
      createStrategyEvaluationFixture(),
    );
    assert.equal(emitted.tradeIntent?.tradeIntentId, 'intent-79');
    assert.equal(emitted.evidence.decisionState, 'trade-intent-emitted');

    const blocked = await repository.persistEvaluation(
      createStrategyEvaluationFixture({
        evaluationId: 'eval-80',
        strategyVersion: 'v1.0.1',
        decisionState: 'blocked',
        tradeIntentId: null,
      }),
    );
    assert.equal(blocked.tradeIntent, null);
    assert.equal(blocked.evidence.tradeIntentReference, null);

    const persistedEmitted = await repository.getEvaluation('eval-79');
    assert.equal(
      persistedEmitted?.tradeIntent?.strategyEvaluationId,
      'eval-79',
    );

    const recent = await repository.getRecentEvaluations({
      strategyId: 'ctb-v1',
      instrumentId: 'AAPL',
      limit: 5,
    });
    assert.equal(recent.length, 2);
    assert.equal(recent[0]?.input.strategyVersion, 'v1.0.1');

    const blockedOnly = await repository.getRecentEvaluations({
      decisionState: 'blocked',
    });
    assert.equal(blockedOnly.length, 1);
    assert.equal(blockedOnly[0]?.input.evaluationId, 'eval-80');
  } finally {
    await prisma.$disconnect();
    await harness.stop();
  }
});
