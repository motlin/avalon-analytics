-- Migration: Insert initial game ingestion state
-- Created: 2025-07-13

-- Insert initial row with Unix epoch date
INSERT INTO "GameIngestionState" ("id", "lastIngestedGameTime", "updatedAt")
VALUES (1, '1970-01-01T00:00:00Z', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
