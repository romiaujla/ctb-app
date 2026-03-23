import http from 'node:http';

import { createLocalDependencyConfig, loadRuntimeConfig } from '@ctb/config';
import { serviceRuntimeDescriptorSchema } from '@ctb/schemas';
import type { ServiceRuntimeDescriptor } from '@ctb/types';

export function buildApiRuntimeDescriptor(
  rawEnvironment: NodeJS.ProcessEnv = process.env,
): ServiceRuntimeDescriptor {
  const runtimeConfig = loadRuntimeConfig('api', rawEnvironment);

  return serviceRuntimeDescriptorSchema.parse({
    name: 'api',
    role: 'CTB control-plane placeholder runtime',
    startupMessage: `CTB API workspace is listening on port ${runtimeConfig.port} with local dependency placeholders.`,
    dependencies: createLocalDependencyConfig({
      postgresUrl: runtimeConfig.postgresUrl,
      redisUrl: runtimeConfig.redisUrl,
    }),
  });
}

export async function startApiWorkspace(
  port?: number,
  rawEnvironment: NodeJS.ProcessEnv = process.env,
) {
  const serviceEnvironment = {
    ...rawEnvironment,
    PORT: String(port ?? rawEnvironment.PORT ?? 3010),
  };
  const runtimeConfig = loadRuntimeConfig('api', serviceEnvironment);
  const descriptor = buildApiRuntimeDescriptor(serviceEnvironment);

  const server = http.createServer((request, response) => {
    if (request.url === '/health') {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ ok: true, service: descriptor.name }));
      return;
    }

    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify(descriptor));
  });

  await new Promise<void>((resolve) => {
    server.listen(runtimeConfig.port, resolve);
  });

  console.log(
    `${descriptor.startupMessage} Port: ${(server.address() as { port: number }).port}`,
  );

  return { descriptor, server };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void startApiWorkspace();
}
