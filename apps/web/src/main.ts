import { defaultServicePortMap } from '@ctb/config';
import type {
  CanonicalMarketDataEvent,
  MarketDataIngestDecision,
} from '@ctb/market-data';
import type { StrategyEvaluationRecord } from '@ctb/types';

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

export interface StrategyOperatorViewModel {
  overallStatus: 'review-ready' | 'warning' | 'no-evidence-yet';
  activeStrategyVersion: string | null;
  latestDecisionState: string;
  latestDecisionReason: string;
  emittedCount: number;
  skippedCount: number;
  blockedCount: number;
  invalidCount: number;
  recentReasonSummaries: string[];
}

export interface OperatorDashboardModel {
  marketData?: MarketDataOperatorViewModel;
  strategy?: StrategyOperatorViewModel;
}

function formatDecisionState(decisionState: string): string {
  return decisionState.replaceAll('-', ' ');
}

export function buildStrategyOperatorViewModel(input: {
  evaluations: StrategyEvaluationRecord[];
}) {
  const latestEvaluation = input.evaluations[0] ?? null;
  const blockedCount = input.evaluations.filter(
    (evaluation) => evaluation.evidence.decisionState === 'blocked',
  ).length;
  const skippedCount = input.evaluations.filter(
    (evaluation) => evaluation.evidence.decisionState === 'skipped',
  ).length;
  const invalidCount = input.evaluations.filter(
    (evaluation) => evaluation.evidence.decisionState === 'invalid-input',
  ).length;
  const emittedCount = input.evaluations.filter(
    (evaluation) =>
      evaluation.evidence.decisionState === 'trade-intent-emitted',
  ).length;

  return {
    overallStatus: latestEvaluation
      ? blockedCount > 0 || invalidCount > 0
        ? 'warning'
        : 'review-ready'
      : 'no-evidence-yet',
    activeStrategyVersion: latestEvaluation?.input.strategyVersion ?? null,
    latestDecisionState: latestEvaluation
      ? formatDecisionState(latestEvaluation.evidence.decisionState)
      : 'no evidence yet',
    latestDecisionReason:
      latestEvaluation?.evidence.decisionReason ??
      'No strategy evidence has been emitted yet.',
    emittedCount,
    skippedCount,
    blockedCount,
    invalidCount,
    recentReasonSummaries: input.evaluations
      .slice(0, 3)
      .map(
        (evaluation) =>
          `${formatDecisionState(evaluation.evidence.decisionState)}: ${evaluation.evidence.decisionReason}`,
      ),
  } satisfies StrategyOperatorViewModel;
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

export function renderStrategyOperatorView(
  model: StrategyOperatorViewModel,
): string {
  return [
    'CTB Strategy Overview',
    `Status: ${model.overallStatus}`,
    `Active strategy version: ${model.activeStrategyVersion ?? 'none'}`,
    `Latest decision: ${model.latestDecisionState}`,
    `Latest reason: ${model.latestDecisionReason}`,
    `Emitted: ${model.emittedCount}`,
    `Skipped: ${model.skippedCount}`,
    `Blocked: ${model.blockedCount}`,
    `Invalid: ${model.invalidCount}`,
    'Recent strategy reasons:',
    ...model.recentReasonSummaries.map((summary) => `- ${summary}`),
  ].join('\n');
}

export async function loadStrategyOperatorViewModel(
  apiBaseUrl = `http://localhost:${defaultServicePortMap.api}`,
) {
  const response = await fetch(
    `${apiBaseUrl}/api/v1/strategy/evaluations?limit=10`,
  );
  const payload = (await response.json()) as {
    evaluations: StrategyEvaluationRecord[];
  };

  return buildStrategyOperatorViewModel({
    evaluations: payload.evaluations ?? [],
  });
}

export async function loadOperatorDashboard(
  apiBaseUrl = `http://localhost:${defaultServicePortMap.api}`,
): Promise<OperatorDashboardModel> {
  return {
    strategy: await loadStrategyOperatorViewModel(apiBaseUrl),
  };
}

export function bootstrapWebScaffold(
  model?: MarketDataOperatorViewModel | OperatorDashboardModel,
): string {
  const dashboard =
    model && 'overallStatus' in model ? { marketData: model } : model;

  return [
    'CTB web workspace is ready for operator UI implementation.',
    `API placeholder: http://localhost:${defaultServicePortMap.api}`,
    `Web placeholder: http://localhost:${defaultServicePortMap.web}`,
    ...(dashboard?.marketData
      ? ['', renderMarketDataOperatorView(dashboard.marketData)]
      : []),
    ...(dashboard?.strategy
      ? ['', renderStrategyOperatorView(dashboard.strategy)]
      : []),
  ].join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(bootstrapWebScaffold());
}
