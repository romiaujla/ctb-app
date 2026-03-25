import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  canonicalMarketDataEventSchema,
  marketDataNormalizationInputSchema,
} from '../packages/schemas/src/index.ts';
import {
  DefaultMarketDataIngestionService,
  type MarketDataRepository,
  normalizeMarketDataEvent,
} from '../packages/market-data/src/index.ts';

function createInMemoryMarketDataRepository(): MarketDataRepository {
  const runs = [];
  const rawRecords = [];
  const canonicalEvents = [];
  const decisions = [];

  return {
    async persist(input) {
      runs.push(input.ingestRun);
      rawRecords.push(...(input.rawRecords ?? []));
      canonicalEvents.push(...input.canonicalEvents);
      decisions.push(...input.ingestDecisions);

      return {
        ingestRun: input.ingestRun,
        rawRecords: [...rawRecords],
        canonicalEvents: [...canonicalEvents],
        ingestDecisions: [...decisions],
      };
    },
    async getIngestSnapshot(ingestRunId) {
      const ingestRun = runs.find((run) => run.ingestRunId === ingestRunId);
      if (!ingestRun) {
        return null;
      }

      return {
        ingestRun,
        rawRecords: rawRecords.filter(
          (record) => record.ingestRunId === ingestRunId,
        ),
        canonicalEvents: canonicalEvents.filter(
          (event) => event.ingestRunId === ingestRunId,
        ),
        ingestDecisions: decisions.filter(
          (decision) => decision.ingestRunId === ingestRunId,
        ),
      };
    },
    async getRecentIngestRuns(limit = 10) {
      return runs.slice(-limit).reverse();
    },
    async getRecentIngestDecisions(limit = 20) {
      return decisions.slice(-limit).reverse();
    },
    async getCanonicalEventHistory(query = {}) {
      return canonicalEvents.filter((event) => {
        if (query.eventId && event.eventId !== query.eventId) {
          return false;
        }
        if (query.instrumentId && event.instrumentId !== query.instrumentId) {
          return false;
        }
        if (query.eventType && event.eventType !== query.eventType) {
          return false;
        }
        if (query.ingestRunId && event.ingestRunId !== query.ingestRunId) {
          return false;
        }

        return true;
      });
    },
  };
}

test('shared market-data schemas parse normalization input and canonical events', () => {
  const normalizationInput = marketDataNormalizationInputSchema.parse({
    ingestRunId: 'run-84-1',
    rawRecordId: 'raw-84-1',
    provider: 'polygon',
    providerSymbol: 'AAPL',
    providerEventId: 'provider-event-84-1',
    instrumentId: 'AAPL',
    symbol: 'AAPL',
    eventType: 'quote',
    providerTimestamp: '2026-03-25T14:00:00.000Z',
    observedTimestamp: '2026-03-25T14:00:01.000Z',
    sessionState: 'regular',
    rawReference: 'raw-84-1',
    normalizationVersion: 'market-data-v1',
    payload: {
      bidPrice: '189.25',
      askPrice: '189.35',
      bidSize: 10,
      askSize: 12,
      midPrice: null,
      lastTradePrice: '189.30',
    },
  });

  const event = canonicalMarketDataEventSchema.parse({
    ...normalizeMarketDataEvent(normalizationInput),
  });

  assert.equal(event.eventType, 'quote');
  assert.equal(event.payload.midPrice, '189.30');
});

test('ingestion service persists accepted events and flags duplicates', async () => {
  const repository = createInMemoryMarketDataRepository();
  const service = new DefaultMarketDataIngestionService(repository);

  const input = {
    ingestRun: {
      ingestRunId: 'run-84-1',
      provider: 'polygon',
      ingestMode: 'poll' as const,
      status: 'running' as const,
      adapterVersion: 'adapter-v1',
      startedAt: '2026-03-25T14:00:00.000Z',
      completedAt: null,
      requestedInstruments: ['AAPL'],
      notes: null,
    },
    rawRecords: [
      {
        rawRecordId: 'raw-84-1',
        ingestRunId: 'run-84-1',
        provider: 'polygon',
        providerSymbol: 'AAPL',
        providerEventId: 'provider-event-84-1',
        receivedTimestamp: '2026-03-25T14:00:01.000Z',
        providerTimestamp: '2026-03-25T14:00:00.000Z',
        adapterVersion: 'adapter-v1',
        payload: { bid: 189.25, ask: 189.35 },
      },
      {
        rawRecordId: 'raw-84-2',
        ingestRunId: 'run-84-1',
        provider: 'polygon',
        providerSymbol: 'AAPL',
        providerEventId: 'provider-event-84-1',
        receivedTimestamp: '2026-03-25T14:00:02.000Z',
        providerTimestamp: '2026-03-25T14:00:00.000Z',
        adapterVersion: 'adapter-v1',
        payload: { bid: 189.25, ask: 189.35, duplicate: true },
      },
    ],
    normalizationInputs: [
      {
        ingestRunId: 'run-84-1',
        rawRecordId: 'raw-84-1',
        provider: 'polygon',
        providerSymbol: 'AAPL',
        providerEventId: 'provider-event-84-1',
        instrumentId: 'AAPL',
        symbol: 'AAPL',
        eventType: 'quote' as const,
        providerTimestamp: '2026-03-25T14:00:00.000Z',
        observedTimestamp: '2026-03-25T14:00:01.000Z',
        sessionState: 'regular' as const,
        rawReference: 'raw-84-1',
        normalizationVersion: 'market-data-v1',
        payload: {
          bidPrice: '189.25',
          askPrice: '189.35',
          bidSize: 10,
          askSize: 12,
          midPrice: null,
          lastTradePrice: '189.30',
        },
      },
      {
        ingestRunId: 'run-84-1',
        rawRecordId: 'raw-84-2',
        provider: 'polygon',
        providerSymbol: 'AAPL',
        providerEventId: 'provider-event-84-1',
        instrumentId: 'AAPL',
        symbol: 'AAPL',
        eventType: 'quote' as const,
        providerTimestamp: '2026-03-25T14:00:00.000Z',
        observedTimestamp: '2026-03-25T14:00:02.000Z',
        sessionState: 'regular' as const,
        rawReference: 'raw-84-2',
        normalizationVersion: 'market-data-v1',
        payload: {
          bidPrice: '189.25',
          askPrice: '189.35',
          bidSize: 10,
          askSize: 12,
          midPrice: null,
          lastTradePrice: '189.30',
        },
      },
    ],
  };

  const outcome = await service.ingest(input, {
    completedAt: '2026-03-25T14:00:03.000Z',
  });

  assert.equal(outcome.acceptedCount, 1);
  assert.equal(outcome.duplicateCount, 1);
  assert.equal(outcome.rejectedCount, 0);
  assert.equal(outcome.snapshot.ingestRun.status, 'partial');
  assert.equal(outcome.snapshot.canonicalEvents.length, 1);
  assert.equal(
    outcome.snapshot.ingestDecisions.filter(
      (decision) => decision.decisionType === 'duplicate',
    ).length,
    1,
  );
});
