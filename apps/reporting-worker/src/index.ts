import { createLocalDependencyConfig } from '@ctb/config';
import type { ServiceRuntimeDescriptor } from '@ctb/types';

export function startReportingWorkerScaffold(): ServiceRuntimeDescriptor {
  const descriptor: ServiceRuntimeDescriptor = {
    name: 'reporting-worker',
    role: 'CTB report generation placeholder worker',
    startupMessage:
      'CTB reporting worker is wired to the shared workspace packages.',
    dependencies: createLocalDependencyConfig(),
  };

  console.log(descriptor.startupMessage);

  return descriptor;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startReportingWorkerScaffold();
}
