export type DependencyName = 'postgres' | 'redis';
export type DependencyState = 'configured' | 'placeholder';

export interface DependencyDescriptor {
  name: DependencyName;
  url: string;
  state: DependencyState;
}

export interface ServiceRuntimeDescriptor {
  name: string;
  role: string;
  startupMessage: string;
  dependencies: DependencyDescriptor[];
}

export interface ServiceHeartbeat {
  service: string;
  startedAt: string;
  dependencies: DependencyName[];
}

export interface RuntimeConfig {
  serviceName: string;
  port: number;
  postgresUrl: string;
  redisUrl: string;
}

export type MarketDataEventType = 'quote' | 'trade' | 'bar' | 'status';
export type MarketDataSessionState =
  | 'preMarket'
  | 'regular'
  | 'afterHours'
  | 'closed';
export type MarketDataQuality = 'valid' | 'partial' | 'stale' | 'invalid';
export type MarketDataFreshnessState =
  | 'ready'
  | 'delayed'
  | 'stale'
  | 'partial'
  | 'invalid'
  | 'unavailable';

export interface MarketDataQuotePayload {
  bidPrice: DecimalValue | null;
  askPrice: DecimalValue | null;
  bidSize: number | null;
  askSize: number | null;
  midPrice: DecimalValue | null;
  lastTradePrice: DecimalValue | null;
}

export interface MarketDataTradePayload {
  tradePrice: DecimalValue | null;
  tradeSize: number | null;
  tradeCondition: string | null;
  exchange: string | null;
}

export interface MarketDataBarPayload {
  open: DecimalValue | null;
  high: DecimalValue | null;
  low: DecimalValue | null;
  close: DecimalValue | null;
  volume: number | null;
  vwap: DecimalValue | null;
  barStartTimestamp: IsoTimestamp | null;
  barEndTimestamp: IsoTimestamp | null;
  barResolution: string | null;
}

export interface MarketDataStatusPayload {
  tradingStatus: string | null;
  haltReason: string | null;
  tradable: boolean | null;
}

export interface MarketDataPayloadMap {
  quote: MarketDataQuotePayload;
  trade: MarketDataTradePayload;
  bar: MarketDataBarPayload;
  status: MarketDataStatusPayload;
}

export type MarketDataPayload = MarketDataPayloadMap[MarketDataEventType];

export interface CanonicalMarketDataEvent<
  TType extends MarketDataEventType = MarketDataEventType,
> {
  eventId: string;
  eventType: TType;
  instrumentId: string;
  symbol: string;
  provider: string;
  providerEventId: string | null;
  providerTimestamp: IsoTimestamp;
  observedTimestamp: IsoTimestamp;
  normalizedTimestamp: IsoTimestamp;
  sessionState: MarketDataSessionState;
  quality: MarketDataQuality;
  freshnessState: MarketDataFreshnessState;
  sourceLatencyMs: number | null;
  rawReference: string | null;
  normalizationVersion: string;
  payload: MarketDataPayloadMap[TType];
}

export interface MarketDataNormalizationInput<
  TType extends MarketDataEventType = MarketDataEventType,
> {
  ingestRunId: string;
  rawRecordId: string;
  provider: string;
  providerSymbol: string | null;
  providerEventId: string | null;
  instrumentId: string;
  symbol: string;
  eventType: TType;
  providerTimestamp: IsoTimestamp;
  observedTimestamp: IsoTimestamp;
  normalizedTimestamp?: IsoTimestamp;
  sessionState: MarketDataSessionState;
  rawReference: string | null;
  normalizationVersion: string;
  payload: MarketDataPayloadMap[TType];
}

export interface MarketDataFreshnessThresholdWindow {
  readyMs: number;
  delayedMs: number;
}

export interface MarketDataFreshnessThresholds {
  regular: Record<MarketDataEventType, MarketDataFreshnessThresholdWindow>;
  preMarket: Record<MarketDataEventType, MarketDataFreshnessThresholdWindow>;
  afterHours: Record<MarketDataEventType, MarketDataFreshnessThresholdWindow>;
  closed: Record<MarketDataEventType, MarketDataFreshnessThresholdWindow>;
  maxFutureSkewMs: number;
}

export interface SimulatorQueueReservation {
  accepted: boolean;
  eventId: string;
  queueKey: string;
  dedupeKey: string;
  pendingItems: number;
}

