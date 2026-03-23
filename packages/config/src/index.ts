import type { DependencyDescriptor } from '@ctb/types';

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
