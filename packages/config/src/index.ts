import type { DependencyDescriptor } from '@ctb/types';

export const defaultServicePortMap = {
  api: 3010,
  web: 3020,
  'simulator-worker': 3030,
  'reporting-worker': 3040,
  'notification-worker': 3050,
} as const;

export function createLocalDependencyConfig(): DependencyDescriptor[] {
  return [
    {
      name: 'postgres',
      url: 'http://localhost:5432',
      state: 'configured',
    },
    {
      name: 'redis',
      url: 'http://localhost:6379',
      state: 'configured',
    },
  ];
}
