import { createLocalDependencyConfig } from '@ctb/config';
import type { ServiceRuntimeDescriptor } from '@ctb/types';

export function startNotificationWorkerScaffold(): ServiceRuntimeDescriptor {
  const descriptor: ServiceRuntimeDescriptor = {
    name: 'notification-worker',
    role: 'CTB owner notification placeholder worker',
    startupMessage:
      'CTB notification worker is wired to shared runtime descriptors.',
    dependencies: createLocalDependencyConfig(),
  };

  console.log(descriptor.startupMessage);

  return descriptor;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startNotificationWorkerScaffold();
}
