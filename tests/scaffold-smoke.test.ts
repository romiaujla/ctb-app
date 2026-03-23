import { test } from 'node:test';
import assert from 'node:assert/strict';

import { startApiScaffold } from '../apps/api/src/index.ts';
import { startNotificationWorkerScaffold } from '../apps/notification-worker/src/index.ts';
import { startReportingWorkerScaffold } from '../apps/reporting-worker/src/index.ts';
import { startSimulatorWorkerScaffold } from '../apps/simulator-worker/src/index.ts';
import { bootstrapWebScaffold } from '../apps/web/src/main.ts';

test('api scaffold remains importable', () => {
  assert.match(startApiScaffold(), /API scaffold/);
});

test('web scaffold remains importable', () => {
  assert.match(bootstrapWebScaffold(), /web scaffold/);
});

test('simulator worker scaffold remains importable', () => {
  assert.match(startSimulatorWorkerScaffold(), /simulator-worker scaffold/);
});

test('reporting worker scaffold remains importable', () => {
  assert.match(startReportingWorkerScaffold(), /reporting-worker scaffold/);
});

test('notification worker scaffold remains importable', () => {
  assert.match(
    startNotificationWorkerScaffold(),
    /notification-worker scaffold/,
  );
});
