import type { ServiceRuntimeDescriptor } from '@ctb/types';

export function summarizeDependencies(
  descriptor: Pick<ServiceRuntimeDescriptor, 'dependencies'>,
): string[] {
  return descriptor.dependencies.map((dependency) => dependency.name);
}
