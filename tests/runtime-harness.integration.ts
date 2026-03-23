import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { test } from 'node:test';

import { PrismaClient } from '@prisma/client';

import { startApiWorkspace } from '../apps/api/src/index.ts';
import {
  listReservedSimulatorWork,
  reserveSimulatorWork,
} from '../apps/simulator-worker/src/runtime-state.ts';
import {
  createRuntimeDependencyHarness,
  isContainerRuntimeUnavailable,
} from '../packages/test-utils/src/index.ts';

const execFileAsync = promisify(execFile);
const repositoryRoot = new URL('../', import.meta.url);

test('runtime harness validates api boot, prisma access, and redis dedupe', async (t) => {
  let harness;

  try {
    harness = await createRuntimeDependencyHarness();
  } catch (error) {
    if (isContainerRuntimeUnavailable(error)) {
      t.skip('Docker or another supported container runtime is unavailable.');
      return;
    }

    throw error;
  }

  const runtimeEnvironment = {
    ...process.env,
    POSTGRES_URL: harness.postgresUrl,
    REDIS_URL: harness.redisUrl,
  };

  const prisma = new PrismaClient({
    datasourceUrl: harness.postgresUrl,
  });

  let server;

  try {
    await execFileAsync('pnpm', ['db:migrate:deploy'], {
      cwd: repositoryRoot,
      env: runtimeEnvironment,
    });

    await prisma.runtimeHeartbeat.create({
      data: {
        service: 'integration-test',
        startedAt: new Date(),
      },
    });

    const heartbeatCount = await prisma.runtimeHeartbeat.count();
    assert.equal(heartbeatCount, 1);

    const apiWorkspace = await startApiWorkspace(0, runtimeEnvironment);
    server = apiWorkspace.server;

    const address = server.address();
    assert.ok(address && typeof address === 'object');
    assert.equal(
      apiWorkspace.descriptor.dependencies[0]?.url,
      harness.postgresUrl,
    );
    assert.equal(
      apiWorkspace.descriptor.dependencies[1]?.url,
      harness.redisUrl,
    );

    const healthResponse = await fetch(
      `http://127.0.0.1:${address.port}/health`,
    );
    assert.equal(healthResponse.status, 200);

    const firstReservation = await reserveSimulatorWork('market-open-1', {
      redisUrl: harness.redisUrl,
      cooldownSeconds: 60,
    });
    const duplicateReservation = await reserveSimulatorWork('market-open-1', {
      redisUrl: harness.redisUrl,
      cooldownSeconds: 60,
    });

    assert.equal(firstReservation.accepted, true);
    assert.equal(firstReservation.pendingItems, 1);
    assert.equal(duplicateReservation.accepted, false);

    const queuedItems = await listReservedSimulatorWork({
      redisUrl: harness.redisUrl,
    });
    assert.equal(queuedItems.length, 1);
    assert.match(queuedItems[0] ?? '', /market-open-1/);
  } finally {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }

    await prisma.$disconnect();
    await harness.stop();
  }
});
