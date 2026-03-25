import { z } from 'zod';

export const dependencyDescriptorSchema = z.object({
  name: z.enum(['postgres', 'redis']),
  url: z.string().url(),
  state: z.enum(['configured', 'placeholder']),
});

export const serviceRuntimeDescriptorSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  startupMessage: z.string().min(1),
  dependencies: z.array(dependencyDescriptorSchema).min(1),
});

export const serviceHeartbeatSchema = z.object({
  service: z.string().min(1),
  startedAt: z.string().datetime(),
  dependencies: z.array(z.enum(['postgres', 'redis'])).min(1),
});

export const runtimeEnvironmentSchema = z.object({
  PORT: z.coerce.number().int().min(0).default(3010),
  POSTGRES_URL: z.string().url(),
  REDIS_URL: z.string().url(),
});

export const simulatorQueueReservationSchema = z.object({
  accepted: z.boolean(),
  eventId: z.string().min(1),
  queueKey: z.string().min(1),
  dedupeKey: z.string().min(1),
  pendingItems: z.number().int().min(0),
});

const decimalPattern = /^-?\d+(?:\.\d+)?$/;

export const decimalValueSchema = z.string().regex(decimalPattern);
export const isoTimestampSchema = z.string().datetime();
export const currencyCodeSchema = z.string().trim().length(3).toUpperCase();

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
export const strategyDecisionStateSchema = z.enum([
  'trade-intent-emitted',
  'skipped',
  'blocked',
  'invalid-input',
]);
export const strategySignalDirectionSchema = z.enum([
  'bullish',
  'bearish',
  'neutral',
]);

export const marketDataQuotePayloadSchema = z.object({
  bidPrice: decimalValueSchema.nullable(),
  askPrice: decimalValueSchema.nullable(),
  bidSize: z.number().int().nonnegative().nullable(),
  askSize: z.number().int().nonnegative().nullable(),
  midPrice: decimalValueSchema.nullable(),
  lastTradePrice: decimalValueSchema.nullable(),
});

export const marketDataTradePayloadSchema = z.object({
  tradePrice: decimalValueSchema.nullable(),
  tradeSize: z.number().int().nonnegative().nullable(),
  tradeCondition: z.string().min(1).nullable(),
  exchange: z.string().min(1).nullable(),
});

export const marketDataBarPayloadSchema = z.object({
  open: decimalValueSchema.nullable(),
  high: decimalValueSchema.nullable(),
  low: decimalValueSchema.nullable(),
  close: decimalValueSchema.nullable(),
  volume: z.number().int().nonnegative().nullable(),
  vwap: decimalValueSchema.nullable(),
  barStartTimestamp: isoTimestampSchema.nullable(),
  barEndTimestamp: isoTimestampSchema.nullable(),
  barResolution: z.string().min(1).nullable(),
});

export const marketDataStatusPayloadSchema = z.object({
  tradingStatus: z.string().min(1).nullable(),
  haltReason: z.string().min(1).nullable(),
  tradable: z.boolean().nullable(),
});

export const marketDataPayloadSchema = z.discriminatedUnion('eventType', [
  z.object({
    eventType: z.literal('quote'),
    payload: marketDataQuotePayloadSchema,
  }),
  z.object({
    eventType: z.literal('trade'),
    payload: marketDataTradePayloadSchema,
  }),
  z.object({
    eventType: z.literal('bar'),
    payload: marketDataBarPayloadSchema,
  }),
  z.object({
    eventType: z.literal('status'),
    payload: marketDataStatusPayloadSchema,
  }),
]);

export const canonicalMarketDataEventSchema = z
  .object({
    eventId: z.string().min(1),
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
  })
  .and(marketDataPayloadSchema);

