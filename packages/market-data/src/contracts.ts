import { z } from 'zod';

import { isoTimestampSchema } from '@ctb/schemas';

export const marketDataIngestModeSchema = z.enum([
  'poll',
  'subscription',
  'manual',
]);
export const marketDataIngestStatusSchema = z.enum([
  'running',
  'succeeded',
  'partial',
  'failed',
]);
export const marketDataEventTypeSchema = z.enum([
  'quote',
  'trade',
  'bar',
  'status',
]);
export const marketDataSessionStateSchema = z.enum([
  'preMarket',
  'regular',
  'afterHours',
  'closed',
]);
export const marketDataQualitySchema = z.enum([
  'valid',
  'partial',
  'stale',
  'invalid',
]);
export const marketDataFreshnessStateSchema = z.enum([
  'ready',
  'delayed',
  'stale',
  'partial',
  'invalid',
  'unavailable',
]);
export const marketDataIngestDecisionTypeSchema = z.enum([
  'accepted',
  'duplicate',
  'rejected',
]);

export const marketDataIngestRunSchema = z.object({
  ingestRunId: z.string().min(1),
  provider: z.string().min(1),
  ingestMode: marketDataIngestModeSchema,
  status: marketDataIngestStatusSchema,
  adapterVersion: z.string().min(1),
  startedAt: isoTimestampSchema,
  completedAt: isoTimestampSchema.nullable(),
  requestedInstruments: z.array(z.string().min(1)),
  notes: z.string().min(1).nullable(),
});

export const rawMarketDataRecordSchema = z.object({
  rawRecordId: z.string().min(1),
  ingestRunId: z.string().min(1),
  provider: z.string().min(1),
  providerSymbol: z.string().min(1).nullable(),
  providerEventId: z.string().min(1).nullable(),
  receivedTimestamp: isoTimestampSchema,
  providerTimestamp: isoTimestampSchema.nullable(),
  adapterVersion: z.string().min(1),
  payload: z.unknown(),
});

export const canonicalMarketDataEventSchema = z.object({
  marketDataEventId: z.string().min(1),
  eventId: z.string().min(1),
  ingestRunId: z.string().min(1),
  rawRecordId: z.string().min(1).nullable(),
  eventType: marketDataEventTypeSchema,
  instrumentId: z.string().min(1),
  symbol: z.string().min(1),
  provider: z.string().min(1),
  providerEventId: z.string().min(1).nullable(),
  providerTimestamp: isoTimestampSchema,
  observedTimestamp: isoTimestampSchema,
  normalizedTimestamp: isoTimestampSchema,
  sessionState: marketDataSessionStateSchema,
  quality: marketDataQualitySchema,
  freshnessState: marketDataFreshnessStateSchema,
  sourceLatencyMs: z.number().int().nonnegative().nullable(),
  rawReference: z.string().min(1).nullable(),
  normalizationVersion: z.string().min(1),
  payload: z.unknown(),
  persistedTimestamp: isoTimestampSchema,
});

export const marketDataIngestDecisionSchema = z.object({
  ingestDecisionId: z.string().min(1),
  ingestRunId: z.string().min(1),
  rawRecordId: z.string().min(1).nullable(),
  marketDataEventId: z.string().min(1).nullable(),
  decisionType: marketDataIngestDecisionTypeSchema,
  duplicateKey: z.string().min(1).nullable(),
  rejectionReason: z.string().min(1).nullable(),
  freshnessState: marketDataFreshnessStateSchema.nullable(),
  quality: marketDataQualitySchema.nullable(),
  decidedTimestamp: isoTimestampSchema,
});

export const persistMarketDataInputSchema = z.object({
  ingestRun: marketDataIngestRunSchema,
  rawRecords: z.array(rawMarketDataRecordSchema).default([]),
  canonicalEvents: z.array(canonicalMarketDataEventSchema).default([]),
  ingestDecisions: z.array(marketDataIngestDecisionSchema).default([]),
});

export const marketDataHistoryQuerySchema = z.object({
  instrumentId: z.string().min(1).optional(),
  eventType: marketDataEventTypeSchema.optional(),
  ingestRunId: z.string().min(1).optional(),
  fromTimestamp: isoTimestampSchema.optional(),
  toTimestamp: isoTimestampSchema.optional(),
  limit: z.number().int().positive().max(500).optional(),
});

export const marketDataIngestSnapshotSchema = z.object({
  ingestRun: marketDataIngestRunSchema,
  rawRecords: z.array(rawMarketDataRecordSchema),
  canonicalEvents: z.array(canonicalMarketDataEventSchema),
  ingestDecisions: z.array(marketDataIngestDecisionSchema),
});

export type MarketDataIngestMode = z.infer<typeof marketDataIngestModeSchema>;
export type MarketDataIngestStatus = z.infer<
  typeof marketDataIngestStatusSchema
>;
export type MarketDataEventType = z.infer<typeof marketDataEventTypeSchema>;
export type MarketDataSessionState = z.infer<
  typeof marketDataSessionStateSchema
>;
export type MarketDataQuality = z.infer<typeof marketDataQualitySchema>;
export type MarketDataFreshnessState = z.infer<
  typeof marketDataFreshnessStateSchema
>;
export type MarketDataIngestDecisionType = z.infer<
  typeof marketDataIngestDecisionTypeSchema
>;
export type MarketDataIngestRun = z.infer<typeof marketDataIngestRunSchema>;
export type RawMarketDataRecord = z.infer<typeof rawMarketDataRecordSchema>;
export type CanonicalMarketDataEvent = z.infer<
  typeof canonicalMarketDataEventSchema
>;
export type MarketDataIngestDecision = z.infer<
  typeof marketDataIngestDecisionSchema
>;
export type PersistMarketDataInput = z.infer<
  typeof persistMarketDataInputSchema
>;
export type MarketDataHistoryQuery = z.infer<
  typeof marketDataHistoryQuerySchema
>;
export type MarketDataIngestSnapshot = z.infer<
  typeof marketDataIngestSnapshotSchema
>;

export interface MarketDataRepository {
  persist(input: PersistMarketDataInput): Promise<MarketDataIngestSnapshot>;
  getIngestSnapshot(
    ingestRunId: string,
  ): Promise<MarketDataIngestSnapshot | null>;
  getRecentIngestRuns(limit?: number): Promise<MarketDataIngestRun[]>;
  getRecentIngestDecisions(limit?: number): Promise<MarketDataIngestDecision[]>;
  getCanonicalEventHistory(
    query?: MarketDataHistoryQuery,
  ): Promise<CanonicalMarketDataEvent[]>;
}
