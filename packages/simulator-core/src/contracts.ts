import { simulatorPersistenceContractSchema } from '@ctb/schemas';
import type {
  SimulatorPersistenceContract,
  SimulatorPersistenceEntity,
} from '@ctb/types';

export const simulatorPersistenceContracts: SimulatorPersistenceContract[] = [
  {
    entity: 'simulation-account',
    truthKind: 'system-of-record',
    storageKind: 'current-state',
    durable: true,
    identifierFields: ['simulationAccountId'],
    systemOfRecord: true,
    description:
      'Owns the ledger boundary, cash state, and configuration lineage for one simulator account.',
  },
  {
    entity: 'simulated-order',
    truthKind: 'system-of-record',
    storageKind: 'current-state',
    durable: true,
    identifierFields: ['simulatedOrderId', 'simulationAccountId'],
    systemOfRecord: true,
    description:
      'Captures the accepted order request boundary and current execution status.',
  },
  {
    entity: 'simulated-fill',
    truthKind: 'system-of-record',
    storageKind: 'append-only',
    durable: true,
    identifierFields: ['simulatedFillId', 'simulatedOrderId'],
    systemOfRecord: true,
    description:
      'Stores immutable executed quantity, price, fee, and slippage facts.',
  },
  {
    entity: 'simulator-event',
    truthKind: 'system-of-record',
    storageKind: 'append-only',
    durable: true,
    identifierFields: [
      'simulatorEventId',
      'simulationAccountId',
      'sequenceKey',
    ],
    systemOfRecord: true,
    description:
      'Stores the append-only canonical event history used for audit and replay.',
  },
  {
    entity: 'position',
    truthKind: 'derived-view',
    storageKind: 'current-state',
    durable: true,
    identifierFields: ['simulationAccountId', 'instrumentId'],
    systemOfRecord: false,
    description:
      'Represents the latest derived holding state rebuilt from fills and valuation events.',
  },
  {
    entity: 'portfolio',
    truthKind: 'derived-view',
    storageKind: 'current-state',
    durable: true,
    identifierFields: ['portfolioId', 'simulationAccountId'],
    systemOfRecord: false,
    description:
      'Represents the latest derived portfolio totals exposed to downstream consumers.',
  },
  {
    entity: 'portfolio-snapshot',
    truthKind: 'derived-view',
    storageKind: 'point-in-time-snapshot',
    durable: true,
    identifierFields: ['snapshotId', 'simulationAccountId', 'sourceEventId'],
    systemOfRecord: false,
    description:
      'Captures a durable point-in-time portfolio projection for reporting and audit inspection.',
  },
].map((contract) => simulatorPersistenceContractSchema.parse(contract));

const persistenceContractMap = new Map(
  simulatorPersistenceContracts.map((contract) => [contract.entity, contract]),
);

export const appendOnlySimulatorEntities: SimulatorPersistenceEntity[] =
  simulatorPersistenceContracts
    .filter((contract) => contract.storageKind === 'append-only')
    .map((contract) => contract.entity);

export const simulatorSystemOfRecordEntities: SimulatorPersistenceEntity[] =
  simulatorPersistenceContracts
    .filter((contract) => contract.systemOfRecord)
    .map((contract) => contract.entity);

export function getSimulatorPersistenceContract(
  entity: SimulatorPersistenceEntity,
): SimulatorPersistenceContract {
  const contract = persistenceContractMap.get(entity);

  if (!contract) {
    throw new Error(`Unknown simulator persistence entity: ${entity}`);
  }

  return contract;
}

export function isDerivedSimulatorEntity(
  entity: SimulatorPersistenceEntity,
): boolean {
  return getSimulatorPersistenceContract(entity).truthKind === 'derived-view';
}
