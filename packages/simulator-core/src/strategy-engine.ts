import type { MarketDataRepository } from '@ctb/market-data';
import {
  strategyEvaluationRecordSchema,
  strategyEvaluationRequestSchema,
} from '@ctb/schemas';
import type {
  CanonicalMarketDataEvent,
  SimulatorAccountingRepository,
  StrategyDecisionState,
  StrategyEvaluationInput,
  StrategyEvaluationRecord,
  StrategyEvaluationRepository,
  StrategyEvaluationRequest,
} from '@ctb/types';

const defaultStrategyId = 'ctb-v1';
const defaultStrategyVersion = 'ctb-v1.0.0';

function parseDecimal(value: string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDecimalString(value: number): string {
  return value.toFixed(8).replace(/\.?0+$/, '');
}

function minutesIntoNewYorkSession(timestamp: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    timeZone: 'America/New_York',
  });
  const parts = formatter.formatToParts(new Date(timestamp));
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(
    parts.find((part) => part.type === 'minute')?.value ?? '0',
  );

  return hour * 60 + minute;
}

function findLatestEvent(
  events: CanonicalMarketDataEvent[],
  eventType: CanonicalMarketDataEvent['eventType'],
) {
  return (
    [...events].reverse().find((event) => event.eventType === eventType) ?? null
  );
}

function findLatestQuote(events: CanonicalMarketDataEvent[]) {
  return findLatestEvent(events, 'quote');
}

function findLatestTrade(events: CanonicalMarketDataEvent[]) {
  return findLatestEvent(events, 'trade');
}

function findLatestBar(events: CanonicalMarketDataEvent[]) {
  return findLatestEvent(events, 'bar');
}

function getReferencePrice(events: CanonicalMarketDataEvent[]): number | null {
  const latestQuote = findLatestQuote(events);
  const latestTrade = findLatestTrade(events);
  const latestBar = findLatestBar(events);
  const latestQuotePayload = latestQuote?.payload as
    | { midPrice: string | null }
    | undefined;
  const latestTradePayload = latestTrade?.payload as
    | { tradePrice: string | null }
    | undefined;
  const latestBarPayload = latestBar?.payload as
    | { close: string | null }
    | undefined;

  return (
    parseDecimal(latestQuotePayload?.midPrice ?? null) ??
    parseDecimal(latestTradePayload?.tradePrice ?? null) ??
    parseDecimal(latestBarPayload?.close ?? null)
  );
}

function getLatestVwap(events: CanonicalMarketDataEvent[]): number | null {
  const latestBarPayload = findLatestBar(events)?.payload as
    | { vwap: string | null }
    | undefined;
  return parseDecimal(latestBarPayload?.vwap ?? null);
}

function buildBlockedGuardrailSummary(reasons: string[]) {
  return reasons.map((reason, index) => ({
    guardrailCode: `blocked-condition-${index + 1}`,
    status: 'blocked' as const,
    reason,
    detail: 'Derived from canonical runtime guardrails during evaluation.',
  }));
}

function buildStrategyEvaluationRecord(
  input: StrategyEvaluationInput,
  args: {
    decisionState: StrategyDecisionState;
    decisionReason: string;
    signalSummary: StrategyEvaluationRecord['evidence']['signalSummary'];
    guardrailSummary: StrategyEvaluationRecord['evidence']['guardrailSummary'];
    tradeIntent: StrategyEvaluationRecord['tradeIntent'];
  },
): StrategyEvaluationRecord {
  return strategyEvaluationRecordSchema.parse({
    input,
    evidence: {
      evaluationId: input.evaluationId,
      strategyId: input.strategyId,
      strategyVersion: input.strategyVersion,
      evaluationTimestamp: input.evaluationTimestamp,
      inputReference: {
        marketEventIds: input.marketContext.latestEventIds,
        simulationAccountId: input.portfolioContext.simulationAccountId,
        portfolioSnapshotId: null,
        riskPolicyVersion: input.riskContext.sizingPolicyVersion,
      },
      decisionState: args.decisionState,
      signalSummary: args.signalSummary,
      guardrailSummary: args.guardrailSummary,
      decisionReason: args.decisionReason,
      tradeIntentReference: args.tradeIntent?.tradeIntentId ?? null,
    },
    tradeIntent: args.tradeIntent,
  });
}

