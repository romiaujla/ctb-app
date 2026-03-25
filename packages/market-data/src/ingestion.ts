import {
  canonicalMarketDataEventSchema,
  marketDataNormalizationInputSchema,
} from '@ctb/schemas';
import type {
  CanonicalMarketDataEvent,
  MarketDataBarPayload,
  MarketDataEventType,
  MarketDataFreshnessThresholds,
  MarketDataNormalizationInput,
  MarketDataQuotePayload,
  MarketDataStatusPayload,
  MarketDataTradePayload,
} from '@ctb/types';

import {
  type CanonicalMarketDataEvent as PersistedCanonicalMarketDataEvent,
  type MarketDataIngestDecision,
  type MarketDataIngestionOutcome,
  type MarketDataIngestionRequest,
  type MarketDataIngestionService,
  type MarketDataRepository,
} from './contracts.js';

const defaultThresholds: MarketDataFreshnessThresholds = {
  regular: {
    quote: { readyMs: 15_000, delayedMs: 60_000 },
    trade: { readyMs: 15_000, delayedMs: 60_000 },
    bar: { readyMs: 60_000, delayedMs: 300_000 },
    status: { readyMs: 30_000, delayedMs: 120_000 },
  },
  preMarket: {
    quote: { readyMs: 60_000, delayedMs: 300_000 },
    trade: { readyMs: 60_000, delayedMs: 300_000 },
    bar: { readyMs: 300_000, delayedMs: 900_000 },
    status: { readyMs: 120_000, delayedMs: 600_000 },
  },
  afterHours: {
    quote: { readyMs: 60_000, delayedMs: 300_000 },
    trade: { readyMs: 60_000, delayedMs: 300_000 },
    bar: { readyMs: 300_000, delayedMs: 900_000 },
    status: { readyMs: 120_000, delayedMs: 600_000 },
  },
  closed: {
    quote: { readyMs: 300_000, delayedMs: 900_000 },
    trade: { readyMs: 300_000, delayedMs: 900_000 },
    bar: { readyMs: 900_000, delayedMs: 1_800_000 },
    status: { readyMs: 300_000, delayedMs: 900_000 },
  },
  maxFutureSkewMs: 5_000,
};

function hasValue<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function deriveMarketDataQuality(
  eventType: MarketDataEventType,
  payload: MarketDataNormalizationInput['payload'],
): CanonicalMarketDataEvent['quality'] {
  switch (eventType) {
    case 'quote': {
      const quotePayload = payload as MarketDataQuotePayload;
      return [
        quotePayload.bidPrice,
        quotePayload.askPrice,
        quotePayload.bidSize,
        quotePayload.askSize,
      ].every(hasValue)
        ? 'valid'
        : 'partial';
    }
    case 'trade': {
      const tradePayload = payload as MarketDataTradePayload;
      return [tradePayload.tradePrice, tradePayload.tradeSize].every(hasValue)
        ? 'valid'
        : 'partial';
    }
    case 'bar': {
      const barPayload = payload as MarketDataBarPayload;
      return [
        barPayload.open,
        barPayload.high,
        barPayload.low,
        barPayload.close,
        barPayload.volume,
        barPayload.barStartTimestamp,
        barPayload.barEndTimestamp,
        barPayload.barResolution,
      ].every(hasValue)
        ? 'valid'
        : 'partial';
    }
    case 'status': {
      const statusPayload = payload as MarketDataStatusPayload;
      return [statusPayload.tradingStatus, statusPayload.tradable].every(
        hasValue,
      )
        ? 'valid'
        : 'partial';
    }
  }
}

function withDerivedPayload(
  input: MarketDataNormalizationInput,
): MarketDataNormalizationInput['payload'] {
  if (input.eventType !== 'quote') {
    return input.payload;
  }

  const quotePayload = input.payload as MarketDataQuotePayload;
  const midPrice =
    quotePayload.midPrice ??
    (quotePayload.bidPrice && quotePayload.askPrice
      ? (
          (Number(quotePayload.bidPrice) + Number(quotePayload.askPrice)) /
          2
        ).toFixed(2)
      : null);

  return {
    ...quotePayload,
    midPrice,
  };
}

export function buildMarketDataEventId(
  input: MarketDataNormalizationInput,
): string {
  const orderingTimestamp =
    input.normalizedTimestamp ??
    input.providerTimestamp ??
    input.observedTimestamp;
  const providerIdentity =
    input.providerEventId ?? input.providerSymbol ?? input.symbol;

  return [
    input.provider,
    input.instrumentId,
    input.eventType,
    providerIdentity,
    orderingTimestamp,
  ].join(':');
}

export function evaluateMarketDataFreshness(
  event: Pick<
    CanonicalMarketDataEvent,
    | 'eventType'
    | 'providerTimestamp'
    | 'observedTimestamp'
    | 'sessionState'
    | 'quality'
  >,
  thresholds: MarketDataFreshnessThresholds = defaultThresholds,
): CanonicalMarketDataEvent['freshnessState'] {
  if (event.quality === 'invalid') {
    return 'invalid';
  }

  if (event.quality === 'partial') {
    return 'partial';
  }

  const providerTimestamp = new Date(event.providerTimestamp).getTime();
  const observedTimestamp = new Date(event.observedTimestamp).getTime();

  if (providerTimestamp > observedTimestamp + thresholds.maxFutureSkewMs) {
    return 'invalid';
  }

  const ageMs = Math.max(0, observedTimestamp - providerTimestamp);
  const window = thresholds[event.sessionState][event.eventType];

  if (ageMs <= window.readyMs) {
    return 'ready';
  }

  if (ageMs <= window.delayedMs) {
    return 'delayed';
  }

  return 'stale';
}

