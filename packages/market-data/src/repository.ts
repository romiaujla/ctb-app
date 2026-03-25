import { Prisma, PrismaClient } from '@prisma/client';

import {
  canonicalMarketDataEventSchema,
  marketDataHistoryQuerySchema,
  marketDataIngestDecisionSchema,
  marketDataIngestRunSchema,
  marketDataIngestSnapshotSchema,
  persistMarketDataInputSchema,
  rawMarketDataRecordSchema,
  type CanonicalMarketDataEvent,
  type MarketDataHistoryQuery,
  type MarketDataIngestDecision,
  type MarketDataIngestRun,
  type MarketDataIngestSnapshot,
  type MarketDataRepository,
  type PersistMarketDataInput,
  type RawMarketDataRecord,
} from './contracts.js';

type PersistenceClient = PrismaClient;

const ingestModeMap = {
  poll: 'POLL',
  subscription: 'SUBSCRIPTION',
  manual: 'MANUAL',
} as const;

const ingestStatusMap = {
  running: 'RUNNING',
  succeeded: 'SUCCEEDED',
  partial: 'PARTIAL',
  failed: 'FAILED',
} as const;

const eventTypeMap = {
  quote: 'QUOTE',
  trade: 'TRADE',
  bar: 'BAR',
  status: 'STATUS',
} as const;

const sessionStateMap = {
  preMarket: 'PRE_MARKET',
  regular: 'REGULAR',
  afterHours: 'AFTER_HOURS',
  closed: 'CLOSED',
} as const;

const qualityMap = {
  valid: 'VALID',
  partial: 'PARTIAL',
  stale: 'STALE',
  invalid: 'INVALID',
} as const;

const freshnessStateMap = {
  ready: 'READY',
  delayed: 'DELAYED',
  stale: 'STALE',
  partial: 'PARTIAL',
  invalid: 'INVALID',
  unavailable: 'UNAVAILABLE',
} as const;

const decisionTypeMap = {
  accepted: 'ACCEPTED',
  duplicate: 'DUPLICATE',
  rejected: 'REJECTED',
} as const;

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function mapIngestRun(
  record: Awaited<
    ReturnType<PersistenceClient['marketDataIngestRun']['findUniqueOrThrow']>
  >,
): MarketDataIngestRun {
  return marketDataIngestRunSchema.parse({
    ingestRunId: record.id,
    provider: record.provider,
    ingestMode: record.ingestMode.toLowerCase(),
    status: record.status.toLowerCase(),
    adapterVersion: record.adapterVersion,
    startedAt: record.startedAt.toISOString(),
    completedAt: record.completedAt?.toISOString() ?? null,
    requestedInstruments: asStringArray(record.requestedInstruments),
    notes: record.notes,
  });
}

function mapRawRecord(
  record: Awaited<
    ReturnType<PersistenceClient['rawMarketDataRecord']['findFirstOrThrow']>
  >,
): RawMarketDataRecord {
  return rawMarketDataRecordSchema.parse({
    rawRecordId: record.id,
    ingestRunId: record.ingestRunId,
    provider: record.provider,
    providerSymbol: record.providerSymbol,
    providerEventId: record.providerEventId,
    receivedTimestamp: record.receivedTimestamp.toISOString(),
    providerTimestamp: record.providerTimestamp?.toISOString() ?? null,
    adapterVersion: record.adapterVersion,
    payload: record.payload,
  });
}

function mapCanonicalEvent(
  record: Awaited<
    ReturnType<PersistenceClient['marketDataEvent']['findFirstOrThrow']>
  >,
): CanonicalMarketDataEvent {
  return canonicalMarketDataEventSchema.parse({
    marketDataEventId: record.id,
    eventId: record.eventId,
    ingestRunId: record.ingestRunId,
    rawRecordId: record.rawRecordId,
    eventType: record.eventType.toLowerCase(),
    instrumentId: record.instrumentId,
    symbol: record.symbol,
    provider: record.provider,
    providerEventId: record.providerEventId,
    providerTimestamp: record.providerTimestamp.toISOString(),
    observedTimestamp: record.observedTimestamp.toISOString(),
    normalizedTimestamp: record.normalizedTimestamp.toISOString(),
    sessionState: normalizeSessionState(record.sessionState),
    quality: record.quality.toLowerCase(),
    freshnessState: record.freshnessState.toLowerCase(),
    sourceLatencyMs: record.sourceLatencyMs,
    rawReference: record.rawReference,
    normalizationVersion: record.normalizationVersion,
    payload: record.payload,
    persistedTimestamp: record.persistedTimestamp.toISOString(),
  });
}

