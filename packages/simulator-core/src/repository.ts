import prismaClientPackage from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { Prisma } from '@prisma/client';

const { PrismaClient } = prismaClientPackage;
import {
  persistSimulatorAccountingInputSchema,
  portfolioSchema,
  portfolioSnapshotSchema,
  positionSchema,
  simulatedFillSchema,
  simulatedOrderSchema,
  simulationAccountSchema,
  simulatorEventEnvelopeSchema,
  simulatorPortfolioHistorySchema,
  simulatorPortfolioViewSchema,
} from '@ctb/schemas';
import type {
  PersistSimulatorAccountingInput,
  Portfolio,
  PortfolioSnapshot,
  Position,
  SimulatedFill,
  SimulatedOrder,
  SimulationAccount,
  SimulatorAccountingRepository,
  SimulatorEventEnvelope,
  SimulatorHistoryQueryOptions,
  SimulatorPortfolioHistory,
  SimulatorPortfolioView,
} from '@ctb/types';

type PersistenceClient = PrismaClient | Prisma.TransactionClient;

const decimal = (value: string) => new Decimal(value);

const simulationAccountStatusMap = {
  active: 'ACTIVE',
  paused: 'PAUSED',
  closed: 'CLOSED',
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

const simulatedOrderStatusMap = {
  accepted: 'ACCEPTED',
  'partially-filled': 'PARTIALLY_FILLED',
  filled: 'FILLED',
  canceled: 'CANCELED',
  rejected: 'REJECTED',
} as const;

const simulatorEventTypeMap = {
  'trade-intent-accepted': 'TRADE_INTENT_ACCEPTED',
  'trade-intent-rejected': 'TRADE_INTENT_REJECTED',
  'order-submitted': 'ORDER_SUBMITTED',
  'order-partially-filled': 'ORDER_PARTIALLY_FILLED',
  'order-filled': 'ORDER_FILLED',
  'order-canceled': 'ORDER_CANCELED',
  'position-revalued': 'POSITION_REVALUED',
  'portfolio-snapshotted': 'PORTFOLIO_SNAPSHOTTED',
  'account-adjusted': 'ACCOUNT_ADJUSTED',
} as const;

function fromDecimal(value: Decimal): string {
  return value.toFixed();
}

function mapSimulationAccount(
  record: Prisma.SimulationAccountGetPayload<Record<string, never>>,
): SimulationAccount {
  return simulationAccountSchema.parse({
    simulationAccountId: record.id,
    baseCurrency: record.baseCurrency,
    startingBalance: fromDecimal(record.startingBalance),
    currentCashBalance: fromDecimal(record.currentCashBalance),
    status: record.status.toLowerCase(),
    createdTimestamp: record.createdTimestamp.toISOString(),
    configurationVersion: record.configurationVersion,
  });
}

function mapPortfolio(
  record: Prisma.PortfolioGetPayload<Record<string, never>>,
): Portfolio {
  return portfolioSchema.parse({
    portfolioId: record.id,
    simulationAccountId: record.simulationAccountId,
    netLiquidationValue: fromDecimal(record.netLiquidationValue),
    grossExposure: fromDecimal(record.grossExposure),
    realizedPnl: fromDecimal(record.realizedPnl),
    unrealizedPnl: fromDecimal(record.unrealizedPnl),
    valuationTimestamp: record.valuationTimestamp.toISOString(),
  });
}

function mapPosition(
  record: Prisma.PositionGetPayload<Record<string, never>>,
): Position {
  return positionSchema.parse({
    positionId: record.id,
    simulationAccountId: record.simulationAccountId,
    instrumentId: record.instrumentId,
    quantity: fromDecimal(record.quantity),
    averageEntryCost: fromDecimal(record.averageEntryCost),
    marketValue: fromDecimal(record.marketValue),
    realizedPnl: fromDecimal(record.realizedPnl),
    unrealizedPnl: fromDecimal(record.unrealizedPnl),
    lastUpdatedTimestamp: record.lastUpdatedTimestamp.toISOString(),
  });
}

function mapSimulatedOrder(
  record: Prisma.SimulatedOrderGetPayload<Record<string, never>>,
): SimulatedOrder {
  return simulatedOrderSchema.parse({
    simulatedOrderId: record.id,
    simulationAccountId: record.simulationAccountId,
    tradeIntentId: record.tradeIntentId,
    instrumentId: record.instrumentId,
    side: record.side.toLowerCase(),
    orderType: record.orderType.toLowerCase().replace('_', '-'),
    requestedQuantity: fromDecimal(record.requestedQuantity),
    acceptedQuantity: fromDecimal(record.acceptedQuantity),
    status: record.status.toLowerCase().replaceAll('_', '-'),
    submittedTimestamp: record.submittedTimestamp.toISOString(),
    executionModelVersion: record.executionModelVersion,
  });
}

function mapSimulatedFill(
  record: Prisma.SimulatedFillGetPayload<Record<string, never>>,
): SimulatedFill {
  return simulatedFillSchema.parse({
    simulatedFillId: record.id,
    simulatedOrderId: record.simulatedOrderId,
    simulationAccountId: record.simulationAccountId,
    instrumentId: record.instrumentId,
    fillQuantity: fromDecimal(record.fillQuantity),
    fillPrice: fromDecimal(record.fillPrice),
    simulatedFeeAmount: fromDecimal(record.simulatedFeeAmount),
    slippageAmount: fromDecimal(record.slippageAmount),
    fillTimestamp: record.fillTimestamp.toISOString(),
  });
}

function mapPortfolioSnapshot(
  record: Prisma.PortfolioSnapshotGetPayload<Record<string, never>>,
): PortfolioSnapshot {
  return portfolioSnapshotSchema.parse({
    snapshotId: record.id,
    simulationAccountId: record.simulationAccountId,
    cashBalance: fromDecimal(record.cashBalance),
    grossExposure: fromDecimal(record.grossExposure),
    netLiquidationValue: fromDecimal(record.netLiquidationValue),
    realizedPnl: fromDecimal(record.realizedPnl),
    unrealizedPnl: fromDecimal(record.unrealizedPnl),
    timestamp: record.timestamp.toISOString(),
    sourceEventId: record.sourceEventId,
  });
}

function mapSimulatorEvent(
  record: Prisma.SimulatorEventGetPayload<Record<string, never>>,
): SimulatorEventEnvelope {
  return simulatorEventEnvelopeSchema.parse({
    simulatorEventId: record.id,
    simulationAccountId: record.simulationAccountId,
    eventType: record.eventType.toLowerCase().replaceAll('_', '-'),
    eventTimestamp: record.eventTimestamp.toISOString(),
    recordedTimestamp: record.recordedTimestamp.toISOString(),
    sequenceKey: record.sequenceKey,
    correlationId: record.correlationId,
    causationId: record.causationId,
    schemaVersion: record.schemaVersion,
    payload: record.payload,
  });
}

function assertConsistentAccountIds(
  simulationAccountId: string,
  input: PersistSimulatorAccountingInput,
): void {
  const scopedCollections = [
    input.orders ?? [],
    input.fills ?? [],
    input.events ?? [],
    input.positions ?? [],
    input.snapshots ?? [],
    input.portfolio ? [input.portfolio] : [],
  ];

  for (const records of scopedCollections) {
    for (const record of records) {
      if (record.simulationAccountId !== simulationAccountId) {
        throw new Error(
          `Simulator accounting persistence requires one simulationAccountId scope. Expected ${simulationAccountId}.`,
        );
      }
    }
  }
}

async function assertReferentialConsistency(
  client: PersistenceClient,
  input: PersistSimulatorAccountingInput,
): Promise<void> {
  const orderIds = new Set(
    (input.orders ?? []).map((order) => order.simulatedOrderId),
  );
  const fillOrderIds = [
    ...new Set((input.fills ?? []).map((fill) => fill.simulatedOrderId)),
  ];

  if (fillOrderIds.length > 0) {
    const existingOrders = await client.simulatedOrder.findMany({
      where: {
        simulationAccountId: input.simulationAccount.simulationAccountId,
        id: { in: fillOrderIds },
      },
      select: { id: true },
    });

    for (const orderId of existingOrders.map(
      (order: { id: string }) => order.id,
    )) {
      orderIds.add(orderId);
    }

    for (const orderId of fillOrderIds) {
      if (!orderIds.has(orderId)) {
        throw new Error(
          `Simulated fill ${orderId} cannot be persisted before its order exists.`,
        );
      }
    }
  }

  const eventIds = new Set(
    (input.events ?? []).map((event) => event.simulatorEventId),
  );
  const snapshotSourceIds = [
    ...new Set(
      (input.snapshots ?? []).map((snapshot) => snapshot.sourceEventId),
    ),
  ];

  if (snapshotSourceIds.length > 0) {
    const existingEvents = await client.simulatorEvent.findMany({
      where: {
        simulationAccountId: input.simulationAccount.simulationAccountId,
        id: { in: snapshotSourceIds },
      },
      select: { id: true },
    });

    for (const eventId of existingEvents.map(
      (event: { id: string }) => event.id,
    )) {
      eventIds.add(eventId);
    }

    for (const sourceEventId of snapshotSourceIds) {
      if (!eventIds.has(sourceEventId)) {
        throw new Error(
          `Portfolio snapshot ${sourceEventId} must reference an existing simulator event.`,
        );
      }
    }
  }

  const sequenceKeys = new Set<string>();
  for (const event of input.events) {
    if (sequenceKeys.has(event.sequenceKey)) {
      throw new Error(
        `Duplicate simulator sequence key detected in input: ${event.sequenceKey}`,
      );
    }
    sequenceKeys.add(event.sequenceKey);
  }
}

async function getCurrentPortfolioViewWithClient(
  client: PersistenceClient,
  simulationAccountId: string,
): Promise<SimulatorPortfolioView | null> {
  const simulationAccount = await client.simulationAccount.findUnique({
    where: { id: simulationAccountId },
  });

  if (!simulationAccount) {
    return null;
  }

  const [portfolio, positions, openOrders, recentFills] = await Promise.all([
    client.portfolio.findUnique({
      where: { simulationAccountId },
    }),
    client.position.findMany({
      where: { simulationAccountId },
      orderBy: [{ instrumentId: 'asc' }],
    }),
    client.simulatedOrder.findMany({
      where: {
        simulationAccountId,
        status: { in: ['ACCEPTED', 'PARTIALLY_FILLED'] },
      },
      orderBy: [{ submittedTimestamp: 'asc' }],
    }),
    client.simulatedFill.findMany({
      where: { simulationAccountId },
      orderBy: [{ fillTimestamp: 'desc' }],
      take: 50,
    }),
  ]);

  return simulatorPortfolioViewSchema.parse({
    simulationAccount: mapSimulationAccount(simulationAccount),
    portfolio: portfolio ? mapPortfolio(portfolio) : null,
    positions: positions.map(mapPosition),
    openOrders: openOrders.map(mapSimulatedOrder),
    recentFills: recentFills.map(mapSimulatedFill),
  });
}

async function getPortfolioHistoryWithClient(
  client: PersistenceClient,
  simulationAccountId: string,
  options: SimulatorHistoryQueryOptions = {},
): Promise<SimulatorPortfolioHistory> {
  const whereTimestamp =
    options.fromTimestamp || options.toTimestamp
      ? {
          gte: options.fromTimestamp
            ? new Date(options.fromTimestamp)
            : undefined,
          lte: options.toTimestamp ? new Date(options.toTimestamp) : undefined,
        }
      : undefined;

  const [orders, events, fills, snapshots] = await Promise.all([
    client.simulatedOrder.findMany({
      where: { simulationAccountId },
      orderBy: [{ submittedTimestamp: 'asc' }],
      take: options.limit,
    }),
    client.simulatorEvent.findMany({
      where: {
        simulationAccountId,
        eventTimestamp: whereTimestamp,
      },
      orderBy: [{ eventTimestamp: 'asc' }, { sequenceKey: 'asc' }],
      take: options.limit,
    }),
    client.simulatedFill.findMany({
      where: {
        simulationAccountId,
        fillTimestamp: whereTimestamp,
      },
      orderBy: [{ fillTimestamp: 'asc' }],
      take: options.limit,
    }),
    client.portfolioSnapshot.findMany({
      where: {
        simulationAccountId,
        timestamp: whereTimestamp,
      },
      orderBy: [{ timestamp: 'asc' }],
      take: options.limit,
    }),
  ]);

  return simulatorPortfolioHistorySchema.parse({
    orders: orders.map(mapSimulatedOrder),
    events: events.map(mapSimulatorEvent),
    fills: fills.map(mapSimulatedFill),
    snapshots: snapshots.map(mapPortfolioSnapshot),
  });
}

export class PrismaSimulatorAccountingRepository implements SimulatorAccountingRepository {
  constructor(private readonly client: PrismaClient) {}

  async persist(
    rawInput: PersistSimulatorAccountingInput,
  ): Promise<SimulatorPortfolioView> {
    const input = persistSimulatorAccountingInputSchema.parse(rawInput);
    const simulationAccountId = input.simulationAccount.simulationAccountId;

    assertConsistentAccountIds(simulationAccountId, input);

    return this.client.$transaction(async (tx: Prisma.TransactionClient) => {
      await assertReferentialConsistency(tx, input);

      await tx.simulationAccount.upsert({
        where: { id: simulationAccountId },
        update: {
          baseCurrency: input.simulationAccount.baseCurrency,
          startingBalance: decimal(input.simulationAccount.startingBalance),
          currentCashBalance: decimal(
            input.simulationAccount.currentCashBalance,
          ),
          status: simulationAccountStatusMap[input.simulationAccount.status],
          createdTimestamp: new Date(input.simulationAccount.createdTimestamp),
          configurationVersion: input.simulationAccount.configurationVersion,
        },
        create: {
          id: simulationAccountId,
          baseCurrency: input.simulationAccount.baseCurrency,
          startingBalance: decimal(input.simulationAccount.startingBalance),
          currentCashBalance: decimal(
            input.simulationAccount.currentCashBalance,
          ),
          status: simulationAccountStatusMap[input.simulationAccount.status],
          createdTimestamp: new Date(input.simulationAccount.createdTimestamp),
          configurationVersion: input.simulationAccount.configurationVersion,
        },
      });

      for (const order of input.orders ?? []) {
        await tx.simulatedOrder.upsert({
          where: { id: order.simulatedOrderId },
          update: {
            tradeIntentId: order.tradeIntentId,
            instrumentId: order.instrumentId,
            side: simulatedOrderSideMap[order.side],
            orderType: simulatedOrderTypeMap[order.orderType],
            requestedQuantity: decimal(order.requestedQuantity),
            acceptedQuantity: decimal(order.acceptedQuantity),
            status: simulatedOrderStatusMap[order.status],
            submittedTimestamp: new Date(order.submittedTimestamp),
            executionModelVersion: order.executionModelVersion,
          },
          create: {
            id: order.simulatedOrderId,
            simulationAccountId,
            tradeIntentId: order.tradeIntentId,
            instrumentId: order.instrumentId,
            side: simulatedOrderSideMap[order.side],
            orderType: simulatedOrderTypeMap[order.orderType],
            requestedQuantity: decimal(order.requestedQuantity),
            acceptedQuantity: decimal(order.acceptedQuantity),
            status: simulatedOrderStatusMap[order.status],
            submittedTimestamp: new Date(order.submittedTimestamp),
            executionModelVersion: order.executionModelVersion,
          },
        });
      }

      for (const event of input.events) {
        await tx.simulatorEvent.create({
          data: {
            id: event.simulatorEventId,
            simulationAccountId,
            eventType: simulatorEventTypeMap[event.eventType],
            eventTimestamp: new Date(event.eventTimestamp),
            recordedTimestamp: new Date(event.recordedTimestamp),
            sequenceKey: event.sequenceKey,
            correlationId: event.correlationId,
            causationId: event.causationId,
            schemaVersion: event.schemaVersion,
            payload: event.payload as Prisma.InputJsonValue,
          },
        });
      }

      for (const fill of input.fills ?? []) {
        await tx.simulatedFill.create({
          data: {
            id: fill.simulatedFillId,
            simulatedOrderId: fill.simulatedOrderId,
            simulationAccountId,
            instrumentId: fill.instrumentId,
            fillQuantity: decimal(fill.fillQuantity),
            fillPrice: decimal(fill.fillPrice),
            simulatedFeeAmount: decimal(fill.simulatedFeeAmount),
            slippageAmount: decimal(fill.slippageAmount),
            fillTimestamp: new Date(fill.fillTimestamp),
          },
        });
      }

      for (const position of input.positions ?? []) {
        await tx.position.upsert({
          where: {
            simulationAccountId_instrumentId: {
              simulationAccountId,
              instrumentId: position.instrumentId,
            },
          },
          update: {
            quantity: decimal(position.quantity),
            averageEntryCost: decimal(position.averageEntryCost),
            marketValue: decimal(position.marketValue),
            realizedPnl: decimal(position.realizedPnl),
            unrealizedPnl: decimal(position.unrealizedPnl),
            lastUpdatedTimestamp: new Date(position.lastUpdatedTimestamp),
          },
          create: {
            id: position.positionId,
            simulationAccountId,
            instrumentId: position.instrumentId,
            quantity: decimal(position.quantity),
            averageEntryCost: decimal(position.averageEntryCost),
            marketValue: decimal(position.marketValue),
            realizedPnl: decimal(position.realizedPnl),
            unrealizedPnl: decimal(position.unrealizedPnl),
            lastUpdatedTimestamp: new Date(position.lastUpdatedTimestamp),
          },
        });
      }

      if (input.portfolio) {
        await tx.portfolio.upsert({
          where: { simulationAccountId },
          update: {
            id: input.portfolio.portfolioId,
            netLiquidationValue: decimal(input.portfolio.netLiquidationValue),
            grossExposure: decimal(input.portfolio.grossExposure),
            realizedPnl: decimal(input.portfolio.realizedPnl),
            unrealizedPnl: decimal(input.portfolio.unrealizedPnl),
            valuationTimestamp: new Date(input.portfolio.valuationTimestamp),
          },
          create: {
            id: input.portfolio.portfolioId,
            simulationAccountId,
            netLiquidationValue: decimal(input.portfolio.netLiquidationValue),
            grossExposure: decimal(input.portfolio.grossExposure),
            realizedPnl: decimal(input.portfolio.realizedPnl),
            unrealizedPnl: decimal(input.portfolio.unrealizedPnl),
            valuationTimestamp: new Date(input.portfolio.valuationTimestamp),
          },
        });
      }

      for (const snapshot of input.snapshots ?? []) {
        await tx.portfolioSnapshot.create({
          data: {
            id: snapshot.snapshotId,
            simulationAccountId,
            cashBalance: decimal(snapshot.cashBalance),
            grossExposure: decimal(snapshot.grossExposure),
            netLiquidationValue: decimal(snapshot.netLiquidationValue),
            realizedPnl: decimal(snapshot.realizedPnl),
            unrealizedPnl: decimal(snapshot.unrealizedPnl),
            timestamp: new Date(snapshot.timestamp),
            sourceEventId: snapshot.sourceEventId,
          },
        });
      }

      const view = await getCurrentPortfolioViewWithClient(
        tx,
        simulationAccountId,
      );

      if (!view) {
        throw new Error(
          `Failed to load persisted simulator portfolio view for ${simulationAccountId}.`,
        );
      }

      return view;
    });
  }

  getCurrentPortfolioView(
    simulationAccountId: string,
  ): Promise<SimulatorPortfolioView | null> {
    return getCurrentPortfolioViewWithClient(this.client, simulationAccountId);
  }

  getPortfolioHistory(
    simulationAccountId: string,
    options?: SimulatorHistoryQueryOptions,
  ): Promise<SimulatorPortfolioHistory> {
    return getPortfolioHistoryWithClient(
      this.client,
      simulationAccountId,
      options,
    );
  }
}
