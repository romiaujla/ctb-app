import { runtimeEnvironmentSchema } from '@ctb/schemas';
import type { DependencyDescriptor, RuntimeConfig } from '@ctb/types';

export const defaultServicePortMap = {
  api: 3010,
  web: 3020,
  'simulator-worker': 3030,
  'reporting-worker': 3040,
  'notification-worker': 3050,
} as const;

export function createLocalDependencyConfig(options?: {
  postgresUrl?: string;
  redisUrl?: string;
}): DependencyDescriptor[] {
  return [
    {
      name: 'postgres',
      url:
        options?.postgresUrl ?? 'postgresql://ctb:ctb@localhost:5432/ctb_app',
      state: 'configured',
    },
    {
      name: 'redis',
      url: options?.redisUrl ?? 'redis://localhost:6379',
      state: 'configured',
    },
  ];
}

export function loadRuntimeConfig(
  serviceName: string,
  rawEnvironment: NodeJS.ProcessEnv = process.env,
): RuntimeConfig {
  const parsed = runtimeEnvironmentSchema.parse({
    PORT: rawEnvironment.PORT ?? defaultServicePortMap.api,
    POSTGRES_URL:
      rawEnvironment.POSTGRES_URL ??
      'postgresql://ctb:ctb@localhost:5432/ctb_app',
    REDIS_URL: rawEnvironment.REDIS_URL ?? 'redis://localhost:6379',
  });

  return {
    serviceName,
    port: parsed.PORT,
    postgresUrl: parsed.POSTGRES_URL,
    redisUrl: parsed.REDIS_URL,
  };
}
