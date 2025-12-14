-- Migration: Add lastStatsProcessedTime column to GameIngestionState
-- Created: 2025-12-14

-- Add column to track when statistics were last computed
ALTER TABLE "GameIngestionState" ADD COLUMN "lastStatsProcessedTime" DATETIME DEFAULT '1970-01-01T00:00:00Z';

-- Update existing row to set the default value
UPDATE "GameIngestionState" SET "lastStatsProcessedTime" = '1970-01-01T00:00:00Z' WHERE "id" = 1;