export type CurrencyCode = string;
export type DecimalValue = string;
export type IsoTimestamp = string;

export type SimulationAccountStatus = 'active' | 'paused' | 'closed';
export type SimulatedOrderSide = 'buy' | 'sell';
export type SimulatedOrderType = 'market' | 'limit' | 'stop' | 'stop-limit';
export type SimulatedOrderStatus =
  | 'accepted'
  | 'partially-filled'
  | 'filled'
  | 'canceled'
  | 'rejected';
export type SimulatorEventType =
  | 'trade-intent-accepted'
  | 'trade-intent-rejected'
  | 'order-submitted'
  | 'order-partially-filled'
  | 'order-filled'
  | 'order-canceled'
  | 'position-revalued'
  | 'portfolio-snapshotted'
  | 'account-adjusted';
export type SimulatorPersistenceEntity =
  | 'simulation-account'
  | 'simulated-order'
  | 'simulated-fill'
  | 'simulator-event'
  | 'position'
  | 'portfolio'
  | 'portfolio-snapshot';
export type SimulatorPersistenceStorageKind =
  | 'append-only'
  | 'current-state'
  | 'point-in-time-snapshot';
export type SimulatorPersistenceTruthKind = 'system-of-record' | 'derived-view';
export type StrategyDecisionState =
  | 'trade-intent-emitted'
  | 'skipped'
  | 'blocked'
  | 'invalid-input';
export type StrategySignalDirection = 'bullish' | 'bearish' | 'neutral';

export interface SimulationAccount {
  simulationAccountId: string;
  baseCurrency: CurrencyCode;
  startingBalance: DecimalValue;
  currentCashBalance: DecimalValue;
  status: SimulationAccountStatus;
  createdTimestamp: IsoTimestamp;
  configurationVersion: string;
}

export interface Portfolio {
  portfolioId: string;
  simulationAccountId: string;
  netLiquidationValue: DecimalValue;
  grossExposure: DecimalValue;
  realizedPnl: DecimalValue;
  unrealizedPnl: DecimalValue;
  valuationTimestamp: IsoTimestamp;
}

export interface Position {
  positionId: string;
  simulationAccountId: string;
  instrumentId: string;
  quantity: DecimalValue;
  averageEntryCost: DecimalValue;
  marketValue: DecimalValue;
  realizedPnl: DecimalValue;
  unrealizedPnl: DecimalValue;
  lastUpdatedTimestamp: IsoTimestamp;
}

export interface SimulatedOrder {
  simulatedOrderId: string;
  simulationAccountId: string;
  tradeIntentId: string;
  instrumentId: string;
  side: SimulatedOrderSide;
  orderType: SimulatedOrderType;
  requestedQuantity: DecimalValue;
  acceptedQuantity: DecimalValue;
  status: SimulatedOrderStatus;
  submittedTimestamp: IsoTimestamp;
  executionModelVersion: string;
}

export interface SimulatedFill {
  simulatedFillId: string;
  simulatedOrderId: string;
  simulationAccountId: string;
  instrumentId: string;
  fillQuantity: DecimalValue;
  fillPrice: DecimalValue;
  simulatedFeeAmount: DecimalValue;
  slippageAmount: DecimalValue;
  fillTimestamp: IsoTimestamp;
}

export interface PortfolioSnapshot {
  snapshotId: string;
  simulationAccountId: string;
  cashBalance: DecimalValue;
  grossExposure: DecimalValue;
  netLiquidationValue: DecimalValue;
  realizedPnl: DecimalValue;
  unrealizedPnl: DecimalValue;
  timestamp: IsoTimestamp;
  sourceEventId: string;
}

export interface TradeIntentAcceptedEventPayload {
  tradeIntentId: string;
  instrumentId: string;
  side: SimulatedOrderSide;
  requestedQuantity: DecimalValue;
}

export interface TradeIntentRejectedEventPayload {
  tradeIntentId: string;
  instrumentId: string;
  rejectionReason: string;
}

export interface OrderSubmittedEventPayload {
  simulatedOrderId: string;
  tradeIntentId: string;
  acceptedQuantity: DecimalValue;
}

export interface OrderPartiallyFilledEventPayload {
  simulatedOrderId: string;
  simulatedFillId: string;
  cumulativeFilledQuantity: DecimalValue;
  remainingQuantity: DecimalValue;
}

