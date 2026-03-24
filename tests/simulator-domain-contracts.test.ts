import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  portfolioSnapshotSchema,
  simulatedFillSchema,
  simulatedOrderSchema,
  simulationAccountSchema,
  simulatorEventEnvelopeSchema,
} from '../packages/schemas/src/index.ts';
import {
  appendOnlySimulatorEntities,
  getSimulatorPersistenceContract,
  isDerivedSimulatorEntity,
  simulatorPersistenceContracts,
  simulatorSystemOfRecordEntities,
} from '../packages/simulator-core/src/index.ts';

test('canonical simulator contracts parse the primary entity set', () => {
  const account = simulationAccountSchema.parse({
    simulationAccountId: 'acct-1',
    baseCurrency: 'USD',
    startingBalance: '100000.00',
    currentCashBalance: '99875.25',
    status: 'active',
    createdTimestamp: '2026-03-24T12:00:00.000Z',
    configurationVersion: 'sim-v1',
  });

  const order = simulatedOrderSchema.parse({
    simulatedOrderId: 'order-1',
    simulationAccountId: account.simulationAccountId,
    tradeIntentId: 'intent-1',
    instrumentId: 'AAPL',
    side: 'buy',
    orderType: 'limit',
    requestedQuantity: '10',
    acceptedQuantity: '10',
    status: 'accepted',
    submittedTimestamp: '2026-03-24T12:00:01.000Z',
    executionModelVersion: 'execution-v1',
  });

  const fill = simulatedFillSchema.parse({
    simulatedFillId: 'fill-1',
    simulatedOrderId: order.simulatedOrderId,
    simulationAccountId: account.simulationAccountId,
    instrumentId: order.instrumentId,
    fillQuantity: '10',
    fillPrice: '12.50',
    simulatedFeeAmount: '0.25',
    slippageAmount: '0.10',
    fillTimestamp: '2026-03-24T12:00:02.000Z',
  });

  const snapshot = portfolioSnapshotSchema.parse({
    snapshotId: 'snapshot-1',
    simulationAccountId: account.simulationAccountId,
    cashBalance: '99875.25',
    grossExposure: '125.00',
    netLiquidationValue: '100010.00',
    realizedPnl: '0.00',
    unrealizedPnl: '10.00',
    timestamp: '2026-03-24T12:00:03.000Z',
    sourceEventId: 'event-3',
  });

  assert.equal(fill.instrumentId, 'AAPL');
  assert.equal(snapshot.sourceEventId, 'event-3');
});

test('simulator event envelopes enforce event-specific payload contracts', () => {
  const envelope = simulatorEventEnvelopeSchema.parse({
    simulatorEventId: 'event-1',
    simulationAccountId: 'acct-1',
    eventType: 'order-filled',
    eventTimestamp: '2026-03-24T12:00:02.000Z',
    recordedTimestamp: '2026-03-24T12:00:02.100Z',
    sequenceKey: 'acct-1:00000001',
    correlationId: 'corr-1',
    causationId: 'order-1',
    schemaVersion: 1,
    payload: {
      simulatedOrderId: 'order-1',
      simulatedFillId: 'fill-1',
      cumulativeFilledQuantity: '10',
    },
  });

  assert.equal(envelope.payload.simulatedFillId, 'fill-1');

  assert.throws(() =>
    simulatorEventEnvelopeSchema.parse({
      simulatorEventId: 'event-2',
      simulationAccountId: 'acct-1',
      eventType: 'order-filled',
      eventTimestamp: '2026-03-24T12:00:02.000Z',
      recordedTimestamp: '2026-03-24T12:00:02.100Z',
      sequenceKey: 'acct-1:00000002',
      correlationId: null,
      causationId: 'order-1',
      schemaVersion: 1,
      payload: {
        simulatedOrderId: 'order-1',
      },
    }),
  );
});

test('persistence contracts separate append-only facts from derived views', () => {
  assert.deepEqual(appendOnlySimulatorEntities, [
    'simulated-fill',
    'simulator-event',
  ]);

  assert.deepEqual(simulatorSystemOfRecordEntities, [
    'simulation-account',
    'simulated-order',
    'simulated-fill',
    'simulator-event',
  ]);

  const eventContract = getSimulatorPersistenceContract('simulator-event');
  const positionContract = getSimulatorPersistenceContract('position');

  assert.equal(eventContract.storageKind, 'append-only');
  assert.equal(eventContract.systemOfRecord, true);
  assert.equal(positionContract.truthKind, 'derived-view');
  assert.equal(isDerivedSimulatorEntity('portfolio-snapshot'), true);
  assert.equal(
    simulatorPersistenceContracts.every((contract) => contract.durable),
    true,
  );
});
