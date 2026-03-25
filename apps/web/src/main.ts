import { defaultServicePortMap } from '@ctb/config';
import type {
  CanonicalMarketDataEvent,
  MarketDataIngestDecision,
} from '@ctb/market-data';

export interface MarketDataOperatorViewModel {
  overallStatus: 'healthy' | 'degraded' | 'unavailable';
  latestRunStatus: string;
  latestRunId: string | null;
  latestEventSummary: string;
  duplicateCount: number;
  rejectedCount: number;
  decisionSummaries: string[];
}

export function buildMarketDataOperatorViewModel(input: {
  overallStatus: MarketDataOperatorViewModel['overallStatus'];
  latestRun: { ingestRunId: string; status: string } | null;
  latestEvent: CanonicalMarketDataEvent | null;
  recentDecisions: MarketDataIngestDecision[];
}) {
  return {
    overallStatus: input.overallStatus,
    latestRunStatus: input.latestRun?.status ?? 'unavailable',
    latestRunId: input.latestRun?.ingestRunId ?? null,
    latestEventSummary: input.latestEvent
      ? `${input.latestEvent.eventType} ${input.latestEvent.symbol} ${input.latestEvent.freshnessState}`
      : 'No canonical market-data events available yet.',
    duplicateCount: input.recentDecisions.filter(
      (decision) => decision.decisionType === 'duplicate',
    ).length,
    rejectedCount: input.recentDecisions.filter(
      (decision) => decision.decisionType === 'rejected',
    ).length,
    decisionSummaries: input.recentDecisions.slice(0, 3).map((decision) => {
      const detail =
        decision.duplicateKey ??
        decision.rejectionReason ??
        decision.marketDataEventId;
      return `${decision.decisionType} ${detail ?? 'no-detail'}`;
    }),
  } satisfies MarketDataOperatorViewModel;
}

export function renderMarketDataOperatorView(
  model: MarketDataOperatorViewModel,
): string {
  return [
    'CTB Market Data Overview',
    `Status: ${model.overallStatus}`,
    `Latest run: ${model.latestRunId ?? 'none'} (${model.latestRunStatus})`,
    `Latest event: ${model.latestEventSummary}`,
    `Duplicates: ${model.duplicateCount}`,
    `Rejected: ${model.rejectedCount}`,
    'Recent decisions:',
    ...model.decisionSummaries.map((summary) => `- ${summary}`),
  ].join('\n');
}

export function bootstrapWebScaffold(
  model?: MarketDataOperatorViewModel,
): string {
  return [
    'CTB web workspace is ready for operator UI implementation.',
    `API placeholder: http://localhost:${defaultServicePortMap.api}`,
    `Web placeholder: http://localhost:${defaultServicePortMap.web}`,
    ...(model ? ['', renderMarketDataOperatorView(model)] : []),
  ].join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(bootstrapWebScaffold());
}
