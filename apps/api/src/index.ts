import http from 'node:http';

import {
  createLocalDependencyConfig,
  defaultServicePortMap,
} from '@ctb/config';
import { serviceRuntimeDescriptorSchema } from '@ctb/schemas';
import type { ServiceRuntimeDescriptor } from '@ctb/types';

export function buildApiRuntimeDescriptor(): ServiceRuntimeDescriptor {
  const port = Number(process.env.PORT ?? defaultServicePortMap.api);

  return serviceRuntimeDescriptorSchema.parse({
    name: 'api',
    role: 'CTB control-plane placeholder runtime',
    startupMessage: `CTB API workspace is listening on port ${port} with local dependency placeholders.`,
    dependencies: createLocalDependencyConfig({
      postgresUrl: process.env.POSTGRES_URL,
      redisUrl: process.env.REDIS_URL,
    }),
  });
}

export async function startApiWorkspace(port = defaultServicePortMap.api) {
  const descriptor = buildApiRuntimeDescriptor();

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
    server.listen(port, resolve);
  });

  console.log(
    `${descriptor.startupMessage} Port: ${(server.address() as { port: number }).port}`,
  );

  return { descriptor, server };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void startApiWorkspace();
}
