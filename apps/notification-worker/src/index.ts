export function startNotificationWorkerScaffold(): string {
  const message =
    'CTB notification-worker scaffold is ready for alerting and delivery workflows.';
  console.log(message);

  return message;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startNotificationWorkerScaffold();
}
