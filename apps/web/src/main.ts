export function bootstrapWebScaffold(): string {
  const message = "CTB web scaffold is ready for the operator UI implementation.";
  console.log(message);

  return message;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  bootstrapWebScaffold();
}