export interface OrderFilledEventPayload {
  simulatedOrderId: string;
  simulatedFillId: string;
  cumulativeFilledQuantity: DecimalValue;
}

export interface OrderCanceledEventPayload {
  simulatedOrderId: string;
  cancellationReason: string;
}

export interface PositionRevaluedEventPayload {
  positionId: string;
  instrumentId: string;
  marketValue: DecimalValue;
  unrealizedPnl: DecimalValue;
}

export interface PortfolioSnapshottedEventPayload {
  snapshotId: string;
  netLiquidationValue: DecimalValue;
}

export interface AccountAdjustedEventPayload {
  adjustmentId: string;
  reason: string;
  amount: DecimalValue;
}

export interface SimulatorEventPayloadMap {
  'trade-intent-accepted': TradeIntentAcceptedEventPayload;
  'trade-intent-rejected': TradeIntentRejectedEventPayload;
  'order-submitted': OrderSubmittedEventPayload;
  'order-partially-filled': OrderPartiallyFilledEventPayload;
  'order-filled': OrderFilledEventPayload;
  'order-canceled': OrderCanceledEventPayload;
  'position-revalued': PositionRevaluedEventPayload;
  'portfolio-snapshotted': PortfolioSnapshottedEventPayload;
  'account-adjusted': AccountAdjustedEventPayload;
}

export type SimulatorEventPayload =
  SimulatorEventPayloadMap[SimulatorEventType];

export interface SimulatorEventEnvelope<
  TType extends SimulatorEventType = SimulatorEventType,
> {
  simulatorEventId: string;
  simulationAccountId: string;
  eventType: TType;
  eventTimestamp: IsoTimestamp;
  recordedTimestamp: IsoTimestamp;
  sequenceKey: string;
  correlationId: string | null;
  causationId: string | null;
  schemaVersion: number;
  payload: SimulatorEventPayloadMap[TType];
}

export interface SimulatorPersistenceContract {
  entity: SimulatorPersistenceEntity;
  truthKind: SimulatorPersistenceTruthKind;
  storageKind: SimulatorPersistenceStorageKind;
  durable: boolean;
  identifierFields: string[];
  systemOfRecord: boolean;
  description: string;
}

export interface SimulatorHistoryQueryOptions {
  limit?: number;
  fromTimestamp?: IsoTimestamp;
  toTimestamp?: IsoTimestamp;
}

export interface SimulatorPortfolioView {
  simulationAccount: SimulationAccount;
  portfolio: Portfolio | null;
  positions: Position[];
  openOrders: SimulatedOrder[];
  recentFills: SimulatedFill[];
}

export interface SimulatorPortfolioHistory {
  orders: SimulatedOrder[];
  events: SimulatorEventEnvelope[];
  fills: SimulatedFill[];
  snapshots: PortfolioSnapshot[];
}

export interface PersistSimulatorAccountingInput {
  simulationAccount: SimulationAccount;
  orders?: SimulatedOrder[];
  fills?: SimulatedFill[];
  events: SimulatorEventEnvelope[];
  positions?: Position[];
  portfolio?: Portfolio;
  snapshots?: PortfolioSnapshot[];
}

export interface SimulatorAccountingRepository {
  persist(
    input: PersistSimulatorAccountingInput,
  ): Promise<SimulatorPortfolioView>;
  getCurrentPortfolioView(
    simulationAccountId: string,
  ): Promise<SimulatorPortfolioView | null>;
  getPortfolioHistory(
    simulationAccountId: string,
    options?: SimulatorHistoryQueryOptions,
  ): Promise<SimulatorPortfolioHistory>;
}

export interface ReplayableSimulatorState {
  simulationAccount: SimulationAccount;
  orders: SimulatedOrder[];
  events: SimulatorEventEnvelope[];
  fills: SimulatedFill[];
  snapshots?: PortfolioSnapshot[];
  currentView?: SimulatorPortfolioView | null;
}

export interface SimulatorReplayPosition {
  instrumentId: string;
  quantity: DecimalValue;
  averageEntryCost: DecimalValue;
  marketValue: DecimalValue;
  realizedPnl: DecimalValue;
  unrealizedPnl: DecimalValue;
}

export interface SimulatorReplayResult {
  simulationAccountId: string;
  cashBalance: DecimalValue;
  grossExposure: DecimalValue;
  netLiquidationValue: DecimalValue;
  realizedPnl: DecimalValue;
  unrealizedPnl: DecimalValue;
  processedEventIds: string[];
  processedFillIds: string[];
  positions: SimulatorReplayPosition[];
  replayDigest: string;
}