function mapDecision(
  record: Awaited<
    ReturnType<
      PersistenceClient['marketDataIngestDecision']['findFirstOrThrow']
    >
  >,
): MarketDataIngestDecision {
  return marketDataIngestDecisionSchema.parse({
    ingestDecisionId: record.id,
    ingestRunId: record.ingestRunId,
    rawRecordId: record.rawRecordId,
    marketDataEventId: record.marketDataEventId,
    decisionType: record.decisionType.toLowerCase(),
    duplicateKey: record.duplicateKey,
    rejectionReason: record.rejectionReason,
    freshnessState: record.freshnessState?.toLowerCase() ?? null,
    quality: record.quality?.toLowerCase() ?? null,
    decidedTimestamp: record.decidedTimestamp.toISOString(),
  });
}

function normalizeSessionState(
  value: string,
): CanonicalMarketDataEvent['sessionState'] {
  switch (value) {
    case 'PRE_MARKET':
      return 'preMarket';
    case 'AFTER_HOURS':
      return 'afterHours';
    case 'REGULAR':
      return 'regular';
    default:
      return 'closed';
  }
}

export class PrismaMarketDataRepository implements MarketDataRepository {
  constructor(private readonly client: PersistenceClient) {}

  async persist(
    input: PersistMarketDataInput,
  ): Promise<MarketDataIngestSnapshot> {
    const parsedInput: PersistMarketDataInput =
      persistMarketDataInputSchema.parse(input);

    await this.client.$transaction(async (transaction) => {
      await transaction.marketDataIngestRun.upsert({
        where: { id: parsedInput.ingestRun.ingestRunId },
        update: {
          provider: parsedInput.ingestRun.provider,
          ingestMode: ingestModeMap[parsedInput.ingestRun.ingestMode],
          status: ingestStatusMap[parsedInput.ingestRun.status],
          adapterVersion: parsedInput.ingestRun.adapterVersion,
          startedAt: new Date(parsedInput.ingestRun.startedAt),
          completedAt: parsedInput.ingestRun.completedAt
            ? new Date(parsedInput.ingestRun.completedAt)
            : null,
          requestedInstruments: parsedInput.ingestRun.requestedInstruments,
          notes: parsedInput.ingestRun.notes,
        },
        create: {
          id: parsedInput.ingestRun.ingestRunId,
          provider: parsedInput.ingestRun.provider,
          ingestMode: ingestModeMap[parsedInput.ingestRun.ingestMode],
          status: ingestStatusMap[parsedInput.ingestRun.status],
          adapterVersion: parsedInput.ingestRun.adapterVersion,
          startedAt: new Date(parsedInput.ingestRun.startedAt),
          completedAt: parsedInput.ingestRun.completedAt
            ? new Date(parsedInput.ingestRun.completedAt)
            : null,
          requestedInstruments: parsedInput.ingestRun.requestedInstruments,
          notes: parsedInput.ingestRun.notes,
        },
      });

      for (const rawRecord of parsedInput.rawRecords) {
        await transaction.rawMarketDataRecord.upsert({
          where: { id: rawRecord.rawRecordId },
          update: {
            ingestRunId: rawRecord.ingestRunId,
            provider: rawRecord.provider,
            providerSymbol: rawRecord.providerSymbol,
            providerEventId: rawRecord.providerEventId,
            receivedTimestamp: new Date(rawRecord.receivedTimestamp),
            providerTimestamp: rawRecord.providerTimestamp
              ? new Date(rawRecord.providerTimestamp)
              : null,
            adapterVersion: rawRecord.adapterVersion,
            payload: rawRecord.payload as Prisma.InputJsonValue,
          },
          create: {
            id: rawRecord.rawRecordId,
            ingestRunId: rawRecord.ingestRunId,
            provider: rawRecord.provider,
            providerSymbol: rawRecord.providerSymbol,
            providerEventId: rawRecord.providerEventId,
            receivedTimestamp: new Date(rawRecord.receivedTimestamp),
            providerTimestamp: rawRecord.providerTimestamp
              ? new Date(rawRecord.providerTimestamp)
              : null,
            adapterVersion: rawRecord.adapterVersion,
            payload: rawRecord.payload as Prisma.InputJsonValue,
          },
        });
      }

      for (const canonicalEvent of parsedInput.canonicalEvents) {
        await transaction.marketDataEvent.upsert({
          where: { id: canonicalEvent.marketDataEventId },
          update: {
            eventId: canonicalEvent.eventId,
            ingestRunId: canonicalEvent.ingestRunId,
            rawRecordId: canonicalEvent.rawRecordId,
            eventType: eventTypeMap[canonicalEvent.eventType],
            instrumentId: canonicalEvent.instrumentId,
            symbol: canonicalEvent.symbol,
            provider: canonicalEvent.provider,
            providerEventId: canonicalEvent.providerEventId,
            providerTimestamp: new Date(canonicalEvent.providerTimestamp),
            observedTimestamp: new Date(canonicalEvent.observedTimestamp),
            normalizedTimestamp: new Date(canonicalEvent.normalizedTimestamp),
            sessionState: sessionStateMap[canonicalEvent.sessionState],
            quality: qualityMap[canonicalEvent.quality],
            freshnessState: freshnessStateMap[canonicalEvent.freshnessState],
            sourceLatencyMs: canonicalEvent.sourceLatencyMs,
            rawReference: canonicalEvent.rawReference,
            normalizationVersion: canonicalEvent.normalizationVersion,
            payload: canonicalEvent.payload as Prisma.InputJsonValue,
            persistedTimestamp: new Date(canonicalEvent.persistedTimestamp),
          },
          create: {
            id: canonicalEvent.marketDataEventId,
            eventId: canonicalEvent.eventId,
            ingestRunId: canonicalEvent.ingestRunId,
            rawRecordId: canonicalEvent.rawRecordId,
            eventType: eventTypeMap[canonicalEvent.eventType],
            instrumentId: canonicalEvent.instrumentId,
            symbol: canonicalEvent.symbol,
            provider: canonicalEvent.provider,
            providerEventId: canonicalEvent.providerEventId,
            providerTimestamp: new Date(canonicalEvent.providerTimestamp),
            observedTimestamp: new Date(canonicalEvent.observedTimestamp),
            normalizedTimestamp: new Date(canonicalEvent.normalizedTimestamp),
            sessionState: sessionStateMap[canonicalEvent.sessionState],
            quality: qualityMap[canonicalEvent.quality],
            freshnessState: freshnessStateMap[canonicalEvent.freshnessState],
            sourceLatencyMs: canonicalEvent.sourceLatencyMs,
            rawReference: canonicalEvent.rawReference,
            normalizationVersion: canonicalEvent.normalizationVersion,
            payload: canonicalEvent.payload as Prisma.InputJsonValue,
            persistedTimestamp: new Date(canonicalEvent.persistedTimestamp),
          },
        });
      }

      for (const decision of parsedInput.ingestDecisions) {
        await transaction.marketDataIngestDecision.upsert({
          where: { id: decision.ingestDecisionId },
          update: {
            ingestRunId: decision.ingestRunId,
            rawRecordId: decision.rawRecordId,
            marketDataEventId: decision.marketDataEventId,
            decisionType: decisionTypeMap[decision.decisionType],
            duplicateKey: decision.duplicateKey,
            rejectionReason: decision.rejectionReason,
            freshnessState: decision.freshnessState
              ? freshnessStateMap[decision.freshnessState]
              : null,
            quality: decision.quality ? qualityMap[decision.quality] : null,
            decidedTimestamp: new Date(decision.decidedTimestamp),
          },
          create: {
            id: decision.ingestDecisionId,
            ingestRunId: decision.ingestRunId,
            rawRecordId: decision.rawRecordId,
            marketDataEventId: decision.marketDataEventId,
            decisionType: decisionTypeMap[decision.decisionType],
            duplicateKey: decision.duplicateKey,
            rejectionReason: decision.rejectionReason,
            freshnessState: decision.freshnessState
              ? freshnessStateMap[decision.freshnessState]
              : null,
            quality: decision.quality ? qualityMap[decision.quality] : null,
            decidedTimestamp: new Date(decision.decidedTimestamp),
          },
        });
      }
    });

    const snapshot = await this.getIngestSnapshot(
      parsedInput.ingestRun.ingestRunId,
    );
    if (!snapshot) {
      throw new Error(
        `Market-data ingest snapshot ${parsedInput.ingestRun.ingestRunId} was not found after persistence.`,
      );
    }

    return snapshot;
  }

