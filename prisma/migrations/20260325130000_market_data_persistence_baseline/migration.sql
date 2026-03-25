CREATE TYPE "MarketDataIngestMode" AS ENUM ('POLL', 'SUBSCRIPTION', 'MANUAL');
CREATE TYPE "MarketDataIngestStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED');
CREATE TYPE "MarketDataEventType" AS ENUM ('QUOTE', 'TRADE', 'BAR', 'STATUS');
CREATE TYPE "MarketDataSessionState" AS ENUM ('PRE_MARKET', 'REGULAR', 'AFTER_HOURS', 'CLOSED');
CREATE TYPE "MarketDataQuality" AS ENUM ('VALID', 'PARTIAL', 'STALE', 'INVALID');
CREATE TYPE "MarketDataFreshnessState" AS ENUM ('READY', 'DELAYED', 'STALE', 'PARTIAL', 'INVALID', 'UNAVAILABLE');
CREATE TYPE "MarketDataIngestDecisionType" AS ENUM ('ACCEPTED', 'DUPLICATE', 'REJECTED');

CREATE TABLE "MarketDataIngestRun" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "ingestMode" "MarketDataIngestMode" NOT NULL,
  "status" "MarketDataIngestStatus" NOT NULL,
  "adapterVersion" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "requestedInstruments" JSONB NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MarketDataIngestRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RawMarketDataRecord" (
  "id" TEXT NOT NULL,
  "ingestRunId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerSymbol" TEXT,
  "providerEventId" TEXT,
  "receivedTimestamp" TIMESTAMP(3) NOT NULL,
  "providerTimestamp" TIMESTAMP(3),
  "adapterVersion" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RawMarketDataRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketDataEvent" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "ingestRunId" TEXT NOT NULL,
  "rawRecordId" TEXT,
  "eventType" "MarketDataEventType" NOT NULL,
  "instrumentId" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerEventId" TEXT,
  "providerTimestamp" TIMESTAMP(3) NOT NULL,
  "observedTimestamp" TIMESTAMP(3) NOT NULL,
  "normalizedTimestamp" TIMESTAMP(3) NOT NULL,
  "sessionState" "MarketDataSessionState" NOT NULL,
  "quality" "MarketDataQuality" NOT NULL,
  "freshnessState" "MarketDataFreshnessState" NOT NULL,
  "sourceLatencyMs" INTEGER,
  "rawReference" TEXT,
  "normalizationVersion" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "persistedTimestamp" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MarketDataEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketDataIngestDecision" (
  "id" TEXT NOT NULL,
  "ingestRunId" TEXT NOT NULL,
  "rawRecordId" TEXT,
  "marketDataEventId" TEXT,
  "decisionType" "MarketDataIngestDecisionType" NOT NULL,
  "duplicateKey" TEXT,
  "rejectionReason" TEXT,
  "freshnessState" "MarketDataFreshnessState",
  "quality" "MarketDataQuality",
  "decidedTimestamp" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MarketDataIngestDecision_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketDataEvent_eventId_key" ON "MarketDataEvent"("eventId");
CREATE INDEX "MarketDataIngestRun_provider_startedAt_idx" ON "MarketDataIngestRun"("provider", "startedAt");
CREATE INDEX "MarketDataIngestRun_status_startedAt_idx" ON "MarketDataIngestRun"("status", "startedAt");
CREATE INDEX "RawMarketDataRecord_ingestRunId_receivedTimestamp_idx" ON "RawMarketDataRecord"("ingestRunId", "receivedTimestamp");
CREATE INDEX "RawMarketDataRecord_provider_providerEventId_idx" ON "RawMarketDataRecord"("provider", "providerEventId");
CREATE INDEX "MarketDataEvent_instrumentId_normalizedTimestamp_idx" ON "MarketDataEvent"("instrumentId", "normalizedTimestamp");
CREATE INDEX "MarketDataEvent_eventType_normalizedTimestamp_idx" ON "MarketDataEvent"("eventType", "normalizedTimestamp");
CREATE INDEX "MarketDataEvent_ingestRunId_normalizedTimestamp_idx" ON "MarketDataEvent"("ingestRunId", "normalizedTimestamp");
CREATE INDEX "MarketDataEvent_provider_providerEventId_idx" ON "MarketDataEvent"("provider", "providerEventId");
CREATE INDEX "MarketDataIngestDecision_ingestRunId_decidedTimestamp_idx" ON "MarketDataIngestDecision"("ingestRunId", "decidedTimestamp");
CREATE INDEX "MarketDataIngestDecision_decisionType_decidedTimestamp_idx" ON "MarketDataIngestDecision"("decisionType", "decidedTimestamp");
CREATE INDEX "MarketDataIngestDecision_duplicateKey_idx" ON "MarketDataIngestDecision"("duplicateKey");

ALTER TABLE "RawMarketDataRecord"
ADD CONSTRAINT "RawMarketDataRecord_ingestRunId_fkey"
FOREIGN KEY ("ingestRunId") REFERENCES "MarketDataIngestRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MarketDataEvent"
ADD CONSTRAINT "MarketDataEvent_ingestRunId_fkey"
FOREIGN KEY ("ingestRunId") REFERENCES "MarketDataIngestRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MarketDataEvent"
ADD CONSTRAINT "MarketDataEvent_rawRecordId_fkey"
FOREIGN KEY ("rawRecordId") REFERENCES "RawMarketDataRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MarketDataIngestDecision"
ADD CONSTRAINT "MarketDataIngestDecision_ingestRunId_fkey"
FOREIGN KEY ("ingestRunId") REFERENCES "MarketDataIngestRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MarketDataIngestDecision"
ADD CONSTRAINT "MarketDataIngestDecision_rawRecordId_fkey"
FOREIGN KEY ("rawRecordId") REFERENCES "RawMarketDataRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MarketDataIngestDecision"
ADD CONSTRAINT "MarketDataIngestDecision_marketDataEventId_fkey"
FOREIGN KEY ("marketDataEventId") REFERENCES "MarketDataEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
