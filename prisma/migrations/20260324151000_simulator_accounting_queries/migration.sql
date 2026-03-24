CREATE INDEX "SimulatedOrder_simulationAccountId_status_idx" ON "SimulatedOrder"("simulationAccountId", "status");
CREATE INDEX "SimulatedFill_simulationAccountId_fillTimestamp_idx" ON "SimulatedFill"("simulationAccountId", "fillTimestamp");

ALTER TABLE "PortfolioSnapshot"
ADD CONSTRAINT "PortfolioSnapshot_sourceEventId_fkey"
FOREIGN KEY ("sourceEventId") REFERENCES "SimulatorEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
