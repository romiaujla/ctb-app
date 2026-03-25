import { Prisma, PrismaClient } from '@prisma/client';
import {
  strategyEvaluationQueryOptionsSchema,
  strategyEvaluationRecordSchema,
  strategyTradeIntentSchema,
} from '@ctb/schemas';
import type {
  StrategyDecisionState,
  StrategyEvaluationQueryOptions,
  StrategyEvaluationRecord,
  StrategyEvaluationRepository,
  StrategyTradeIntent,
} from '@ctb/types';

const strategyDecisionStateMap = {
  'trade-intent-emitted': 'TRADE_INTENT_EMITTED',
  skipped: 'SKIPPED',
  blocked: 'BLOCKED',
  'invalid-input': 'INVALID_INPUT',
} as const;

const marketDataSessionStateToDbMap = {
  preMarket: 'PRE_MARKET',
  regular: 'REGULAR',
  afterHours: 'AFTER_HOURS',
  closed: 'CLOSED',
} as const;

const marketDataSessionStateFromDbMap = {
  PRE_MARKET: 'preMarket',
  REGULAR: 'regular',
  AFTER_HOURS: 'afterHours',
  CLOSED: 'closed',
} as const;

const simulatedOrderSideMap = {
  buy: 'BUY',
  sell: 'SELL',
} as const;

const simulatedOrderTypeMap = {
  market: 'MARKET',
  limit: 'LIMIT',
  stop: 'STOP',
  'stop-limit': 'STOP_LIMIT',
} as const;

function fromDecimal(value: Prisma.Decimal): string {
  return value.toFixed();
}

function fromStrategyDecisionState(value: string): StrategyDecisionState {
  return value.toLowerCase().replaceAll('_', '-') as StrategyDecisionState;
}

function mapStrategyTradeIntent(
  record: Prisma.StrategyTradeIntentGetPayload<Record<string, never>>,
): StrategyTradeIntent {
  return strategyTradeIntentSchema.parse({
    tradeIntentId: record.id,
    strategyEvaluationId: record.strategyEvaluationId,
    strategyId: record.strategyId,
    strategyVersion: record.strategyVersion,
    evaluationCorrelationId: record.evaluationCorrelationId,
    instrumentId: record.instrumentId,
    symbol: record.symbol,
    side: record.side.toLowerCase(),
    requestedQuantity: fromDecimal(record.requestedQuantity),
    orderType: record.orderType.toLowerCase().replace('_', '-'),
    intentTimestamp: record.intentTimestamp.toISOString(),
    intentMetadata: record.intentMetadata,
  });
}

function mapStrategyEvaluation(
  record: Prisma.StrategyEvaluationGetPayload<{
    include: { tradeIntent: true };
  }>,
): StrategyEvaluationRecord {
  return strategyEvaluationRecordSchema.parse({
    input: {
      evaluationId: record.id,
      strategyId: record.strategyId,
      strategyVersion: record.strategyVersion,
      evaluationTimestamp: record.evaluationTimestamp.toISOString(),
      instrumentId: record.instrumentId,
      symbol: record.symbol,
      sessionState: marketDataSessionStateFromDbMap[record.sessionState],
      marketContext: record.marketContext,
      portfolioContext: record.portfolioContext,
      riskContext: record.riskContext,
      dataTrust: record.dataTrust,
    },
    evidence: {
      evaluationId: record.id,
      strategyId: record.strategyId,
      strategyVersion: record.strategyVersion,
      evaluationTimestamp: record.evaluationTimestamp.toISOString(),
      inputReference: record.inputReference,
      decisionState: fromStrategyDecisionState(record.decisionState),
      signalSummary: record.signalSummary,
      guardrailSummary: record.guardrailSummary,
      decisionReason: record.decisionReason,
      tradeIntentReference: record.tradeIntent?.id ?? null,
    },
    tradeIntent: record.tradeIntent
      ? mapStrategyTradeIntent(record.tradeIntent)
      : null,
  });
}

function assertConsistentStrategyRecord(input: StrategyEvaluationRecord): void {
  const {
    input: evaluationInput,
    evidence,
    tradeIntent,
  } = strategyEvaluationRecordSchema.parse(input);

  if (evidence.evaluationId !== evaluationInput.evaluationId) {
    throw new Error(
      'Strategy evidence must reference the same evaluationId as the input.',
    );
  }

  if (evidence.strategyId !== evaluationInput.strategyId) {
    throw new Error(
      'Strategy evidence must reference the same strategyId as the input.',
    );
  }

  if (evidence.strategyVersion !== evaluationInput.strategyVersion) {
    throw new Error(
      'Strategy evidence must reference the same strategyVersion as the input.',
    );
  }

  if (tradeIntent) {
    if (tradeIntent.strategyEvaluationId !== evaluationInput.evaluationId) {
      throw new Error(
        'Strategy trade intents must reference the persisted strategy evaluation.',
      );
    }

    if (tradeIntent.tradeIntentId !== evidence.tradeIntentReference) {
      throw new Error(
        'Strategy evidence tradeIntentReference must match the emitted trade intent.',
      );
    }
  } else if (evidence.tradeIntentReference !== null) {
    throw new Error(
      'Strategy evidence cannot reference a trade intent when no trade intent was persisted.',
    );
  }
}

export class PrismaStrategyEvaluationRepository implements StrategyEvaluationRepository {
  constructor(private readonly client: PrismaClient) {}