export const marketDataNormalizationInputSchema = z
  .object({
    ingestRunId: z.string().min(1),
    rawRecordId: z.string().min(1),
    provider: z.string().min(1),
    providerSymbol: z.string().min(1).nullable(),
    providerEventId: z.string().min(1).nullable(),
    instrumentId: z.string().min(1),
    symbol: z.string().min(1),
    providerTimestamp: isoTimestampSchema,
    observedTimestamp: isoTimestampSchema,
    normalizedTimestamp: isoTimestampSchema.optional(),
    sessionState: marketDataSessionStateSchema,
    rawReference: z.string().min(1).nullable(),
    normalizationVersion: z.string().min(1),
  })
  .and(marketDataPayloadSchema);

export const simulationAccountStatusSchema = z.enum([
  'active',
  'paused',
  'closed',
]);
export const simulatedOrderSideSchema = z.enum(['buy', 'sell']);
export const simulatedOrderTypeSchema = z.enum([
  'market',
  'limit',
  'stop',
  'stop-limit',
]);
export const simulatedOrderStatusSchema = z.enum([
  'accepted',
  'partially-filled',
  'filled',
  'canceled',
  'rejected',
]);
export const simulatorEventTypeSchema = z.enum([
  'trade-intent-accepted',
  'trade-intent-rejected',
  'order-submitted',
  'order-partially-filled',
  'order-filled',
  'order-canceled',
  'position-revalued',
  'portfolio-snapshotted',
  'account-adjusted',
]);
export const simulatorPersistenceEntitySchema = z.enum([
  'simulation-account',
  'simulated-order',
  'simulated-fill',
  'simulator-event',
  'position',
  'portfolio',
  'portfolio-snapshot',
]);
export const simulatorPersistenceStorageKindSchema = z.enum([
  'append-only',
  'current-state',
  'point-in-time-snapshot',
]);
export const simulatorPersistenceTruthKindSchema = z.enum([
  'system-of-record',
  'derived-view',
]);

export const simulationAccountSchema = z.object({
  simulationAccountId: z.string().min(1),
  baseCurrency: currencyCodeSchema,
  startingBalance: decimalValueSchema,
  currentCashBalance: decimalValueSchema,
  status: simulationAccountStatusSchema,
  createdTimestamp: isoTimestampSchema,
  configurationVersion: z.string().min(1),
});

export const portfolioSchema = z.object({
  portfolioId: z.string().min(1),
  simulationAccountId: z.string().min(1),
  netLiquidationValue: decimalValueSchema,
  grossExposure: decimalValueSchema,
  realizedPnl: decimalValueSchema,
  unrealizedPnl: decimalValueSchema,
  valuationTimestamp: isoTimestampSchema,
});

export const positionSchema = z.object({
  positionId: z.string().min(1),
  simulationAccountId: z.string().min(1),
  instrumentId: z.string().min(1),
  quantity: decimalValueSchema,
  averageEntryCost: decimalValueSchema,
  marketValue: decimalValueSchema,
  realizedPnl: decimalValueSchema,
  unrealizedPnl: decimalValueSchema,
  lastUpdatedTimestamp: isoTimestampSchema,
});

export const simulatedOrderSchema = z.object({
  simulatedOrderId: z.string().min(1),
  simulationAccountId: z.string().min(1),
  tradeIntentId: z.string().min(1),
  instrumentId: z.string().min(1),
  side: simulatedOrderSideSchema,
  orderType: simulatedOrderTypeSchema,
  requestedQuantity: decimalValueSchema,
  acceptedQuantity: decimalValueSchema,
  status: simulatedOrderStatusSchema,
  submittedTimestamp: isoTimestampSchema,
  executionModelVersion: z.string().min(1),
});

export const simulatedFillSchema = z.object({
  simulatedFillId: z.string().min(1),
  simulatedOrderId: z.string().min(1),
  simulationAccountId: z.string().min(1),
  instrumentId: z.string().min(1),
  fillQuantity: decimalValueSchema,
  fillPrice: decimalValueSchema,
  simulatedFeeAmount: decimalValueSchema,
  slippageAmount: decimalValueSchema,
  fillTimestamp: isoTimestampSchema,
});

