import assert from 'node:assert/strict';
import { test } from 'node:test';

import { startApiWorkspace } from '../apps/api/src/index.ts';
import {
  buildMarketDataOperatorViewModel,
  renderMarketDataOperatorView,
} from '../apps/web/src/main.ts';

function createStubMarketDataRepository() {
  return {
    async persist() {
      throw new Error('not needed in visibility tests');
    },
    async getIngestSnapshot() {
      return null;
    },
    async getRecentIngestRuns() {
      return [
        {
          ingestRunId: 'run-83-1',
          provider: 'polygon',
          ingestMode: 'poll' as const,
          status: 'partial' as const,
          adapterVersion: 'adapter-v1',
          startedAt: '2026-03-25T15:00:00.000Z',
          completedAt: '2026-03-25T15:00:05.000Z',
          requestedInstruments: ['AAPL'],
          notes: null,
        },
      ];
    },
    async getRecentIngestDecisions() {
      return [
        {
          ingestDecisionId: 'decision-83-1',
          ingestRunId: 'run-83-1',
          rawRecordId: 'raw-83-1',
          marketDataEventId: 'market:event-83-1',
          decisionType: 'accepted' as const,
          duplicateKey: null,
          rejectionReason: null,
          freshnessState: 'ready' as const,
          quality: 'valid' as const,
          decidedTimestamp: '2026-03-25T15:00:01.000Z',
        },
        {
          ingestDecisionId: 'decision-83-2',
          ingestRunId: 'run-83-1',
          rawRecordId: 'raw-83-2',
          marketDataEventId: null,
          decisionType: 'duplicate' as const,
          duplicateKey: 'polygon:AAPL:quote:event-83-1',
          rejectionReason: null,
          freshnessState: 'ready' as const,
          quality: 'valid' as const,
          decidedTimestamp: '2026-03-25T15:00:02.000Z',
        },
      ];
    },
    async getCanonicalEventHistory() {
      return [
        {
          eventId: 'event-83-1',
          eventType: 'quote' as const,
          instrumentId: 'AAPL',
          symbol: 'AAPL',
          provider: 'polygon',
          providerEventId: 'provider-event-83-1',
          providerTimestamp: '2026-03-25T15:00:00.000Z',
          observedTimestamp: '2026-03-25T15:00:01.000Z',
          normalizedTimestamp: '2026-03-25T15:00:01.000Z',
          sessionState: 'regular' as const,
          quality: 'valid' as const,
          freshnessState: 'ready' as const,
          sourceLatencyMs: 1000,
          rawReference: 'raw-83-1',
          normalizationVersion: 'market-data-v1',
          payload: {
            bidPrice: '189.25',
            askPrice: '189.35',
            bidSize: 10,
            askSize: 12,
            midPrice: '189.30',
            lastTradePrice: '189.28',
          },
        },
      ];
    },
  };
}

test('api exposes market-data health and history endpoints', async () => {
  const repository = createStubMarketDataRepository();
  const { server } = await startApiWorkspace(0, process.env, {
    marketDataRepository: repository as never,
  });

  try {
    const address = server.address();
    assert.ok(address && typeof address === 'object');

    const healthResponse = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/status/market-data`,
    );
    const healthPayload = await healthResponse.json();

    assert.equal(healthPayload.overallStatus, 'degraded');
    assert.equal(healthPayload.latestRun.ingestRunId, 'run-83-1');
    assert.equal(healthPayload.duplicateCount, 1);

    const historyResponse = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/market-data/history?instrumentId=AAPL&eventType=quote`,
    );
    const historyPayload = await historyResponse.json();

    assert.equal(historyPayload.events.length, 1);
    assert.equal(historyPayload.events[0]?.symbol, 'AAPL');
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

test('web operator view renders degraded market-data state clearly', async () => {
  const repository = createStubMarketDataRepository();
  const model = buildMarketDataOperatorViewModel({
    overallStatus: 'degraded',
    latestRun: {
      ingestRunId: 'run-83-1',
      status: 'partial',
    },
    latestEvent: {
      eventId: 'event-83-1',
      eventType: 'quote',
      instrumentId: 'AAPL',
      symbol: 'AAPL',
      provider: 'polygon',
      providerEventId: 'provider-event-83-1',
      providerTimestamp: '2026-03-25T15:00:00.000Z',
      observedTimestamp: '2026-03-25T15:00:01.000Z',
      normalizedTimestamp: '2026-03-25T15:00:01.000Z',
      sessionState: 'regular',
      quality: 'valid',
      freshnessState: 'ready',
      sourceLatencyMs: 1000,
      rawReference: 'raw-83-1',
      normalizationVersion: 'market-data-v1',
      payload: {
        bidPrice: '189.25',
        askPrice: '189.35',
        bidSize: 10,
        askSize: 12,
        midPrice: '189.30',
        lastTradePrice: '189.28',
      },
    },
    recentDecisions: await repository.getRecentIngestDecisions(),
  });

  const rendered = renderMarketDataOperatorView(model);

  assert.match(rendered, /CTB Market Data Overview/);
  assert.match(rendered, /Status: degraded/);
  assert.match(rendered, /Duplicates: 1/);
  assert.match(rendered, /Latest run: run-83-1/);
});