export async function buildStrategyEvaluationInput(
  rawRequest: StrategyEvaluationRequest,
  dependencies: {
    marketDataRepository: MarketDataRepository;
    simulatorAccountingRepository: SimulatorAccountingRepository;
  },
): Promise<StrategyEvaluationInput> {
  const request = strategyEvaluationRequestSchema.parse(rawRequest);
  const [events, portfolioView] = await Promise.all([
    dependencies.marketDataRepository.getCanonicalEventHistory({
      instrumentId: request.instrumentId,
      limit: 20,
    }),
    dependencies.simulatorAccountingRepository.getCurrentPortfolioView(
      request.simulationAccountId,
    ),
  ]);

  if (!portfolioView) {
    throw new Error(
      `Simulation account ${request.simulationAccountId} is not available for strategy evaluation.`,
    );
  }

  const latestEvents = events.slice(-5);
  const latestEvent = latestEvents.at(-1) ?? null;
  const evaluationTimestamp =
    request.evaluationTimestamp ??
    latestEvent?.normalizedTimestamp ??
    new Date().toISOString();
  const referencePrice = getReferencePrice(events);
  const latestVwap = getLatestVwap(events);
  const netLiquidationValue =
    parseDecimal(portfolioView.portfolio?.netLiquidationValue) ??
    parseDecimal(portfolioView.simulationAccount.currentCashBalance) ??
    0;
  const maxCapitalAtRisk = netLiquidationValue * 0.25;
  const maxPositionQuantity =
    referencePrice && referencePrice > 0
      ? Math.floor(maxCapitalAtRisk / referencePrice)
      : 0;
  const currentPosition =
    portfolioView.positions.find(
      (position) => position.instrumentId === request.instrumentId,
    ) ?? null;

  return strategyEvaluationRecordSchema.shape.input.parse({
    evaluationId: `eval-${request.instrumentId}-${new Date(
      evaluationTimestamp,
    ).toISOString()}`,
    strategyId: request.strategyId ?? defaultStrategyId,
    strategyVersion: request.strategyVersion ?? defaultStrategyVersion,
    evaluationTimestamp,
    instrumentId: request.instrumentId,
    symbol: latestEvent?.symbol ?? request.instrumentId,
    sessionState: latestEvent?.sessionState ?? 'closed',
    marketContext: {
      latestEventIds: latestEvents.map((event) => event.eventId),
      freshnessState: latestEvent?.freshnessState ?? 'unavailable',
      summary: latestEvent
        ? `Latest canonical event ${latestEvent.eventType} ${latestEvent.symbol} is ${latestEvent.freshnessState}.`
        : 'No canonical market-data history is available for this instrument.',
      indicatorSnapshots: [
        {
          name: 'price-vs-vwap',
          value:
            referencePrice !== null && latestVwap !== null
              ? toDecimalString(referencePrice - latestVwap)
              : null,
          interpretation:
            referencePrice !== null && latestVwap !== null
              ? referencePrice > latestVwap
                ? 'bullish'
                : 'neutral'
              : null,
          sourceVersion: request.strategyVersion ?? defaultStrategyVersion,
        },
      ],
    },
    portfolioContext: {
      simulationAccountId: request.simulationAccountId,
      cashAvailable: portfolioView.simulationAccount.currentCashBalance,
      currentPositionQuantity: currentPosition?.quantity ?? '0',
      averageCostBasis: currentPosition?.averageEntryCost ?? null,
      instrumentExposure: currentPosition?.marketValue ?? '0',
      portfolioExposure: portfolioView.portfolio?.grossExposure ?? '0',
      netLiquidationValue:
        portfolioView.portfolio?.netLiquidationValue ??
        portfolioView.simulationAccount.currentCashBalance,
      openIntentCount: portfolioView.openOrders.length,
    },
    riskContext: {
      maxPositionQuantity: toDecimalString(Math.max(maxPositionQuantity, 0)),
      maxCapitalAtRisk: toDecimalString(Math.max(maxCapitalAtRisk, 0)),
      sessionEligible:
        latestEvent?.sessionState === 'regular' &&
        minutesIntoNewYorkSession(evaluationTimestamp) >= 9 * 60 + 45 &&
        minutesIntoNewYorkSession(evaluationTimestamp) <= 15 * 60,
      blockedReasons: [
        ...(latestEvent?.sessionState !== 'regular'
          ? ['strategy only trades during the regular session']
          : []),
        ...(minutesIntoNewYorkSession(evaluationTimestamp) < 9 * 60 + 45 ||
        minutesIntoNewYorkSession(evaluationTimestamp) > 15 * 60
          ? ['entry timing falls outside the approved session window']
          : []),
        ...(portfolioView.openOrders.length > 0
          ? ['strategy requires one clean opportunity at a time']
          : []),
        ...((currentPosition?.quantity ?? '0') !== '0'
          ? ['CTB already holds an open position for this instrument']
          : []),
      ],
      sizingPolicyVersion: 'risk-v1',
    },
    dataTrust: {
      readinessState: latestEvent?.freshnessState ?? 'unavailable',
      blockedReason:
        latestEvent?.freshnessState === 'ready'
          ? null
          : 'market data is not strategy-safe for evaluation',
      normalizationVersion: latestEvent?.normalizationVersion ?? null,
      replayVersion: 'replay-v1',
    },
  });
}

