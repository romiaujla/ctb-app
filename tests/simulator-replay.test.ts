import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  replaySimulatorState,
  verifyDeterministicReplay,
} from '../packages/simulator-core/src/index.ts';

function createReplayFixture() {
  return {
    simulationAccount: {
      simulationAccountId: 'acct-80',
      baseCurrency: 'USD',
      startingBalance: '100000.00',
      currentCashBalance: '99874.65',
      status: 'active' as const,
      createdTimestamp: '2026-03-24T19:05:00.000Z',
      configurationVersion: 'sim-v1',
    },
    orders: [
      {
        simulatedOrderId: 'buy-order-80',
        simulationAccountId: 'acct-80',
        tradeIntentId: 'intent-80',
        instrumentId: 'AAPL',
        side: 'buy' as const,
        orderType: 'limit' as const,
        requestedQuantity: '10',
        acceptedQuantity: '10',
        status: 'filled' as const,
        submittedTimestamp: '2026-03-24T19:05:01.000Z',
        executionModelVersion: 'execution-v1',
      },
    ],
    events: [
      {
        simulatorEventId: 'event-80-1',
        simulationAccountId: 'acct-80',
        eventType: 'order-submitted' as const,
        eventTimestamp: '2026-03-24T19:05:01.000Z',
        recordedTimestamp: '2026-03-24T19:05:01.010Z',
        sequenceKey: 'acct-80:00000001',
        correlationId: 'corr-80',
        causationId: 'intent-80',
        schemaVersion: 1,
        payload: {
          simulatedOrderId: 'buy-order-80',
          tradeIntentId: 'intent-80',
          acceptedQuantity: '10',
        },
      },
      {
        simulatorEventId: 'event-80-2',
        simulationAccountId: 'acct-80',
        eventType: 'order-filled' as const,
        eventTimestamp: '2026-03-24T19:05:02.000Z',
        recordedTimestamp: '2026-03-24T19:05:02.010Z',
        sequenceKey: 'acct-80:00000002',
        correlationId: 'corr-80',
        causationId: 'buy-order-80',
        schemaVersion: 1,
        payload: {
          simulatedOrderId: 'buy-order-80',
          simulatedFillId: 'fill-80',
          cumulativeFilledQuantity: '10',
        },
      },
      {
        simulatorEventId: 'event-80-3',
        simulationAccountId: 'acct-80',
        eventType: 'position-revalued' as const,
        eventTimestamp: '2026-03-24T19:05:03.000Z',
        recordedTimestamp: '2026-03-24T19:05:03.010Z',
        sequenceKey: 'acct-80:00000003',
        correlationId: 'corr-80',
        causationId: 'fill-80',
        schemaVersion: 1,
        payload: {
          positionId: 'position-80',
          instrumentId: 'AAPL',
          marketValue: '130.00',
          unrealizedPnl: '5.00',
        },
      },
    ],
    fills: [
      {
        simulatedFillId: 'fill-80',
        simulatedOrderId: 'buy-order-80',
        simulationAccountId: 'acct-80',
        instrumentId: 'AAPL',
        fillQuantity: '10',
        fillPrice: '12.50',
        simulatedFeeAmount: '0.25',
        slippageAmount: '0.10',
        fillTimestamp: '2026-03-24T19:05:02.000Z',
      },
    ],
    snapshots: [
      {
        snapshotId: 'snapshot-80',
        simulationAccountId: 'acct-80',
        cashBalance: '99874.65',
        grossExposure: '130.00',
        netLiquidationValue: '100004.65',
        realizedPnl: '0.00',
        unrealizedPnl: '5.00',
        timestamp: '2026-03-24T19:05:03.000Z',
        sourceEventId: 'event-80-3',
      },
    ],
    currentView: {
      simulationAccount: {
        simulationAccountId: 'acct-80',
        baseCurrency: 'USD',
        startingBalance: '100000.00',
        currentCashBalance: '99874.65',
        status: 'active' as const,
        createdTimestamp: '2026-03-24T19:05:00.000Z',
        configurationVersion: 'sim-v1',
      },
      portfolio: {
        portfolioId: 'portfolio-80',
        simulationAccountId: 'acct-80',
        netLiquidationValue: '100004.65',
        grossExposure: '130.00',
        realizedPnl: '0.00',
        unrealizedPnl: '5.00',
        valuationTimestamp: '2026-03-24T19:05:03.000Z',
      },
      positions: [
        {
          positionId: 'position-80',
          simulationAccountId: 'acct-80',
          instrumentId: 'AAPL',
          quantity: '10',
          averageEntryCost: '12.5',
          marketValue: '130.00',
          realizedPnl: '0.00',
          unrealizedPnl: '5.00',
          lastUpdatedTimestamp: '2026-03-24T19:05:03.000Z',
        },
      ],
      openOrders: [],
      recentFills: [
        {
          simulatedFillId: 'fill-80',
          simulatedOrderId: 'buy-order-80',
          simulationAccountId: 'acct-80',
          instrumentId: 'AAPL',
          fillQuantity: '10',
          fillPrice: '12.50',
          simulatedFeeAmount: '0.25',
          slippageAmount: '0.10',
          fillTimestamp: '2026-03-24T19:05:02.000Z',
        },
      ],
    },
  };
}

test('replay simulator state is deterministic for the same ordered input', () => {
  const fixture = createReplayFixture();
  const firstReplay = replaySimulatorState(fixture);
  const secondReplay = replaySimulatorState(fixture);

  assert.equal(firstReplay.replayDigest, secondReplay.replayDigest);
  assert.equal(firstReplay.cashBalance, '99874.65');
  assert.equal(firstReplay.netLiquidationValue, '100004.65');
  assert.equal(firstReplay.positions[0]?.instrumentId, 'AAPL');
});

test('replay verification matches the current view and latest snapshot', () => {
  const verification = verifyDeterministicReplay(createReplayFixture());

  assert.equal(verification.currentViewMatched, true);
  assert.equal(verification.latestSnapshotMatched, true);
  assert.equal(verification.latestSnapshotId, 'snapshot-80');
});

test('replay verification fails when snapshot totals drift', () => {
  const fixture = createReplayFixture();
  fixture.snapshots = [
    {
      ...fixture.snapshots[0],
      netLiquidationValue: '100999.99',
    },
  ];

  assert.throws(
    () => verifyDeterministicReplay(fixture),
    /latest snapshot snapshot-80 does not match replay output/,
  );
});
