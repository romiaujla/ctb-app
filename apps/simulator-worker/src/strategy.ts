import type { MarketDataRepository } from '@ctb/market-data';
import { runStrategyEvaluation } from '@ctb/simulator-core';
import type {
  SimulatorAccountingRepository,
  StrategyEvaluationRecord,
  StrategyEvaluationRepository,
  StrategyEvaluationRequest,
} from '@ctb/types';

export function createSimulatorWorkerStrategyEvaluator(dependencies: {
  marketDataRepository: MarketDataRepository;
  simulatorAccountingRepository: SimulatorAccountingRepository;
  strategyEvaluationRepository: StrategyEvaluationRepository;
}) {
  return async (
    request: StrategyEvaluationRequest,
  ): Promise<StrategyEvaluationRecord> =>
    runStrategyEvaluation(request, dependencies);
}

export async function evaluateSimulatorWorkerStrategy(
  request: StrategyEvaluationRequest,
  dependencies: {
    marketDataRepository: MarketDataRepository;
    simulatorAccountingRepository: SimulatorAccountingRepository;
    strategyEvaluationRepository: StrategyEvaluationRepository;
  },
): Promise<StrategyEvaluationRecord> {
  return createSimulatorWorkerStrategyEvaluator(dependencies)(request);
}
