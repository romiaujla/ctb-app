-- CreateEnum
CREATE TYPE "StrategyDecisionState" AS ENUM (
  'TRADE_INTENT_EMITTED',
  'SKIPPED',
  'BLOCKED',
  'INVALID_INPUT'
);

-- CreateTable
CREATE TABLE "StrategyEvaluation" (
  "id" TEXT NOT NULL,
  "strategyId" TEXT NOT NULL,
  "strategyVersion" TEXT NOT NULL,
  "evaluationTimestamp" TIMESTAMP(3) NOT NULL,
  "instrumentId" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "sessionState" "MarketDataSessionState" NOT NULL,
  "marketContext" JSONB NOT NULL,
  "portfolioContext" JSONB NOT NULL,
  "riskContext" JSONB NOT NULL,
  "dataTrust" JSONB NOT NULL,
  "inputReference" JSONB NOT NULL,
  "decisionState" "StrategyDecisionState" NOT NULL,
  "decisionReason" TEXT NOT NULL,
  "signalSummary" JSONB NOT NULL,
  "guardrailSummary" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "StrategyEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyTradeIntent" (
  "id" TEXT NOT NULL,
  "strategyEvaluationId" TEXT NOT NULL,
  "strategyId" TEXT NOT NULL,
  "strategyVersion" TEXT NOT NULL,
  "evaluationCorrelationId" TEXT NOT NULL,
  "instrumentId" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "side" "SimulatedOrderSide" NOT NULL,
  "requestedQuantity" DECIMAL(20,8) NOT NULL,
  "orderType" "SimulatedOrderType" NOT NULL,
  "intentTimestamp" TIMESTAMP(3) NOT NULL,
  "intentMetadata" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StrategyTradeIntent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StrategyEvaluation_strategyId_strategyVersion_evaluationTime_idx"
ON "StrategyEvaluation"("strategyId", "strategyVersion", "evaluationTimestamp");

-- CreateIndex
CREATE INDEX "StrategyEvaluation_instrumentId_evaluationTimestamp_idx"
ON "StrategyEvaluation"("instrumentId", "evaluationTimestamp");

-- CreateIndex
CREATE INDEX "StrategyEvaluation_decisionState_evaluationTimestamp_idx"
ON "StrategyEvaluation"("decisionState", "evaluationTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "StrategyTradeIntent_strategyEvaluationId_key"
ON "StrategyTradeIntent"("strategyEvaluationId");

-- CreateIndex
CREATE INDEX "StrategyTradeIntent_strategyId_strategyVersion_intentTimes_idx"
ON "StrategyTradeIntent"("strategyId", "strategyVersion", "intentTimestamp");

-- CreateIndex
CREATE INDEX "StrategyTradeIntent_instrumentId_intentTimestamp_idx"
ON "StrategyTradeIntent"("instrumentId", "intentTimestamp");

-- AddForeignKey
ALTER TABLE "StrategyTradeIntent"
ADD CONSTRAINT "StrategyTradeIntent_strategyEvaluationId_fkey"
FOREIGN KEY ("strategyEvaluationId") REFERENCES "StrategyEvaluation"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
