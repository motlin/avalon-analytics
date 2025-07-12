-- Migration: Add game ingestion tables
-- Created: 2025-07-12

-- Create GameIngestionState table
CREATE TABLE IF NOT EXISTS "GameIngestionState" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "lastIngestedGameTime" DATETIME NOT NULL DEFAULT '1970-01-01T00:00:00Z',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GameIngestionState_pkey" PRIMARY KEY ("id")
);

-- Create RawGameData table
CREATE TABLE IF NOT EXISTS "RawGameData" (
    "firebaseKey" TEXT NOT NULL,
    "gameJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RawGameData_pkey" PRIMARY KEY ("firebaseKey")
);

-- Create index on RawGameData.createdAt
CREATE INDEX IF NOT EXISTS "RawGameData_createdAt_idx" ON "RawGameData"("createdAt");