export interface SimulatorReplayVerification {
  replay: SimulatorReplayResult;
  latestSnapshotId: string | null;
  currentViewMatched: boolean;
  latestSnapshotMatched: boolean;
}

export interface StrategyIndicatorSnapshot {
  name: string;
  value: DecimalValue | null;
  interpretation: string | null;
  sourceVersion: string | null;
}

export interface StrategyMarketContext {
  latestEventIds: string[];
  freshnessState: MarketDataFreshnessState;
  summary: string;
  indicatorSnapshots: StrategyIndicatorSnapshot[];
}

export interface StrategyPortfolioContext {
  simulationAccountId: string;
  cashAvailable: DecimalValue;
  currentPositionQuantity: DecimalValue;
  averageCostBasis: DecimalValue | null;
  instrumentExposure: DecimalValue;
  portfolioExposure: DecimalValue;
  netLiquidationValue: DecimalValue;
  openIntentCount: number;
}

export interface StrategyRiskContext {
  maxPositionQuantity: DecimalValue;
  maxCapitalAtRisk: DecimalValue;
  sessionEligible: boolean;
  blockedReasons: string[];
  sizingPolicyVersion: string;
}

export interface StrategyDataTrustContext {
  readinessState: MarketDataFreshnessState;
  blockedReason: string | null;
  normalizationVersion: string | null;
  replayVersion: string | null;
}

export interface StrategyEvaluationInput {
  evaluationId: string;
  strategyId: string;
  strategyVersion: string;
  evaluationTimestamp: IsoTimestamp;
  instrumentId: string;
  symbol: string;
  sessionState: MarketDataSessionState;
  marketContext: StrategyMarketContext;
  portfolioContext: StrategyPortfolioContext;
  riskContext: StrategyRiskContext;
  dataTrust: StrategyDataTrustContext;
}

export interface StrategyInputReference {
  marketEventIds: string[];
  simulationAccountId: string;
  portfolioSnapshotId: string | null;
  riskPolicyVersion: string;
}

export interface StrategySignalSummary {
  signalCode: string;
  direction: StrategySignalDirection;
  strength: DecimalValue | null;
  summary: string;
}

export interface StrategyGuardrailResult {
  guardrailCode: string;
  status: 'passed' | 'blocked' | 'not-applicable';
  reason: string | null;
  detail: string | null;
}

export interface StrategyTradeIntent {
  tradeIntentId: string;
  strategyEvaluationId: string;
  strategyId: string;
  strategyVersion: string;
  evaluationCorrelationId: string;
  instrumentId: string;
  symbol: string;
  side: SimulatedOrderSide;
  requestedQuantity: DecimalValue;
  orderType: SimulatedOrderType;
  intentTimestamp: IsoTimestamp;
  intentMetadata: Record<string, string | number | boolean | null>;
}

export interface StrategyEvidenceRecord {
  evaluationId: string;
  strategyId: string;
  strategyVersion: string;
  evaluationTimestamp: IsoTimestamp;
  inputReference: StrategyInputReference;
  decisionState: StrategyDecisionState;
  signalSummary: StrategySignalSummary[];
  guardrailSummary: StrategyGuardrailResult[];
  decisionReason: string;
  tradeIntentReference: string | null;
}

export interface StrategyEvaluationRecord {
  input: StrategyEvaluationInput;
  evidence: StrategyEvidenceRecord;
  tradeIntent: StrategyTradeIntent | null;
}

export interface StrategyEvaluationQueryOptions {
  limit?: number;
  strategyId?: string;
  instrumentId?: string;
  decisionState?: StrategyDecisionState;
}

export interface StrategyEvaluationRequest {
  simulationAccountId: string;
  instrumentId: string;
  strategyId?: string;
  strategyVersion?: string;
  evaluationTimestamp?: IsoTimestamp;
}

export interface StrategyEvaluationRepository {
  persistEvaluation(
    input: StrategyEvaluationRecord,
  ): Promise<StrategyEvaluationRecord>;
  getEvaluation(evaluationId: string): Promise<StrategyEvaluationRecord | null>;
  getRecentEvaluations(
    options?: StrategyEvaluationQueryOptions,
  ): Promise<StrategyEvaluationRecord[]>;
}