  async getIngestSnapshot(
    ingestRunId: string,
  ): Promise<MarketDataIngestSnapshot | null> {
    const ingestRun = await this.client.marketDataIngestRun.findUnique({
      where: { id: ingestRunId },
    });

    if (!ingestRun) {
      return null;
    }

    const [rawRecords, canonicalEvents, ingestDecisions] = await Promise.all([
      this.client.rawMarketDataRecord.findMany({
        where: { ingestRunId },
        orderBy: { receivedTimestamp: 'asc' },
      }),
      this.client.marketDataEvent.findMany({
        where: { ingestRunId },
        orderBy: { normalizedTimestamp: 'asc' },
      }),
      this.client.marketDataIngestDecision.findMany({
        where: { ingestRunId },
        orderBy: { decidedTimestamp: 'asc' },
      }),
    ]);

    return marketDataIngestSnapshotSchema.parse({
      ingestRun: mapIngestRun(ingestRun),
      rawRecords: rawRecords.map((record) => mapRawRecord(record)),
      canonicalEvents: canonicalEvents.map((record) =>
        mapCanonicalEvent(record),
      ),
      ingestDecisions: ingestDecisions.map((record) => mapDecision(record)),
    });
  }

  async getRecentIngestRuns(limit = 10): Promise<MarketDataIngestRun[]> {
    const records = await this.client.marketDataIngestRun.findMany({
      take: limit,
      orderBy: { startedAt: 'desc' },
    });

    return records.map((record) => mapIngestRun(record));
  }

