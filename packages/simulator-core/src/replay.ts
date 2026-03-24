import { createHash } from 'node:crypto';

import {
  replayableSimulatorStateSchema,
  simulatorReplayResultSchema,
  simulatorReplayVerificationSchema,
} from '@ctb/schemas';
import type {
  ReplayableSimulatorState,
  SimulatorReplayPosition,
  SimulatorReplayResult,
  SimulatorReplayVerification,
} from '@ctb/types';

const SCALE = 100_000_000n;

interface MutableReplayPosition {
  instrumentId: string;
  quantity: bigint;
  averageEntryCost: bigint;
  marketValue: bigint;
  realizedPnl: bigint;
  unrealizedPnl: bigint;
}

function parseDecimal(value: string): bigint {
  const match = value.match(/^(-?)(\d+)(?:\.(\d+))?$/);

  if (!match) {
    throw new Error(`Invalid decimal value: ${value}`);
  }

  const [, sign, integerPart, fractionPart = ''] = match;
  const normalizedFraction = `${fractionPart}00000000`.slice(0, 8);
  const scaled =
    BigInt(integerPart) * SCALE + BigInt(normalizedFraction || '0');

  return sign === '-' ? -scaled : scaled;
}

function formatDecimal(value: bigint): string {
  const sign = value < 0n ? '-' : '';
  const absolute = value < 0n ? -value : value;
  const integerPart = absolute / SCALE;
  const fractionPart = (absolute % SCALE).toString().padStart(8, '0');
  const trimmedFraction = fractionPart.replace(/0+$/, '');

  return `${sign}${integerPart.toString()}${
    trimmedFraction ? `.${trimmedFraction}` : ''
  }`;
}

function multiplyScaled(left: bigint, right: bigint): bigint {
  return (left * right) / SCALE;
}

function divideScaled(numerator: bigint, denominator: bigint): bigint {
  if (denominator === 0n) {
    return 0n;
  }

  return (numerator * SCALE) / denominator;
}

function compareDecimalStrings(left: string, right: string): boolean {
  return parseDecimal(left) === parseDecimal(right);
}

function positionComparator(
  left: { instrumentId: string },
  right: { instrumentId: string },
): number {
  return left.instrumentId.localeCompare(right.instrumentId);
}

function normalizePosition(
  position: MutableReplayPosition,
): SimulatorReplayPosition {
  return {
    instrumentId: position.instrumentId,
    quantity: formatDecimal(position.quantity),
    averageEntryCost: formatDecimal(position.averageEntryCost),
    marketValue: formatDecimal(position.marketValue),
    realizedPnl: formatDecimal(position.realizedPnl),
    unrealizedPnl: formatDecimal(position.unrealizedPnl),
  };
}

function comparePositions(
  left: SimulatorReplayPosition[],
  right: ReplayableSimulatorState['currentView'] extends infer T
    ? T extends { positions: infer U }
      ? U
      : never
    : never,
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const normalizedLeft = [...left].sort(positionComparator);
  const normalizedRight = [...right].sort(positionComparator);

  return normalizedLeft.every((position, index) => {
    const candidate = normalizedRight[index];

    if (!candidate) {
      return false;
    }

    return (
      position.instrumentId === candidate.instrumentId &&
      compareDecimalStrings(position.quantity, candidate.quantity) &&
      compareDecimalStrings(
        position.averageEntryCost,
        candidate.averageEntryCost,
      ) &&
      compareDecimalStrings(position.marketValue, candidate.marketValue) &&
      compareDecimalStrings(position.realizedPnl, candidate.realizedPnl) &&
      compareDecimalStrings(position.unrealizedPnl, candidate.unrealizedPnl)
    );
  });
}

