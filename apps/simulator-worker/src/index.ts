import { createLocalDependencyConfig, loadRuntimeConfig } from '@ctb/config';
import {
  serviceHeartbeatSchema,
  serviceRuntimeDescriptorSchema,
} from '@ctb/schemas';
import { summarizeDependencies } from '@ctb/test-utils';
import type { ServiceHeartbeat, ServiceRuntimeDescriptor } from '@ctb/types';

export function buildSimulatorWorkerRuntimeDescriptor(): ServiceRuntimeDescriptor {
  const runtimeConfig = loadRuntimeConfig('simulator-worker', {
    ...process.env,
    PORT: String(process.env.PORT ?? 3030),
  });

  return serviceRuntimeDescriptorSchema.parse({
    name: 'simulator-worker',
    role: 'CTB simulation and market-data placeholder worker',
    startupMessage:
      'CTB simulator worker is ready with local Postgres and Redis placeholders.',
    dependencies: createLocalDependencyConfig({
      postgresUrl: runtimeConfig.postgresUrl,
      redisUrl: runtimeConfig.redisUrl,
    }),
  });
}

export function startSimulatorWorkerScaffold(): ServiceHeartbeat {
  const descriptor = buildSimulatorWorkerRuntimeDescriptor();
  const heartbeat = serviceHeartbeatSchema.parse({
    service: descriptor.name,
    startedAt: new Date().toISOString(),
    dependencies: summarizeDependencies(descriptor),
  });

  console.log(
    `${descriptor.startupMessage} Dependencies: ${heartbeat.dependencies.join(', ')}`,
  );

  return heartbeat;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startSimulatorWorkerScaffold();
}
