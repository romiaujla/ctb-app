CREATE TABLE "RuntimeHeartbeat" (
  "id" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RuntimeHeartbeat_pkey" PRIMARY KEY ("id")
);