export function replaySimulatorState(
  rawInput: ReplayableSimulatorState,
): SimulatorReplayResult {
  const input = replayableSimulatorStateSchema.parse(rawInput);
  const orderedEvents = [...input.events].sort((left, right) => {
    const timestampDifference =
      new Date(left.eventTimestamp).getTime() -
      new Date(right.eventTimestamp).getTime();

    if (timestampDifference !== 0) {
      return timestampDifference;
    }

    const sequenceDifference = left.sequenceKey.localeCompare(
      right.sequenceKey,
    );
    if (sequenceDifference !== 0) {
      return sequenceDifference;
    }

    return left.simulatorEventId.localeCompare(right.simulatorEventId);
  });
  const orderSideById = new Map(
    input.orders.map((order) => [order.simulatedOrderId, order.side]),
  );
  const fillById = new Map(
    input.fills.map((fill) => [fill.simulatedFillId, fill]),
  );
  const processedFillIds = new Set<string>();
  const processedEventIds = new Set<string>();
  const positions = new Map<string, MutableReplayPosition>();
  let cashBalance = parseDecimal(input.simulationAccount.startingBalance);

  for (const event of orderedEvents) {
    processedEventIds.add(event.simulatorEventId);

    if (
      event.eventType === 'order-filled' ||
      event.eventType === 'order-partially-filled'
    ) {
      const fill = fillById.get(event.payload.simulatedFillId);

      if (!fill) {
        throw new Error(
          `Replay requires fill ${event.payload.simulatedFillId} referenced by event ${event.simulatorEventId}.`,
        );
      }

      if (processedFillIds.has(fill.simulatedFillId)) {
        continue;
      }

      const side = orderSideById.get(fill.simulatedOrderId);
      if (!side) {
        throw new Error(
          `Replay requires order ${fill.simulatedOrderId} so fill ${fill.simulatedFillId} can be applied deterministically.`,
        );
      }

      const quantity = parseDecimal(fill.fillQuantity);
      const fillPrice = parseDecimal(fill.fillPrice);
      const fee = parseDecimal(fill.simulatedFeeAmount);
      const slippage = parseDecimal(fill.slippageAmount);
      const grossFillValue = multiplyScaled(quantity, fillPrice);
      const position = positions.get(fill.instrumentId) ?? {
        instrumentId: fill.instrumentId,
        quantity: 0n,
        averageEntryCost: 0n,
        marketValue: 0n,
        realizedPnl: 0n,
        unrealizedPnl: 0n,
      };

      if (side === 'sell') {
        cashBalance += grossFillValue - fee - slippage;
        position.realizedPnl +=
          grossFillValue -
          multiplyScaled(position.averageEntryCost, quantity) -
          fee -
          slippage;
        position.quantity -= quantity;

        if (position.quantity <= 0n) {
          position.quantity = 0n;
          position.averageEntryCost = 0n;
          position.marketValue = 0n;
          position.unrealizedPnl = 0n;
        }
      } else {
        const totalCostBasis =
          multiplyScaled(position.averageEntryCost, position.quantity) +
          grossFillValue;

        cashBalance -= grossFillValue + fee + slippage;
        position.quantity += quantity;
        position.averageEntryCost = divideScaled(
          totalCostBasis,
          position.quantity,
        );
      }

      positions.set(fill.instrumentId, position);
      processedFillIds.add(fill.simulatedFillId);
    }

    if (event.eventType === 'position-revalued') {
      const position = positions.get(event.payload.instrumentId) ?? {
        instrumentId: event.payload.instrumentId,
        quantity: 0n,
        averageEntryCost: 0n,
        marketValue: 0n,
        realizedPnl: 0n,
        unrealizedPnl: 0n,
      };

      position.marketValue = parseDecimal(event.payload.marketValue);
      position.unrealizedPnl = parseDecimal(event.payload.unrealizedPnl);
      positions.set(event.payload.instrumentId, position);
    }

    if (event.eventType === 'account-adjusted') {
      cashBalance += parseDecimal(event.payload.amount);
    }
  }

  if (processedFillIds.size !== input.fills.length) {
    const missingFillId = input.fills.find(
      (fill) => !processedFillIds.has(fill.simulatedFillId),
    )?.simulatedFillId;

    throw new Error(
      `Replay drift detected: fill ${missingFillId ?? 'unknown'} was never applied by the event stream.`,
    );
  }

  const normalizedPositions = [...positions.values()]
    .filter(
      (position) => position.quantity !== 0n || position.marketValue !== 0n,
    )
    .map(normalizePosition)
    .sort(positionComparator);
  const grossExposure = normalizedPositions.reduce(
    (total, position) => total + parseDecimal(position.marketValue),
    0n,
  );
  const realizedPnl = normalizedPositions.reduce(
    (total, position) => total + parseDecimal(position.realizedPnl),
    0n,
  );
  const unrealizedPnl = normalizedPositions.reduce(
    (total, position) => total + parseDecimal(position.unrealizedPnl),
    0n,
  );
  const netLiquidationValue = cashBalance + grossExposure;
  const replayDigest = createHash('sha256')
    .update(
      JSON.stringify({
        simulationAccountId: input.simulationAccount.simulationAccountId,
        cashBalance: formatDecimal(cashBalance),
        grossExposure: formatDecimal(grossExposure),
        netLiquidationValue: formatDecimal(netLiquidationValue),
        realizedPnl: formatDecimal(realizedPnl),
        unrealizedPnl: formatDecimal(unrealizedPnl),
        processedEventIds: [...processedEventIds],
        processedFillIds: [...processedFillIds],
        positions: normalizedPositions,
      }),
    )
    .digest('hex');

  return simulatorReplayResultSchema.parse({
    simulationAccountId: input.simulationAccount.simulationAccountId,
    cashBalance: formatDecimal(cashBalance),
    grossExposure: formatDecimal(grossExposure),
    netLiquidationValue: formatDecimal(netLiquidationValue),
    realizedPnl: formatDecimal(realizedPnl),
    unrealizedPnl: formatDecimal(unrealizedPnl),
    processedEventIds: [...processedEventIds],
    processedFillIds: [...processedFillIds],
    positions: normalizedPositions,
    replayDigest,
  });
}

