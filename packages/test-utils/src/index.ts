import { GenericContainer, Wait } from 'testcontainers';

import type { ServiceRuntimeDescriptor } from '@ctb/types';

export function summarizeDependencies(
  descriptor: Pick<ServiceRuntimeDescriptor, 'dependencies'>,
): string[] {
  return descriptor.dependencies.map((dependency) => dependency.name);
}

export interface RuntimeDependencyHarness {
  postgresUrl: string;
  redisUrl: string;
  stop(): Promise<void>;
}

export async function createRuntimeDependencyHarness(): Promise<RuntimeDependencyHarness> {
  const postgresPassword = 'ctb';
  const postgresContainer = await new GenericContainer('postgres:16-alpine')
    .withEnvironment({
      POSTGRES_DB: 'ctb_app',
      POSTGRES_USER: 'ctb',
      POSTGRES_PASSWORD: postgresPassword,
    })
    .withExposedPorts(5432)
    .withWaitStrategy(
      Wait.forLogMessage('database system is ready to accept connections'),
    )
    .start();

  const redisContainer = await new GenericContainer('redis:7-alpine')
    .withExposedPorts(6379)
    .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
    .start();

  return {
    postgresUrl: `postgresql://ctb:${postgresPassword}@${postgresContainer.getHost()}:${postgresContainer.getMappedPort(5432)}/ctb_app`,
    redisUrl: `redis://${redisContainer.getHost()}:${redisContainer.getMappedPort(6379)}`,
    async stop() {
      await Promise.all([redisContainer.stop(), postgresContainer.stop()]);
    },
  };
}

export function isContainerRuntimeUnavailable(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return /container runtime strategy|docker|podman/i.test(error.message);
}