export const portfolioSnapshotSchema = z.object({
  snapshotId: z.string().min(1),
  simulationAccountId: z.string().min(1),
  cashBalance: decimalValueSchema,
  grossExposure: decimalValueSchema,
  netLiquidationValue: decimalValueSchema,
  realizedPnl: decimalValueSchema,
  unrealizedPnl: decimalValueSchema,
  timestamp: isoTimestampSchema,
  sourceEventId: z.string().min(1),
});

export const tradeIntentAcceptedEventPayloadSchema = z.object({
  tradeIntentId: z.string().min(1),
  instrumentId: z.string().min(1),
  side: simulatedOrderSideSchema,
  requestedQuantity: decimalValueSchema,
});

export const tradeIntentRejectedEventPayloadSchema = z.object({
  tradeIntentId: z.string().min(1),
  instrumentId: z.string().min(1),
  rejectionReason: z.string().min(1),
});

export const orderSubmittedEventPayloadSchema = z.object({
  simulatedOrderId: z.string().min(1),
  tradeIntentId: z.string().min(1),
  acceptedQuantity: decimalValueSchema,
});

export const orderPartiallyFilledEventPayloadSchema = z.object({
  simulatedOrderId: z.string().min(1),
  simulatedFillId: z.string().min(1),
  cumulativeFilledQuantity: decimalValueSchema,
  remainingQuantity: decimalValueSchema,
});

export const orderFilledEventPayloadSchema = z.object({
  simulatedOrderId: z.string().min(1),
  simulatedFillId: z.string().min(1),
  cumulativeFilledQuantity: decimalValueSchema,
});

export const orderCanceledEventPayloadSchema = z.object({
  simulatedOrderId: z.string().min(1),
  cancellationReason: z.string().min(1),
});

export const positionRevaluedEventPayloadSchema = z.object({
  positionId: z.string().min(1),
  instrumentId: z.string().min(1),
  marketValue: decimalValueSchema,
  unrealizedPnl: decimalValueSchema,
});

export const portfolioSnapshottedEventPayloadSchema = z.object({
  snapshotId: z.string().min(1),
  netLiquidationValue: decimalValueSchema,
});

export const accountAdjustedEventPayloadSchema = z.object({
  adjustmentId: z.string().min(1),
  reason: z.string().min(1),
  amount: decimalValueSchema,
});

export const simulatorEventPayloadSchema = z.discriminatedUnion('eventType', [
  z.object({
    eventType: z.literal('trade-intent-accepted'),
    payload: tradeIntentAcceptedEventPayloadSchema,
  }),
  z.object({
    eventType: z.literal('trade-intent-rejected'),
    payload: tradeIntentRejectedEventPayloadSchema,
  }),
  z.object({
    eventType: z.literal('order-submitted'),
    payload: orderSubmittedEventPayloadSchema,
  }),
  z.object({
    eventType: z.literal('order-partially-filled'),
    payload: orderPartiallyFilledEventPayloadSchema,
  }),
  z.object({
    eventType: z.literal('order-filled'),
    payload: orderFilledEventPayloadSchema,
  }),
  z.object({
    eventType: z.literal('order-canceled'),
    payload: orderCanceledEventPayloadSchema,
  }),
  z.object({
    eventType: z.literal('position-revalued'),
    payload: positionRevaluedEventPayloadSchema,
  }),
  z.object({
    eventType: z.literal('portfolio-snapshotted'),
    payload: portfolioSnapshottedEventPayloadSchema,
  }),
  z.object({
    eventType: z.literal('account-adjusted'),
    payload: accountAdjustedEventPayloadSchema,
  }),
]);