export function verifyDeterministicReplay(rawInput: ReplayableSimulatorState) {
  const firstReplay = replaySimulatorState(rawInput);
  const secondReplay = replaySimulatorState(rawInput);

  if (firstReplay.replayDigest !== secondReplay.replayDigest) {
    throw new Error(
      'Replay drift detected: repeated execution changed the digest.',
    );
  }

  const latestSnapshot = rawInput.snapshots?.at(-1) ?? null;
  const currentView = rawInput.currentView ?? null;
  let latestSnapshotMatched = true;

  if (latestSnapshot) {
    latestSnapshotMatched =
      compareDecimalStrings(
        firstReplay.cashBalance,
        latestSnapshot.cashBalance,
      ) &&
      compareDecimalStrings(
        firstReplay.grossExposure,
        latestSnapshot.grossExposure,
      ) &&
      compareDecimalStrings(
        firstReplay.netLiquidationValue,
        latestSnapshot.netLiquidationValue,
      ) &&
      compareDecimalStrings(
        firstReplay.realizedPnl,
        latestSnapshot.realizedPnl,
      ) &&
      compareDecimalStrings(
        firstReplay.unrealizedPnl,
        latestSnapshot.unrealizedPnl,
      );

    if (!latestSnapshotMatched) {
      throw new Error(
        `Replay drift detected: latest snapshot ${latestSnapshot.snapshotId} does not match replay output.`,
      );
    }
  }

  let currentViewMatched = true;

  if (currentView) {
    currentViewMatched =
      compareDecimalStrings(
        firstReplay.cashBalance,
        currentView.simulationAccount.currentCashBalance,
      ) &&
      comparePositions(firstReplay.positions, currentView.positions) &&
      (currentView.portfolio
        ? compareDecimalStrings(
            firstReplay.netLiquidationValue,
            currentView.portfolio.netLiquidationValue,
          ) &&
          compareDecimalStrings(
            firstReplay.grossExposure,
            currentView.portfolio.grossExposure,
          ) &&
          compareDecimalStrings(
            firstReplay.realizedPnl,
            currentView.portfolio.realizedPnl,
          ) &&
          compareDecimalStrings(
            firstReplay.unrealizedPnl,
            currentView.portfolio.unrealizedPnl,
          )
        : true);

    if (!currentViewMatched) {
      throw new Error(
        `Replay drift detected: current portfolio view for ${firstReplay.simulationAccountId} does not match replay output.`,
      );
    }
  }

  return simulatorReplayVerificationSchema.parse({
    replay: firstReplay,
    latestSnapshotId: latestSnapshot?.snapshotId ?? null,
    currentViewMatched,
    latestSnapshotMatched,
  }) satisfies SimulatorReplayVerification;
}
