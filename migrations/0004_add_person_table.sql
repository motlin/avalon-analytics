-- Migration: Add Person and PersonUid tables
-- Person has many PersonUid (one person can have multiple anonymous UIDs)

-- CreateTable Person
CREATE TABLE "Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_name_key" ON "Person"("name");

-- CreateIndex
CREATE INDEX "Person_name_idx" ON "Person"("name");

-- CreateTable PersonUid
CREATE TABLE "PersonUid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uid" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonUid_uid_key" ON "PersonUid"("uid");

-- CreateIndex
CREATE INDEX "PersonUid_uid_idx" ON "PersonUid"("uid");

-- CreateIndex
CREATE INDEX "PersonUid_personId_idx" ON "PersonUid"("personId");