export const simulatorEventEnvelopeSchema = z
  .object({
    simulatorEventId: z.string().min(1),
    simulationAccountId: z.string().min(1),
    eventType: simulatorEventTypeSchema,
    eventTimestamp: isoTimestampSchema,
    recordedTimestamp: isoTimestampSchema,
    sequenceKey: z.string().min(1),
    correlationId: z.string().min(1).nullable(),
    causationId: z.string().min(1).nullable(),
    schemaVersion: z.number().int().positive(),
  })
  .and(simulatorEventPayloadSchema);

export const simulatorPersistenceContractSchema = z.object({
  entity: simulatorPersistenceEntitySchema,
  truthKind: simulatorPersistenceTruthKindSchema,
  storageKind: simulatorPersistenceStorageKindSchema,
  durable: z.boolean(),
  identifierFields: z.array(z.string().min(1)).min(1),
  systemOfRecord: z.boolean(),
  description: z.string().min(1),
});

export const simulatorPortfolioViewSchema = z.object({
  simulationAccount: simulationAccountSchema,
  portfolio: portfolioSchema.nullable(),
  positions: z.array(positionSchema),
  openOrders: z.array(simulatedOrderSchema),
  recentFills: z.array(simulatedFillSchema),
});

export const simulatorPortfolioHistorySchema = z.object({
  orders: z.array(simulatedOrderSchema),
  events: z.array(simulatorEventEnvelopeSchema),
  fills: z.array(simulatedFillSchema),
  snapshots: z.array(portfolioSnapshotSchema),
});

export const persistSimulatorAccountingInputSchema = z.object({
  simulationAccount: simulationAccountSchema,
  orders: z.array(simulatedOrderSchema).optional(),
  fills: z.array(simulatedFillSchema).optional(),
  events: z.array(simulatorEventEnvelopeSchema),
  positions: z.array(positionSchema).optional(),
  portfolio: portfolioSchema.optional(),
  snapshots: z.array(portfolioSnapshotSchema).optional(),
});

export const replayableSimulatorStateSchema = z.object({
  simulationAccount: simulationAccountSchema,
  orders: z.array(simulatedOrderSchema),
  events: z.array(simulatorEventEnvelopeSchema),
  fills: z.array(simulatedFillSchema),
  snapshots: z.array(portfolioSnapshotSchema).optional(),
  currentView: simulatorPortfolioViewSchema.nullable().optional(),
});

export const simulatorReplayPositionSchema = z.object({
  instrumentId: z.string().min(1),
  quantity: decimalValueSchema,
  averageEntryCost: decimalValueSchema,
  marketValue: decimalValueSchema,
  realizedPnl: decimalValueSchema,
  unrealizedPnl: decimalValueSchema,
});

export const simulatorReplayResultSchema = z.object({
  simulationAccountId: z.string().min(1),
  cashBalance: decimalValueSchema,
  grossExposure: decimalValueSchema,
  netLiquidationValue: decimalValueSchema,
  realizedPnl: decimalValueSchema,
  unrealizedPnl: decimalValueSchema,
  processedEventIds: z.array(z.string().min(1)),
  processedFillIds: z.array(z.string().min(1)),
  positions: z.array(simulatorReplayPositionSchema),
  replayDigest: z.string().min(1),
});

export const simulatorReplayVerificationSchema = z.object({
  replay: simulatorReplayResultSchema,
  latestSnapshotId: z.string().min(1).nullable(),
  currentViewMatched: z.boolean(),
  latestSnapshotMatched: z.boolean(),
});

const strategyMetadataValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const strategyIndicatorSnapshotSchema = z.object({
  name: z.string().min(1),
  value: decimalValueSchema.nullable(),
  interpretation: z.string().min(1).nullable(),
  sourceVersion: z.string().min(1).nullable(),
});

export const strategyMarketContextSchema = z.object({
  latestEventIds: z.array(z.string().min(1)),
  freshnessState: marketDataFreshnessStateSchema,
  summary: z.string().min(1),
  indicatorSnapshots: z.array(strategyIndicatorSnapshotSchema),
});

