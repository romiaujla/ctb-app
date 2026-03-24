import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { test } from 'node:test';
import { promisify } from 'node:util';

import { PrismaClient } from '@prisma/client';

import {
  PrismaSimulatorAccountingRepository,
  verifyDeterministicReplay,
} from '../packages/simulator-core/src/index.ts';
import {
  createRuntimeDependencyHarness,
  isContainerRuntimeUnavailable,
} from '../packages/test-utils/src/index.ts';

const execFileAsync = promisify(execFile);
const repositoryRoot = new URL('../', import.meta.url);

test('simulator accounting repository persists and queries durable portfolio state', async (t) => {
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

    const repository = new PrismaSimulatorAccountingRepository(prisma);

    const currentView = await repository.persist({
      simulationAccount: {
        simulationAccountId: 'acct-79',
        baseCurrency: 'USD',
        startingBalance: '100000.00',
        currentCashBalance: '99874.65',
        status: 'active',
        createdTimestamp: '2026-03-24T15:10:00.000Z',
        configurationVersion: 'sim-v1',
      },
      orders: [
        {
          simulatedOrderId: 'order-79',
          simulationAccountId: 'acct-79',
          tradeIntentId: 'intent-79',
          instrumentId: 'AAPL',
          side: 'buy',
          orderType: 'limit',
          requestedQuantity: '10',
          acceptedQuantity: '10',
          status: 'partially-filled',
          submittedTimestamp: '2026-03-24T15:10:01.000Z',
          executionModelVersion: 'execution-v1',
        },
      ],
      events: [
        {
          simulatorEventId: 'event-79-1',
          simulationAccountId: 'acct-79',
          eventType: 'order-submitted',
          eventTimestamp: '2026-03-24T15:10:01.000Z',
          recordedTimestamp: '2026-03-24T15:10:01.010Z',
          sequenceKey: 'acct-79:00000001',
          correlationId: 'corr-79',
          causationId: 'intent-79',
          schemaVersion: 1,
          payload: {
            simulatedOrderId: 'order-79',
            tradeIntentId: 'intent-79',
            acceptedQuantity: '10',
          },
        },
        {
          simulatorEventId: 'event-79-2',
          simulationAccountId: 'acct-79',
          eventType: 'order-filled',
          eventTimestamp: '2026-03-24T15:10:02.000Z',
          recordedTimestamp: '2026-03-24T15:10:02.010Z',
          sequenceKey: 'acct-79:00000002',
          correlationId: 'corr-79',
          causationId: 'order-79',
          schemaVersion: 1,
          payload: {
            simulatedOrderId: 'order-79',
            simulatedFillId: 'fill-79',
            cumulativeFilledQuantity: '10',
          },
        },
      ],
      fills: [
        {
          simulatedFillId: 'fill-79',
          simulatedOrderId: 'order-79',
          simulationAccountId: 'acct-79',
          instrumentId: 'AAPL',
          fillQuantity: '10',
          fillPrice: '12.50',
          simulatedFeeAmount: '0.25',
          slippageAmount: '0.10',
          fillTimestamp: '2026-03-24T15:10:02.000Z',
        },
      ],
      positions: [
        {
          positionId: 'position-79',
          simulationAccountId: 'acct-79',
          instrumentId: 'AAPL',
          quantity: '10',
          averageEntryCost: '12.50',
          marketValue: '130.00',
          realizedPnl: '0.00',
          unrealizedPnl: '5.00',
          lastUpdatedTimestamp: '2026-03-24T15:10:03.000Z',
        },
      ],
      portfolio: {
        portfolioId: 'portfolio-79',
        simulationAccountId: 'acct-79',
        netLiquidationValue: '100004.65',
        grossExposure: '130.00',
        realizedPnl: '0.00',
        unrealizedPnl: '5.00',
        valuationTimestamp: '2026-03-24T15:10:03.000Z',
      },
      snapshots: [
        {
          snapshotId: 'snapshot-79',
          simulationAccountId: 'acct-79',
          cashBalance: '99874.65',
          grossExposure: '130.00',
          netLiquidationValue: '100004.65',
          realizedPnl: '0.00',
          unrealizedPnl: '5.00',
          timestamp: '2026-03-24T15:10:03.000Z',
          sourceEventId: 'event-79-2',
        },
      ],
    });

    assert.equal(currentView.simulationAccount.simulationAccountId, 'acct-79');
    assert.equal(currentView.portfolio?.netLiquidationValue, '100004.65');
    assert.equal(currentView.positions[0]?.instrumentId, 'AAPL');
    assert.equal(currentView.recentFills[0]?.simulatedFillId, 'fill-79');

    const history = await repository.getPortfolioHistory('acct-79');
    assert.equal(history.orders.length, 1);
    assert.equal(history.events.length, 2);
    assert.equal(history.fills.length, 1);
    assert.equal(history.snapshots[0]?.sourceEventId, 'event-79-2');

    const persistedView = await repository.getCurrentPortfolioView('acct-79');
    assert.equal(persistedView?.openOrders[0]?.status, 'partially-filled');

    const replayVerification = verifyDeterministicReplay({
      simulationAccount: currentView.simulationAccount,
      orders: history.orders,
      currentView: persistedView,
      events: history.events,
      fills: history.fills,
      snapshots: history.snapshots,
    });
    assert.equal(replayVerification.currentViewMatched, true);
    assert.equal(replayVerification.latestSnapshotMatched, true);
  } finally {
    await prisma.$disconnect();
    await harness.stop();
  }
});

test('simulator accounting repository rejects derived records without canonical event lineage', async (t) => {
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

    const repository = new PrismaSimulatorAccountingRepository(prisma);

    await assert.rejects(
      repository.persist({
        simulationAccount: {
          simulationAccountId: 'acct-79-bad',
          baseCurrency: 'USD',
          startingBalance: '1000.00',
          currentCashBalance: '1000.00',
          status: 'active',
          createdTimestamp: '2026-03-24T15:30:00.000Z',
          configurationVersion: 'sim-v1',
        },
        events: [],
        snapshots: [
          {
            snapshotId: 'snapshot-bad',
            simulationAccountId: 'acct-79-bad',
            cashBalance: '1000.00',
            grossExposure: '0.00',
            netLiquidationValue: '1000.00',
            realizedPnl: '0.00',
            unrealizedPnl: '0.00',
            timestamp: '2026-03-24T15:30:01.000Z',
            sourceEventId: 'missing-event',
          },
        ],
      }),
      /must reference an existing simulator event/,
    );
  } finally {
    await prisma.$disconnect();
    await harness.stop();
  }
});
