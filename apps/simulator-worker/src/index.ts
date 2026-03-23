export function startSimulatorWorkerScaffold(): string {
  const message =
    "CTB simulator-worker scaffold is ready for market-data and simulation workflows.";
  console.log(message);

  return message;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startSimulatorWorkerScaffold();
}
