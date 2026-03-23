import { defaultServicePortMap } from '@ctb/config';

export function bootstrapWebScaffold(): string {
  return [
    'CTB web workspace is ready for operator UI implementation.',
    `API placeholder: http://localhost:${defaultServicePortMap.api}`,
    `Web placeholder: http://localhost:${defaultServicePortMap.web}`,
  ].join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(bootstrapWebScaffold());
}
