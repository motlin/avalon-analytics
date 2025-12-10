-- Migration: Add PersonDateRange table
-- One Person can have many DateRanges (periods when they were active)

CREATE TABLE "PersonDateRange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "createdAt" DATETIME NOT NULL,
    FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE
);

CREATE INDEX "PersonDateRange_personId_idx" ON "PersonDateRange"("personId");
