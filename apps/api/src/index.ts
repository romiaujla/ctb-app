import http from 'node:http';
import { URL } from 'node:url';

import { createLocalDependencyConfig, loadRuntimeConfig } from '@ctb/config';
import {
  PrismaMarketDataRepository,
  type MarketDataRepository,
} from '@ctb/market-data';
import { serviceRuntimeDescriptorSchema } from '@ctb/schemas';
import type { ServiceRuntimeDescriptor } from '@ctb/types';
import { PrismaClient } from '@prisma/client';

function summarizeMarketDataHealth({
  recentDecisions,
  recentEvents,
  recentRuns,
}: {
  recentRuns: Awaited<ReturnType<MarketDataRepository['getRecentIngestRuns']>>;
  recentDecisions: Awaited<
    ReturnType<MarketDataRepository['getRecentIngestDecisions']>
  >;
  recentEvents: Awaited<
    ReturnType<MarketDataRepository['getCanonicalEventHistory']>
  >;
}) {
  const latestRun = recentRuns[0] ?? null;
  const duplicateCount = recentDecisions.filter(
    (decision) => decision.decisionType === 'duplicate',
  ).length;
  const rejectedCount = recentDecisions.filter(
    (decision) => decision.decisionType === 'rejected',
  ).length;
  const latestEvent = recentEvents.at(-1) ?? null;

  return {
    overallStatus: !latestRun
      ? 'unavailable'
      : latestRun.status === 'succeeded' && rejectedCount === 0
        ? 'healthy'
        : 'degraded',
    latestRun,
    latestEvent,
    duplicateCount,
    rejectedCount,
    recentDecisions,
    recentEvents,
  };
}

export function createApiRequestHandler(options?: {
  marketDataRepository?: MarketDataRepository;
}) {
  return async (
    request: http.IncomingMessage,
    response: http.ServerResponse,
  ) => {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');

    if (requestUrl.pathname === '/health') {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ ok: true, service: 'api' }));
      return;
    }

    if (
      requestUrl.pathname === '/api/v1/status/market-data' &&
      options?.marketDataRepository
    ) {
      const [recentRuns, recentDecisions, recentEvents] = await Promise.all([
        options.marketDataRepository.getRecentIngestRuns(5),
        options.marketDataRepository.getRecentIngestDecisions(10),
        options.marketDataRepository.getCanonicalEventHistory({ limit: 10 }),
      ]);
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(
        JSON.stringify(
          summarizeMarketDataHealth({
            recentRuns,
            recentDecisions,
            recentEvents,
          }),
        ),
      );
      return;
    }

    if (
      requestUrl.pathname === '/api/v1/market-data/history' &&
      options?.marketDataRepository
    ) {
      const instrumentId =
        requestUrl.searchParams.get('instrumentId') ?? undefined;
      const eventType = requestUrl.searchParams.get('eventType') ?? undefined;
      const limitValue = requestUrl.searchParams.get('limit');
      const limit = limitValue ? Number(limitValue) : undefined;
      const events =
        await options.marketDataRepository.getCanonicalEventHistory({
          instrumentId,
          eventType: eventType as
            | 'quote'
            | 'trade'
            | 'bar'
            | 'status'
            | undefined,
          limit,
        });

      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ events }));
      return;
    }

    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify(buildApiRuntimeDescriptor()));
  };
}

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
  options?: {
    marketDataRepository?: MarketDataRepository;
  },
) {
  const serviceEnvironment = {
    ...rawEnvironment,
    PORT: String(port ?? rawEnvironment.PORT ?? 3010),
  };
  const runtimeConfig = loadRuntimeConfig('api', serviceEnvironment);
  const descriptor = buildApiRuntimeDescriptor(serviceEnvironment);
  const prisma = options?.marketDataRepository
    ? null
    : new PrismaClient({
        datasourceUrl: runtimeConfig.postgresUrl,
      });
  const marketDataRepository =
    options?.marketDataRepository ??
    (prisma ? new PrismaMarketDataRepository(prisma) : undefined);

  const server = http.createServer(
    createApiRequestHandler({ marketDataRepository }),
  );

  await new Promise<void>((resolve) => {
    server.listen(runtimeConfig.port, resolve);
  });

  console.log(
    `${descriptor.startupMessage} Port: ${(server.address() as { port: number }).port}`,
  );

  return { descriptor, server, prisma };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void startApiWorkspace();
}