export function evaluateStrategyInput(
  input: StrategyEvaluationInput,
): StrategyEvaluationRecord {
  const latestPriceVsVwap = input.marketContext.indicatorSnapshots[0] ?? null;
  const latestPriceDelta = parseDecimal(latestPriceVsVwap?.value ?? null);
  const latestPriceAboveVwap =
    latestPriceDelta !== null && latestPriceDelta > 0;
  const hasBlockedReasons = input.riskContext.blockedReasons.length > 0;
  const positionCapacity = Math.floor(
    parseDecimal(input.riskContext.maxPositionQuantity) ?? 0,
  );

  if (
    input.dataTrust.readinessState !== 'ready' ||
    input.marketContext.latestEventIds.length === 0
  ) {
    return buildStrategyEvaluationRecord(input, {
      decisionState: 'invalid-input',
      decisionReason: 'Canonical market data was missing or not strategy-safe.',
      signalSummary: [
        {
          signalCode: 'market-context-missing',
          direction: 'neutral',
          strength: null,
          summary:
            'Strategy could not evaluate because trusted market context was unavailable.',
        },
      ],
      guardrailSummary: [
        {
          guardrailCode: 'market-data-trust',
          status: 'blocked',
          reason: input.dataTrust.blockedReason,
          detail:
            'Fresh canonical market data is required before rule evaluation.',
        },
      ],
      tradeIntent: null,
    });
  }

  if (!input.riskContext.sessionEligible || hasBlockedReasons) {
    return buildStrategyEvaluationRecord(input, {
      decisionState: 'blocked',
      decisionReason:
        input.riskContext.blockedReasons[0] ??
        'Guardrails blocked this evaluation before a trade intent could be emitted.',
      signalSummary: [
        {
          signalCode: 'guardrail-precheck',
          direction: 'neutral',
          strength: null,
          summary:
            'Guardrail checks ran before the strategy could emit a trade intent.',
        },
      ],
      guardrailSummary: buildBlockedGuardrailSummary(
        input.riskContext.blockedReasons,
      ),
      tradeIntent: null,
    });
  }

  if (!latestPriceAboveVwap) {
    return buildStrategyEvaluationRecord(input, {
      decisionState: 'skipped',
      decisionReason:
        'The latest canonical price context did not confirm the bullish continuation setup.',
      signalSummary: [
        {
          signalCode: 'bullish-continuation-check',
          direction: 'neutral',
          strength: latestPriceVsVwap?.value ?? null,
          summary:
            'Price did not remain above the latest available VWAP context.',
        },
      ],
      guardrailSummary: [
        {
          guardrailCode: 'session-window',
          status: 'passed',
          reason: null,
          detail:
            'Evaluation occurred during the approved regular-session window.',
        },
      ],
      tradeIntent: null,
    });
  }

  if (positionCapacity <= 0) {
    return buildStrategyEvaluationRecord(input, {
      decisionState: 'blocked',
      decisionReason: 'Sizing rules rounded the trade quantity to zero.',
      signalSummary: [
        {
          signalCode: 'bullish-continuation-check',
          direction: 'bullish',
          strength: latestPriceVsVwap?.value ?? null,
          summary:
            'Signal qualified, but risk sizing could not emit a credible order.',
        },
      ],
      guardrailSummary: [
        {
          guardrailCode: 'position-sizing',
          status: 'blocked',
          reason: 'Sizing rules rounded the position quantity to zero.',
          detail: 'The strategy will not emit ambiguous reduced orders.',
        },
      ],
      tradeIntent: null,
    });
  }

  const requestedQuantity = Math.max(1, Math.min(positionCapacity, 10));
  const tradeIntentId = input.evaluationId.replace(/^eval-/, 'intent-');

  return buildStrategyEvaluationRecord(input, {
    decisionState: 'trade-intent-emitted',
    decisionReason:
      'Bullish continuation conditions and guardrails both passed.',
    signalSummary: [
      {
        signalCode: 'bullish-continuation-check',
        direction: 'bullish',
        strength: latestPriceVsVwap?.value ?? null,
        summary:
          'Price remained above VWAP and the continuation setup stayed intact.',
      },
    ],
    guardrailSummary: [
      {
        guardrailCode: 'session-window',
        status: 'passed',
        reason: null,
        detail:
          'Regular-session timing and single-position constraints passed.',
      },
      {
        guardrailCode: 'position-sizing',
        status: 'passed',
        reason: null,
        detail: 'Risk sizing emitted a bounded long-only trade intent.',
      },
    ],
    tradeIntent: {
      tradeIntentId,
      strategyEvaluationId: input.evaluationId,
      strategyId: input.strategyId,
      strategyVersion: input.strategyVersion,
      evaluationCorrelationId: input.evaluationId,
      instrumentId: input.instrumentId,
      symbol: input.symbol,
      side: 'buy',
      requestedQuantity: toDecimalString(requestedQuantity),
      orderType: 'limit',
      intentTimestamp: input.evaluationTimestamp,
      intentMetadata: {
        sizingMode: 'quarter-net-liquidation-cap',
        setup: 'bullish-continuation',
      },
    },
  });
}

export async function runStrategyEvaluation(
  request: StrategyEvaluationRequest,
  dependencies: {
    marketDataRepository: MarketDataRepository;
    simulatorAccountingRepository: SimulatorAccountingRepository;
    strategyEvaluationRepository: StrategyEvaluationRepository;
  },
): Promise<StrategyEvaluationRecord> {
  const input = await buildStrategyEvaluationInput(request, dependencies);
  const evaluation = evaluateStrategyInput(input);

  return dependencies.strategyEvaluationRepository.persistEvaluation(
    evaluation,
  );
}