export const strategyPortfolioContextSchema = z.object({
  simulationAccountId: z.string().min(1),
  cashAvailable: decimalValueSchema,
  currentPositionQuantity: decimalValueSchema,
  averageCostBasis: decimalValueSchema.nullable(),
  instrumentExposure: decimalValueSchema,
  portfolioExposure: decimalValueSchema,
  netLiquidationValue: decimalValueSchema,
  openIntentCount: z.number().int().min(0),
});

export const strategyRiskContextSchema = z.object({
  maxPositionQuantity: decimalValueSchema,
  maxCapitalAtRisk: decimalValueSchema,
  sessionEligible: z.boolean(),
  blockedReasons: z.array(z.string().min(1)),
  sizingPolicyVersion: z.string().min(1),
});

export const strategyDataTrustContextSchema = z.object({
  readinessState: marketDataFreshnessStateSchema,
  blockedReason: z.string().min(1).nullable(),
  normalizationVersion: z.string().min(1).nullable(),
  replayVersion: z.string().min(1).nullable(),
});

export const strategyEvaluationInputSchema = z.object({
  evaluationId: z.string().min(1),
  strategyId: z.string().min(1),
  strategyVersion: z.string().min(1),
  evaluationTimestamp: isoTimestampSchema,
  instrumentId: z.string().min(1),
  symbol: z.string().min(1),
  sessionState: marketDataSessionStateSchema,
  marketContext: strategyMarketContextSchema,
  portfolioContext: strategyPortfolioContextSchema,
  riskContext: strategyRiskContextSchema,
  dataTrust: strategyDataTrustContextSchema,
});

export const strategyInputReferenceSchema = z.object({
  marketEventIds: z.array(z.string().min(1)),
  simulationAccountId: z.string().min(1),
  portfolioSnapshotId: z.string().min(1).nullable(),
  riskPolicyVersion: z.string().min(1),
});

export const strategySignalSummarySchema = z.object({
  signalCode: z.string().min(1),
  direction: strategySignalDirectionSchema,
  strength: decimalValueSchema.nullable(),
  summary: z.string().min(1),
});

export const strategyGuardrailResultSchema = z.object({
  guardrailCode: z.string().min(1),
  status: z.enum(['passed', 'blocked', 'not-applicable']),
  reason: z.string().min(1).nullable(),
  detail: z.string().min(1).nullable(),
});

export const strategyTradeIntentSchema = z.object({
  tradeIntentId: z.string().min(1),
  strategyEvaluationId: z.string().min(1),
  strategyId: z.string().min(1),
  strategyVersion: z.string().min(1),
  evaluationCorrelationId: z.string().min(1),
  instrumentId: z.string().min(1),
  symbol: z.string().min(1),
  side: simulatedOrderSideSchema,
  requestedQuantity: decimalValueSchema,
  orderType: simulatedOrderTypeSchema,
  intentTimestamp: isoTimestampSchema,
  intentMetadata: z.record(strategyMetadataValueSchema),
});

export const strategyEvidenceRecordSchema = z.object({
  evaluationId: z.string().min(1),
  strategyId: z.string().min(1),
  strategyVersion: z.string().min(1),
  evaluationTimestamp: isoTimestampSchema,
  inputReference: strategyInputReferenceSchema,
  decisionState: strategyDecisionStateSchema,
  signalSummary: z.array(strategySignalSummarySchema),
  guardrailSummary: z.array(strategyGuardrailResultSchema),
  decisionReason: z.string().min(1),
  tradeIntentReference: z.string().min(1).nullable(),
});

export const strategyEvaluationRecordSchema = z.object({
  input: strategyEvaluationInputSchema,
  evidence: strategyEvidenceRecordSchema,
  tradeIntent: strategyTradeIntentSchema.nullable(),
});

export const strategyEvaluationQueryOptionsSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  strategyId: z.string().min(1).optional(),
  instrumentId: z.string().min(1).optional(),
  decisionState: strategyDecisionStateSchema.optional(),
});
