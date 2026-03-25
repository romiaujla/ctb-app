import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { test } from 'node:test';
import { promisify } from 'node:util';

import { PrismaClient } from '@prisma/client';

import { PrismaMarketDataRepository } from '../packages/market-data/src/index.ts';
import {
  createRuntimeDependencyHarness,
  isContainerRuntimeUnavailable,
} from '../packages/test-utils/src/index.ts';

const execFileAsync = promisify(execFile);
const repositoryRoot = new URL('../', import.meta.url);

test('market-data repository persists replay-ready ingest history and query filters', async (t) => {
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

    const repository = new PrismaMarketDataRepository(prisma);
    const snapshot = await repository.persist({
      ingestRun: {
        ingestRunId: 'run-82-1',
        provider: 'polygon',
        ingestMode: 'poll',
        status: 'partial',
        adapterVersion: 'adapter-v1',
        startedAt: '2026-03-25T13:00:00.000Z',
        completedAt: '2026-03-25T13:00:05.000Z',
        requestedInstruments: ['AAPL', 'MSFT'],
        notes: 'First persistence baseline ingest run',
      },
      rawRecords: [
        {
          rawRecordId: 'raw-82-1',
          ingestRunId: 'run-82-1',
          provider: 'polygon',
          providerSymbol: 'AAPL',
          providerEventId: 'provider-event-1',
          receivedTimestamp: '2026-03-25T13:00:01.000Z',
          providerTimestamp: '2026-03-25T13:00:00.800Z',
          adapterVersion: 'adapter-v1',
          payload: { type: 'quote', bid: 189.25, ask: 189.3 },
        },
        {
          rawRecordId: 'raw-82-2',
          ingestRunId: 'run-82-1',
          provider: 'polygon',
          providerSymbol: 'AAPL',
          providerEventId: 'provider-event-1',
          receivedTimestamp: '2026-03-25T13:00:02.000Z',
          providerTimestamp: '2026-03-25T13:00:00.800Z',
          adapterVersion: 'adapter-v1',
          payload: { type: 'quote', bid: 189.25, ask: 189.3, duplicate: true },
        },
      ],
      canonicalEvents: [
        {
          marketDataEventId: 'market-event-82-1',
          eventId: 'event-82-1',
          ingestRunId: 'run-82-1',
          rawRecordId: 'raw-82-1',
          eventType: 'quote',
          instrumentId: 'AAPL',
          symbol: 'AAPL',
          provider: 'polygon',
          providerEventId: 'provider-event-1',
          providerTimestamp: '2026-03-25T13:00:00.800Z',
          observedTimestamp: '2026-03-25T13:00:01.000Z',
          normalizedTimestamp: '2026-03-25T13:00:01.000Z',
          sessionState: 'regular',
          quality: 'valid',
          freshnessState: 'ready',
          sourceLatencyMs: 200,
          rawReference: 'raw-82-1',
          normalizationVersion: 'market-data-v1',
          payload: {
            bidPrice: '189.25',
            askPrice: '189.30',
            bidSize: 10,
            askSize: 12,
            midPrice: '189.28',
            lastTradePrice: '189.27',
          },
          persistedTimestamp: '2026-03-25T13:00:01.050Z',
        },
      ],
      ingestDecisions: [
        {
          ingestDecisionId: 'decision-82-1',
          ingestRunId: 'run-82-1',
          rawRecordId: 'raw-82-1',
          marketDataEventId: 'market-event-82-1',
          decisionType: 'accepted',
          duplicateKey: null,
          rejectionReason: null,
          freshnessState: 'ready',
          quality: 'valid',
          decidedTimestamp: '2026-03-25T13:00:01.050Z',
        },
        {
          ingestDecisionId: 'decision-82-2',
          ingestRunId: 'run-82-1',
          rawRecordId: 'raw-82-2',
          marketDataEventId: null,
          decisionType: 'duplicate',
          duplicateKey: 'polygon:AAPL:quote:2026-03-25T13:00:01.000Z',
          rejectionReason: null,
          freshnessState: 'ready',
          quality: 'valid',
          decidedTimestamp: '2026-03-25T13:00:02.050Z',
        },
        {
          ingestDecisionId: 'decision-82-3',
          ingestRunId: 'run-82-1',
          rawRecordId: null,
          marketDataEventId: null,
          decisionType: 'rejected',
          duplicateKey: null,
          rejectionReason: 'instrument mapping missing',
          freshnessState: 'invalid',
          quality: 'invalid',
          decidedTimestamp: '2026-03-25T13:00:04.000Z',
        },
      ],
    });

    assert.equal(snapshot.ingestRun.ingestRunId, 'run-82-1');
    assert.equal(snapshot.rawRecords.length, 2);
    assert.equal(snapshot.canonicalEvents.length, 1);
    assert.equal(snapshot.ingestDecisions.length, 3);

    const history = await repository.getCanonicalEventHistory({
      instrumentId: 'AAPL',
      eventType: 'quote',
      ingestRunId: 'run-82-1',
    });
    assert.equal(history.length, 1);
    assert.equal(history[0]?.eventId, 'event-82-1');
    assert.equal(history[0]?.sessionState, 'regular');

    const recentRuns = await repository.getRecentIngestRuns(5);
    assert.equal(recentRuns[0]?.status, 'partial');
    assert.deepEqual(recentRuns[0]?.requestedInstruments, ['AAPL', 'MSFT']);

    const recentDecisions = await repository.getRecentIngestDecisions(5);
    assert.equal(recentDecisions.length, 3);
    assert.equal(recentDecisions[0]?.decisionType, 'rejected');
    assert.equal(recentDecisions[1]?.decisionType, 'duplicate');
  } finally {
    await prisma.$disconnect();
    await harness.stop();
  }
});
