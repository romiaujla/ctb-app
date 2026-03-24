CREATE TYPE "SimulationAccountStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED');
CREATE TYPE "SimulatedOrderSide" AS ENUM ('BUY', 'SELL');
CREATE TYPE "SimulatedOrderType" AS ENUM ('MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT');
CREATE TYPE "SimulatedOrderStatus" AS ENUM ('ACCEPTED', 'PARTIALLY_FILLED', 'FILLED', 'CANCELED', 'REJECTED');
CREATE TYPE "SimulatorEventType" AS ENUM (
  'TRADE_INTENT_ACCEPTED',
  'TRADE_INTENT_REJECTED',
  'ORDER_SUBMITTED',
  'ORDER_PARTIALLY_FILLED',
  'ORDER_FILLED',
  'ORDER_CANCELED',
  'POSITION_REVALUED',
  'PORTFOLIO_SNAPSHOTTED',
  'ACCOUNT_ADJUSTED'
);

CREATE TABLE "SimulationAccount" (
  "id" TEXT NOT NULL,
  "baseCurrency" TEXT NOT NULL,
  "startingBalance" DECIMAL(20,8) NOT NULL,
  "currentCashBalance" DECIMAL(20,8) NOT NULL,
  "status" "SimulationAccountStatus" NOT NULL,
  "createdTimestamp" TIMESTAMP(3) NOT NULL,
  "configurationVersion" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SimulationAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SimulatedOrder" (
  "id" TEXT NOT NULL,
  "simulationAccountId" TEXT NOT NULL,
  "tradeIntentId" TEXT NOT NULL,
  "instrumentId" TEXT NOT NULL,
  "side" "SimulatedOrderSide" NOT NULL,
  "orderType" "SimulatedOrderType" NOT NULL,
  "requestedQuantity" DECIMAL(20,8) NOT NULL,
  "acceptedQuantity" DECIMAL(20,8) NOT NULL,
  "status" "SimulatedOrderStatus" NOT NULL,
  "submittedTimestamp" TIMESTAMP(3) NOT NULL,
  "executionModelVersion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SimulatedOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SimulatedFill" (
  "id" TEXT NOT NULL,
  "simulatedOrderId" TEXT NOT NULL,
  "simulationAccountId" TEXT NOT NULL,
  "instrumentId" TEXT NOT NULL,
  "fillQuantity" DECIMAL(20,8) NOT NULL,
  "fillPrice" DECIMAL(20,8) NOT NULL,
  "simulatedFeeAmount" DECIMAL(20,8) NOT NULL,
  "slippageAmount" DECIMAL(20,8) NOT NULL,
  "fillTimestamp" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SimulatedFill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SimulatorEvent" (
  "id" TEXT NOT NULL,
  "simulationAccountId" TEXT NOT NULL,
  "eventType" "SimulatorEventType" NOT NULL,
  "eventTimestamp" TIMESTAMP(3) NOT NULL,
  "recordedTimestamp" TIMESTAMP(3) NOT NULL,
  "sequenceKey" TEXT NOT NULL,
  "correlationId" TEXT,
  "causationId" TEXT,
  "schemaVersion" INTEGER NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SimulatorEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Position" (
  "id" TEXT NOT NULL,
  "simulationAccountId" TEXT NOT NULL,
  "instrumentId" TEXT NOT NULL,
  "quantity" DECIMAL(20,8) NOT NULL,
  "averageEntryCost" DECIMAL(20,8) NOT NULL,
  "marketValue" DECIMAL(20,8) NOT NULL,
  "realizedPnl" DECIMAL(20,8) NOT NULL,
  "unrealizedPnl" DECIMAL(20,8) NOT NULL,
  "lastUpdatedTimestamp" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Portfolio" (
  "id" TEXT NOT NULL,
  "simulationAccountId" TEXT NOT NULL,
  "netLiquidationValue" DECIMAL(20,8) NOT NULL,
  "grossExposure" DECIMAL(20,8) NOT NULL,
  "realizedPnl" DECIMAL(20,8) NOT NULL,
  "unrealizedPnl" DECIMAL(20,8) NOT NULL,
  "valuationTimestamp" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PortfolioSnapshot" (
  "id" TEXT NOT NULL,
  "simulationAccountId" TEXT NOT NULL,
  "cashBalance" DECIMAL(20,8) NOT NULL,
  "grossExposure" DECIMAL(20,8) NOT NULL,
  "netLiquidationValue" DECIMAL(20,8) NOT NULL,
  "realizedPnl" DECIMAL(20,8) NOT NULL,
  "unrealizedPnl" DECIMAL(20,8) NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL,
  "sourceEventId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PortfolioSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SimulatedOrder_simulationAccountId_idx" ON "SimulatedOrder"("simulationAccountId");
CREATE INDEX "SimulatedOrder_tradeIntentId_idx" ON "SimulatedOrder"("tradeIntentId");
CREATE INDEX "SimulatedFill_simulatedOrderId_idx" ON "SimulatedFill"("simulatedOrderId");
CREATE INDEX "SimulatedFill_simulationAccountId_instrumentId_idx" ON "SimulatedFill"("simulationAccountId", "instrumentId");
CREATE UNIQUE INDEX "SimulatorEvent_simulationAccountId_sequenceKey_key" ON "SimulatorEvent"("simulationAccountId", "sequenceKey");
CREATE INDEX "SimulatorEvent_simulationAccountId_eventType_eventTimestamp_idx" ON "SimulatorEvent"("simulationAccountId", "eventType", "eventTimestamp");
CREATE UNIQUE INDEX "Position_simulationAccountId_instrumentId_key" ON "Position"("simulationAccountId", "instrumentId");
CREATE UNIQUE INDEX "Portfolio_simulationAccountId_key" ON "Portfolio"("simulationAccountId");
CREATE UNIQUE INDEX "PortfolioSnapshot_simulationAccountId_sourceEventId_key" ON "PortfolioSnapshot"("simulationAccountId", "sourceEventId");
CREATE INDEX "PortfolioSnapshot_simulationAccountId_timestamp_idx" ON "PortfolioSnapshot"("simulationAccountId", "timestamp");

ALTER TABLE "SimulatedOrder"
ADD CONSTRAINT "SimulatedOrder_simulationAccountId_fkey"
FOREIGN KEY ("simulationAccountId") REFERENCES "SimulationAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SimulatedFill"
ADD CONSTRAINT "SimulatedFill_simulatedOrderId_fkey"
FOREIGN KEY ("simulatedOrderId") REFERENCES "SimulatedOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SimulatedFill"
ADD CONSTRAINT "SimulatedFill_simulationAccountId_fkey"
FOREIGN KEY ("simulationAccountId") REFERENCES "SimulationAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SimulatorEvent"
ADD CONSTRAINT "SimulatorEvent_simulationAccountId_fkey"
FOREIGN KEY ("simulationAccountId") REFERENCES "SimulationAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Position"
ADD CONSTRAINT "Position_simulationAccountId_fkey"
FOREIGN KEY ("simulationAccountId") REFERENCES "SimulationAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Portfolio"
ADD CONSTRAINT "Portfolio_simulationAccountId_fkey"
FOREIGN KEY ("simulationAccountId") REFERENCES "SimulationAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PortfolioSnapshot"
ADD CONSTRAINT "PortfolioSnapshot_simulationAccountId_fkey"
FOREIGN KEY ("simulationAccountId") REFERENCES "SimulationAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
