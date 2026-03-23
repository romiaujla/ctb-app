import { Redis } from 'ioredis';

import { loadRuntimeConfig } from '@ctb/config';
import { simulatorQueueReservationSchema } from '@ctb/schemas';
import type { SimulatorQueueReservation } from '@ctb/types';

const defaultQueueKey = 'ctb:simulator:work';
const defaultDedupeNamespace = 'ctb:simulator:dedupe';

function buildRedisClient(redisUrl?: string) {
  return new Redis(redisUrl ?? loadRuntimeConfig('simulator-worker').redisUrl, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
  });
}

export async function reserveSimulatorWork(
  eventId: string,
  options?: {
    client?: Redis;
    redisUrl?: string;
    queueKey?: string;
    dedupeNamespace?: string;
    cooldownSeconds?: number;
  },
): Promise<SimulatorQueueReservation> {
  const client = options?.client ?? buildRedisClient(options?.redisUrl);
  const ownsClient = !options?.client;
  const queueKey = options?.queueKey ?? defaultQueueKey;
  const dedupeKey = `${options?.dedupeNamespace ?? defaultDedupeNamespace}:${eventId}`;
  const cooldownSeconds = options?.cooldownSeconds ?? 300;

  try {
    const accepted =
      (await client.set(
        dedupeKey,
        new Date().toISOString(),
        'EX',
        cooldownSeconds,
        'NX',
      )) === 'OK';

    const pendingItems = accepted
      ? await client.rpush(
          queueKey,
          JSON.stringify({ eventId, enqueuedAt: new Date().toISOString() }),
        )
      : await client.llen(queueKey);

    return simulatorQueueReservationSchema.parse({
      accepted,
      eventId,
      queueKey,
      dedupeKey,
      pendingItems,
    });
  } finally {
    if (ownsClient) {
      await client.quit();
    }
  }
}

export async function listReservedSimulatorWork(options?: {
  client?: Redis;
  redisUrl?: string;
  queueKey?: string;
}): Promise<string[]> {
  const client = options?.client ?? buildRedisClient(options?.redisUrl);
  const ownsClient = !options?.client;
  const queueKey = options?.queueKey ?? defaultQueueKey;

  try {
    return client.lrange(queueKey, 0, -1);
  } finally {
    if (ownsClient) {
      await client.quit();
    }
  }
}