export function normalizeMarketDataEvent(
  input: MarketDataNormalizationInput,
  thresholds: MarketDataFreshnessThresholds = defaultThresholds,
): CanonicalMarketDataEvent {
  const parsedInput = marketDataNormalizationInputSchema.parse(input);
  const payload = withDerivedPayload(parsedInput);
  const quality = deriveMarketDataQuality(parsedInput.eventType, payload);
  const normalizedTimestamp =
    parsedInput.normalizedTimestamp ?? parsedInput.providerTimestamp;
  const sourceLatencyMs = Math.max(
    0,
    new Date(parsedInput.observedTimestamp).getTime() -
      new Date(parsedInput.providerTimestamp).getTime(),
  );

  const normalizedEvent = canonicalMarketDataEventSchema.parse({
    eventId: buildMarketDataEventId(parsedInput),
    eventType: parsedInput.eventType,
    instrumentId: parsedInput.instrumentId,
    symbol: parsedInput.symbol,
    provider: parsedInput.provider,
    providerEventId: parsedInput.providerEventId,
    providerTimestamp: parsedInput.providerTimestamp,
    observedTimestamp: parsedInput.observedTimestamp,
    normalizedTimestamp,
    sessionState: parsedInput.sessionState,
    quality,
    freshnessState: 'ready',
    sourceLatencyMs,
    rawReference: parsedInput.rawReference,
    normalizationVersion: parsedInput.normalizationVersion,
    payload,
  });

  return {
    ...normalizedEvent,
    freshnessState: evaluateMarketDataFreshness(normalizedEvent, thresholds),
  };
}

export class DefaultMarketDataIngestionService implements MarketDataIngestionService {
  constructor(private readonly repository: MarketDataRepository) {}

  async ingest(
    input: MarketDataIngestionRequest,
    options?: {
      thresholds?: MarketDataFreshnessThresholds;
      completedAt?: string;
    },
  ): Promise<MarketDataIngestionOutcome> {
    const acceptedEvents: PersistedCanonicalMarketDataEvent[] = [];
    const ingestDecisions: MarketDataIngestDecision[] = [];
    const seenEventIds = new Set<string>();
    let duplicateCount = 0;
    let rejectedCount = 0;

    for (const normalizationInput of input.normalizationInputs) {
      const normalizedEvent = normalizeMarketDataEvent(
        normalizationInput,
        options?.thresholds,
      );
      const existingEvents = await this.repository.getCanonicalEventHistory({
        eventId: normalizedEvent.eventId,
        limit: 1,
      });

      if (
        existingEvents.length > 0 ||
        seenEventIds.has(normalizedEvent.eventId)
      ) {
        duplicateCount += 1;
        ingestDecisions.push({
          ingestDecisionId: `${normalizationInput.rawRecordId}:duplicate`,
          ingestRunId: normalizationInput.ingestRunId,
          rawRecordId: normalizationInput.rawRecordId,
          marketDataEventId: null,
          decisionType: 'duplicate' as const,
          duplicateKey: normalizedEvent.eventId,
          rejectionReason: null,
          freshnessState: normalizedEvent.freshnessState,
          quality: normalizedEvent.quality,
          decidedTimestamp: normalizationInput.observedTimestamp,
        });
        continue;
      }

      if (normalizedEvent.freshnessState === 'invalid') {
        rejectedCount += 1;
        ingestDecisions.push({
          ingestDecisionId: `${normalizationInput.rawRecordId}:rejected`,
          ingestRunId: normalizationInput.ingestRunId,
          rawRecordId: normalizationInput.rawRecordId,
          marketDataEventId: null,
          decisionType: 'rejected' as const,
          duplicateKey: null,
          rejectionReason: 'timestamp guardrail failed',
          freshnessState: normalizedEvent.freshnessState,
          quality: normalizedEvent.quality,
          decidedTimestamp: normalizationInput.observedTimestamp,
        });
        continue;
      }

      acceptedEvents.push({
        ...normalizedEvent,
        marketDataEventId: `market:${normalizedEvent.eventId}`,
        ingestRunId: normalizationInput.ingestRunId,
        rawRecordId: normalizationInput.rawRecordId,
        persistedTimestamp:
          options?.completedAt ?? normalizationInput.observedTimestamp,
      } as PersistedCanonicalMarketDataEvent);
      seenEventIds.add(normalizedEvent.eventId);
      ingestDecisions.push({
        ingestDecisionId: `${normalizationInput.rawRecordId}:accepted`,
        ingestRunId: normalizationInput.ingestRunId,
        rawRecordId: normalizationInput.rawRecordId,
        marketDataEventId: `market:${normalizedEvent.eventId}`,
        decisionType: 'accepted' as const,
        duplicateKey: null,
        rejectionReason: null,
        freshnessState: normalizedEvent.freshnessState,
        quality: normalizedEvent.quality,
        decidedTimestamp: normalizationInput.observedTimestamp,
      });
    }

    const snapshot = await this.repository.persist({
      ingestRun: {
        ...input.ingestRun,
        status:
          rejectedCount > 0 || duplicateCount > 0 ? 'partial' : 'succeeded',
        completedAt: options?.completedAt ?? input.ingestRun.completedAt,
      },
      rawRecords: input.rawRecords,
      canonicalEvents: acceptedEvents,
      ingestDecisions,
    });

    return {
      snapshot,
      acceptedCount: acceptedEvents.length,
      duplicateCount,
      rejectedCount,
    };
  }
}