  async persistEvaluation(
    rawInput: StrategyEvaluationRecord,
  ): Promise<StrategyEvaluationRecord> {
    const input = strategyEvaluationRecordSchema.parse(rawInput);

    assertConsistentStrategyRecord(input);

    return this.client.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.strategyEvaluation.upsert({
        where: { id: input.input.evaluationId },
        update: {
          strategyId: input.input.strategyId,
          strategyVersion: input.input.strategyVersion,
          evaluationTimestamp: new Date(input.input.evaluationTimestamp),
          instrumentId: input.input.instrumentId,
          symbol: input.input.symbol,
          sessionState: marketDataSessionStateToDbMap[input.input.sessionState],
          marketContext: input.input.marketContext as Prisma.InputJsonValue,
          portfolioContext: input.input
            .portfolioContext as Prisma.InputJsonValue,
          riskContext: input.input.riskContext as Prisma.InputJsonValue,
          dataTrust: input.input.dataTrust as Prisma.InputJsonValue,
          inputReference: input.evidence
            .inputReference as Prisma.InputJsonValue,
          decisionState: strategyDecisionStateMap[input.evidence.decisionState],
          decisionReason: input.evidence.decisionReason,
          signalSummary: input.evidence.signalSummary as Prisma.InputJsonValue,
          guardrailSummary: input.evidence
            .guardrailSummary as Prisma.InputJsonValue,
        },
        create: {
          id: input.input.evaluationId,
          strategyId: input.input.strategyId,
          strategyVersion: input.input.strategyVersion,
          evaluationTimestamp: new Date(input.input.evaluationTimestamp),
          instrumentId: input.input.instrumentId,
          symbol: input.input.symbol,
          sessionState: marketDataSessionStateToDbMap[input.input.sessionState],
          marketContext: input.input.marketContext as Prisma.InputJsonValue,
          portfolioContext: input.input
            .portfolioContext as Prisma.InputJsonValue,
          riskContext: input.input.riskContext as Prisma.InputJsonValue,
          dataTrust: input.input.dataTrust as Prisma.InputJsonValue,
          inputReference: input.evidence
            .inputReference as Prisma.InputJsonValue,
          decisionState: strategyDecisionStateMap[input.evidence.decisionState],
          decisionReason: input.evidence.decisionReason,
          signalSummary: input.evidence.signalSummary as Prisma.InputJsonValue,
          guardrailSummary: input.evidence
            .guardrailSummary as Prisma.InputJsonValue,
        },
      });

      if (input.tradeIntent) {
        await tx.strategyTradeIntent.upsert({
          where: { id: input.tradeIntent.tradeIntentId },
          update: {
            strategyEvaluationId: input.tradeIntent.strategyEvaluationId,
            strategyId: input.tradeIntent.strategyId,
            strategyVersion: input.tradeIntent.strategyVersion,
            evaluationCorrelationId: input.tradeIntent.evaluationCorrelationId,
            instrumentId: input.tradeIntent.instrumentId,
            symbol: input.tradeIntent.symbol,
            side: simulatedOrderSideMap[input.tradeIntent.side],
            requestedQuantity: new Prisma.Decimal(
              input.tradeIntent.requestedQuantity,
            ),
            orderType: simulatedOrderTypeMap[input.tradeIntent.orderType],
            intentTimestamp: new Date(input.tradeIntent.intentTimestamp),
            intentMetadata: input.tradeIntent
              .intentMetadata as Prisma.InputJsonValue,
          },
          create: {
            id: input.tradeIntent.tradeIntentId,
            strategyEvaluationId: input.tradeIntent.strategyEvaluationId,
            strategyId: input.tradeIntent.strategyId,
            strategyVersion: input.tradeIntent.strategyVersion,
            evaluationCorrelationId: input.tradeIntent.evaluationCorrelationId,
            instrumentId: input.tradeIntent.instrumentId,
            symbol: input.tradeIntent.symbol,
            side: simulatedOrderSideMap[input.tradeIntent.side],
            requestedQuantity: new Prisma.Decimal(
              input.tradeIntent.requestedQuantity,
            ),
            orderType: simulatedOrderTypeMap[input.tradeIntent.orderType],
            intentTimestamp: new Date(input.tradeIntent.intentTimestamp),
            intentMetadata: input.tradeIntent
              .intentMetadata as Prisma.InputJsonValue,
          },
        });
      } else {
        await tx.strategyTradeIntent.deleteMany({
          where: { strategyEvaluationId: input.input.evaluationId },
        });
      }

      const persisted = await tx.strategyEvaluation.findUniqueOrThrow({
        where: { id: input.input.evaluationId },
        include: { tradeIntent: true },
      });

      return mapStrategyEvaluation(persisted);
    });
  }

  async getEvaluation(
    evaluationId: string,
  ): Promise<StrategyEvaluationRecord | null> {
    const record = await this.client.strategyEvaluation.findUnique({
      where: { id: evaluationId },
      include: { tradeIntent: true },
    });

    return record ? mapStrategyEvaluation(record) : null;
  }

  async getRecentEvaluations(
    rawOptions: StrategyEvaluationQueryOptions = {},
  ): Promise<StrategyEvaluationRecord[]> {
    const options = strategyEvaluationQueryOptionsSchema.parse(rawOptions);
    const records = await this.client.strategyEvaluation.findMany({
      where: {
        strategyId: options.strategyId,
        instrumentId: options.instrumentId,
        decisionState: options.decisionState
          ? strategyDecisionStateMap[options.decisionState]
          : undefined,
      },
      include: { tradeIntent: true },
      orderBy: [{ evaluationTimestamp: 'desc' }, { id: 'desc' }],
      take: options.limit ?? 20,
    });

    return records.map(mapStrategyEvaluation);
  }
}
