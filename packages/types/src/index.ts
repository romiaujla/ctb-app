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

export interface SimulatorQueueReservation {
  accepted: boolean;
  eventId: string;
  queueKey: string;
  dedupeKey: string;
  pendingItems: number;
}
