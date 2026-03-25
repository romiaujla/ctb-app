import {
  DefaultMarketDataIngestionService,
  type MarketDataIngestionRequest,
  type MarketDataIngestionService,
  type MarketDataRepository,
} from '@ctb/market-data';
import type { MarketDataFreshnessThresholds } from '@ctb/types';

export function createSimulatorWorkerMarketDataIngestionService(
  repository: MarketDataRepository,
): MarketDataIngestionService {
  return new DefaultMarketDataIngestionService(repository);
}

export async function ingestSimulatorWorkerMarketData(
  repository: MarketDataRepository,
  input: MarketDataIngestionRequest,
  options?: {
    thresholds?: MarketDataFreshnessThresholds;
    completedAt?: string;
  },
) {
  const service = createSimulatorWorkerMarketDataIngestionService(repository);
  return service.ingest(input, options);
}