  async getRecentIngestDecisions(
    limit = 20,
  ): Promise<MarketDataIngestDecision[]> {
    const records = await this.client.marketDataIngestDecision.findMany({
      take: limit,
      orderBy: { decidedTimestamp: 'desc' },
    });

    return records.map((record) => mapDecision(record));
  }

  async getCanonicalEventHistory(
    query?: MarketDataHistoryQuery,
  ): Promise<CanonicalMarketDataEvent[]> {
    const parsedQuery: MarketDataHistoryQuery =
      marketDataHistoryQuerySchema.parse(query ?? {});
    const records = await this.client.marketDataEvent.findMany({
      where: {
        instrumentId: parsedQuery.instrumentId,
        ingestRunId: parsedQuery.ingestRunId,
        eventType: parsedQuery.eventType
          ? eventTypeMap[parsedQuery.eventType]
          : undefined,
        normalizedTimestamp: {
          gte: parsedQuery.fromTimestamp
            ? new Date(parsedQuery.fromTimestamp)
            : undefined,
          lte: parsedQuery.toTimestamp
            ? new Date(parsedQuery.toTimestamp)
            : undefined,
        },
      },
      take: parsedQuery.limit ?? 100,
      orderBy: { normalizedTimestamp: 'asc' },
    });

    return records.map((record) => mapCanonicalEvent(record));
  }
}
