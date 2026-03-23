import { test } from 'node:test';
import assert from 'node:assert/strict';

import { startApiWorkspace } from '../apps/api/src/index.ts';
import { startNotificationWorkerScaffold } from '../apps/notification-worker/src/index.ts';
import { startReportingWorkerScaffold } from '../apps/reporting-worker/src/index.ts';
import { startSimulatorWorkerScaffold } from '../apps/simulator-worker/src/index.ts';
import { bootstrapWebScaffold } from '../apps/web/src/main.ts';
import {
  createLocalDependencyConfig,
  loadRuntimeConfig,
} from '../packages/config/src/index.ts';

test('api workspace starts and serves a health response', async () => {
  const { descriptor, server } = await startApiWorkspace(0);
  const address = server.address();

  assert.ok(address && typeof address === 'object');

  const response = await fetch(`http://127.0.0.1:${address.port}/health`);
  const payload = await response.json();

  assert.equal(payload.ok, true);
  assert.equal(payload.service, descriptor.name);

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

test('web scaffold remains importable', () => {
  assert.match(bootstrapWebScaffold(), /web workspace/);
});

test('simulator worker scaffold remains importable', () => {
  const heartbeat = startSimulatorWorkerScaffold();
  assert.equal(heartbeat.service, 'simulator-worker');
  assert.deepEqual(heartbeat.dependencies, ['postgres', 'redis']);
});

test('reporting worker scaffold remains importable', () => {
  assert.match(
    startReportingWorkerScaffold().startupMessage,
    /reporting worker/,
  );
});

test('notification worker scaffold remains importable', () => {
  assert.match(
    startNotificationWorkerScaffold().startupMessage,
    /notification worker/,
  );
});

test('shared config exposes local dependency placeholders', () => {
  assert.deepEqual(
    createLocalDependencyConfig().map((dependency) => dependency.name),
    ['postgres', 'redis'],
  );
});

test('shared runtime config validates env input', () => {
  const runtimeConfig = loadRuntimeConfig('api', {
    PORT: '4010',
    POSTGRES_URL: 'postgresql://ctb:ctb@localhost:5432/ctb_app',
    REDIS_URL: 'redis://localhost:6379',
  });

  assert.equal(runtimeConfig.port, 4010);
  assert.equal(runtimeConfig.serviceName, 'api');
});
