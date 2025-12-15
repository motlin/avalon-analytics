-- CreateTable
CREATE TABLE "PersonAnnotationStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "predicateName" TEXT NOT NULL,
    "fires" INTEGER NOT NULL DEFAULT 0,
    "opportunities" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PersonAnnotationStats_personId_fkey" FOREIGN KEY ("personId") REFERENCES "PersonStats" ("personId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PersonAnnotationAlignmentStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "annotationStatsId" TEXT NOT NULL,
    "alignment" TEXT NOT NULL,
    "fires" INTEGER NOT NULL DEFAULT 0,
    "opportunities" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PersonAnnotationAlignmentStats_annotationStatsId_fkey" FOREIGN KEY ("annotationStatsId") REFERENCES "PersonAnnotationStats" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PersonAnnotationRoleStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "annotationStatsId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "fires" INTEGER NOT NULL DEFAULT 0,
    "opportunities" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PersonAnnotationRoleStats_annotationStatsId_fkey" FOREIGN KEY ("annotationStatsId") REFERENCES "PersonAnnotationStats" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GlobalAnnotationBaseline" (
    "predicateName" TEXT NOT NULL PRIMARY KEY,
    "totalFires" INTEGER NOT NULL DEFAULT 0,
    "totalOpportunities" INTEGER NOT NULL DEFAULT 0,
    "mappedPeopleCount" INTEGER NOT NULL DEFAULT 0,
    "goodFires" INTEGER NOT NULL DEFAULT 0,
    "goodOpportunities" INTEGER NOT NULL DEFAULT 0,
    "evilFires" INTEGER NOT NULL DEFAULT 0,
    "evilOpportunities" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GlobalAnnotationRoleBaseline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "predicateName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "fires" INTEGER NOT NULL DEFAULT 0,
    "opportunities" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "GlobalAnnotationRoleBaseline_predicateName_fkey" FOREIGN KEY ("predicateName") REFERENCES "GlobalAnnotationBaseline" ("predicateName") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Credential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" BLOB NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Credential" ("counter", "createdAt", "credentialId", "id", "publicKey", "userId") SELECT "counter", "createdAt", "credentialId", "id", "publicKey", "userId" FROM "Credential";
DROP TABLE "Credential";
ALTER TABLE "new_Credential" RENAME TO "Credential";
CREATE UNIQUE INDEX "Credential_userId_key" ON "Credential"("userId");
CREATE UNIQUE INDEX "Credential_credentialId_key" ON "Credential"("credentialId");
CREATE INDEX "Credential_credentialId_idx" ON "Credential"("credentialId");
CREATE INDEX "Credential_userId_idx" ON "Credential"("userId");
CREATE TABLE "new_GameIngestionState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "lastIngestedGameTime" DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00 +00:00',
    "lastStatsProcessedTime" DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00 +00:00',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_GameIngestionState" ("id", "lastIngestedGameTime", "updatedAt") SELECT "id", "lastIngestedGameTime", "updatedAt" FROM "GameIngestionState";
DROP TABLE "GameIngestionState";
ALTER TABLE "new_GameIngestionState" RENAME TO "GameIngestionState";
CREATE TABLE "new_PersonAssassinStats" (
    "personId" TEXT NOT NULL PRIMARY KEY,
    "gamesPlayed" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "successfulAssassinations" INTEGER NOT NULL,
    "failedAssassinations" INTEGER NOT NULL,
    CONSTRAINT "PersonAssassinStats_personId_fkey" FOREIGN KEY ("personId") REFERENCES "PersonStats" ("personId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PersonAssassinStats" ("failedAssassinations", "gamesPlayed", "personId", "successfulAssassinations", "wins") SELECT "failedAssassinations", "gamesPlayed", "personId", "successfulAssassinations", "wins" FROM "PersonAssassinStats";
DROP TABLE "PersonAssassinStats";
ALTER TABLE "new_PersonAssassinStats" RENAME TO "PersonAssassinStats";
CREATE TABLE "new_PersonDateRange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "PersonDateRange_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PersonDateRange" ("createdAt", "endDate", "id", "personId", "startDate") SELECT "createdAt", "endDate", "id", "personId", "startDate" FROM "PersonDateRange";
DROP TABLE "PersonDateRange";
ALTER TABLE "new_PersonDateRange" RENAME TO "PersonDateRange";
CREATE INDEX "PersonDateRange_personId_idx" ON "PersonDateRange"("personId");
CREATE TABLE "new_PersonEvilTeammateStats" (
    "personId" TEXT NOT NULL PRIMARY KEY,
    "gamesPlayed" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "successfulAssassinations" INTEGER NOT NULL,
    "failedAssassinations" INTEGER NOT NULL,
    CONSTRAINT "PersonEvilTeammateStats_personId_fkey" FOREIGN KEY ("personId") REFERENCES "PersonStats" ("personId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PersonEvilTeammateStats" ("failedAssassinations", "gamesPlayed", "personId", "successfulAssassinations", "wins") SELECT "failedAssassinations", "gamesPlayed", "personId", "successfulAssassinations", "wins" FROM "PersonEvilTeammateStats";
DROP TABLE "PersonEvilTeammateStats";
ALTER TABLE "new_PersonEvilTeammateStats" RENAME TO "PersonEvilTeammateStats";
CREATE TABLE "new_PersonLossReasons" (
    "personId" TEXT NOT NULL PRIMARY KEY,
    "threeMissionFails" INTEGER NOT NULL,
    "threeMissionSuccessEvil" INTEGER NOT NULL,
    "fiveRejectedProposals" INTEGER NOT NULL,
    "merlinAssassinated" INTEGER NOT NULL,
    CONSTRAINT "PersonLossReasons_personId_fkey" FOREIGN KEY ("personId") REFERENCES "PersonStats" ("personId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PersonLossReasons" ("fiveRejectedProposals", "merlinAssassinated", "personId", "threeMissionFails", "threeMissionSuccessEvil") SELECT "fiveRejectedProposals", "merlinAssassinated", "personId", "threeMissionFails", "threeMissionSuccessEvil" FROM "PersonLossReasons";
DROP TABLE "PersonLossReasons";
ALTER TABLE "new_PersonLossReasons" RENAME TO "PersonLossReasons";
CREATE TABLE "new_PersonMerlinStats" (
    "personId" TEXT NOT NULL PRIMARY KEY,
    "gamesPlayed" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "timesAssassinated" INTEGER NOT NULL,
    "survivedAssassination" INTEGER NOT NULL,
    CONSTRAINT "PersonMerlinStats_personId_fkey" FOREIGN KEY ("personId") REFERENCES "PersonStats" ("personId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PersonMerlinStats" ("gamesPlayed", "personId", "survivedAssassination", "timesAssassinated", "wins") SELECT "gamesPlayed", "personId", "survivedAssassination", "timesAssassinated", "wins" FROM "PersonMerlinStats";
DROP TABLE "PersonMerlinStats";
ALTER TABLE "new_PersonMerlinStats" RENAME TO "PersonMerlinStats";
CREATE TABLE "new_PersonRoleStats" (
    "personId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "threeMissionFails" INTEGER NOT NULL,
    "threeMissionSuccesses" INTEGER NOT NULL,
    "fiveRejectedProposals" INTEGER NOT NULL,
    "merlinAssassinated" INTEGER NOT NULL,
    "wasAssassinated" INTEGER NOT NULL,

    PRIMARY KEY ("personId", "role"),
    CONSTRAINT "PersonRoleStats_personId_fkey" FOREIGN KEY ("personId") REFERENCES "PersonStats" ("personId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PersonRoleStats" ("fiveRejectedProposals", "games", "losses", "merlinAssassinated", "personId", "role", "threeMissionFails", "threeMissionSuccesses", "wasAssassinated", "wins") SELECT "fiveRejectedProposals", "games", "losses", "merlinAssassinated", "personId", "role", "threeMissionFails", "threeMissionSuccesses", "wasAssassinated", "wins" FROM "PersonRoleStats";
DROP TABLE "PersonRoleStats";
ALTER TABLE "new_PersonRoleStats" RENAME TO "PersonRoleStats";
CREATE TABLE "new_PersonStats" (
    "personId" TEXT NOT NULL PRIMARY KEY,
    "gamesPlayed" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "goodGames" INTEGER NOT NULL,
    "goodWins" INTEGER NOT NULL,
    "evilGames" INTEGER NOT NULL,
    "evilWins" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PersonStats_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PersonStats" ("createdAt", "evilGames", "evilWins", "gamesPlayed", "goodGames", "goodWins", "personId", "updatedAt", "wins") SELECT "createdAt", "evilGames", "evilWins", "gamesPlayed", "goodGames", "goodWins", "personId", "updatedAt", "wins" FROM "PersonStats";
DROP TABLE "PersonStats";
ALTER TABLE "new_PersonStats" RENAME TO "PersonStats";
CREATE TABLE "new_PersonUid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uid" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "PersonUid_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PersonUid" ("createdAt", "id", "personId", "uid") SELECT "createdAt", "id", "personId", "uid" FROM "PersonUid";
DROP TABLE "PersonUid";
ALTER TABLE "new_PersonUid" RENAME TO "PersonUid";
CREATE UNIQUE INDEX "PersonUid_uid_key" ON "PersonUid"("uid");
CREATE INDEX "PersonUid_uid_idx" ON "PersonUid"("uid");
CREATE INDEX "PersonUid_personId_idx" ON "PersonUid"("personId");
CREATE TABLE "new_PersonYearlyStats" (
    "personId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "goodGames" INTEGER NOT NULL,
    "goodWins" INTEGER NOT NULL,
    "evilGames" INTEGER NOT NULL,
    "evilWins" INTEGER NOT NULL,

    PRIMARY KEY ("personId", "year"),
    CONSTRAINT "PersonYearlyStats_personId_fkey" FOREIGN KEY ("personId") REFERENCES "PersonStats" ("personId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PersonYearlyStats" ("evilGames", "evilWins", "games", "goodGames", "goodWins", "personId", "wins", "year") SELECT "evilGames", "evilWins", "games", "goodGames", "goodWins", "personId", "wins", "year" FROM "PersonYearlyStats";
DROP TABLE "PersonYearlyStats";
ALTER TABLE "new_PersonYearlyStats" RENAME TO "PersonYearlyStats";
CREATE TABLE "new_PlayerAssassinStats" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "gamesPlayed" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "successfulAssassinations" INTEGER NOT NULL,
    "failedAssassinations" INTEGER NOT NULL,
    CONSTRAINT "PlayerAssassinStats_uid_fkey" FOREIGN KEY ("uid") REFERENCES "PlayerStats" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlayerAssassinStats" ("failedAssassinations", "gamesPlayed", "successfulAssassinations", "uid", "wins") SELECT "failedAssassinations", "gamesPlayed", "successfulAssassinations", "uid", "wins" FROM "PlayerAssassinStats";
DROP TABLE "PlayerAssassinStats";
ALTER TABLE "new_PlayerAssassinStats" RENAME TO "PlayerAssassinStats";
CREATE TABLE "new_PlayerEvilTeammateStats" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "gamesPlayed" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "successfulAssassinations" INTEGER NOT NULL,
    "failedAssassinations" INTEGER NOT NULL,
    CONSTRAINT "PlayerEvilTeammateStats_uid_fkey" FOREIGN KEY ("uid") REFERENCES "PlayerStats" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlayerEvilTeammateStats" ("failedAssassinations", "gamesPlayed", "successfulAssassinations", "uid", "wins") SELECT "failedAssassinations", "gamesPlayed", "successfulAssassinations", "uid", "wins" FROM "PlayerEvilTeammateStats";
DROP TABLE "PlayerEvilTeammateStats";
ALTER TABLE "new_PlayerEvilTeammateStats" RENAME TO "PlayerEvilTeammateStats";
CREATE TABLE "new_PlayerLossReasons" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "threeMissionFails" INTEGER NOT NULL,
    "threeMissionSuccessEvil" INTEGER NOT NULL,
    "fiveRejectedProposals" INTEGER NOT NULL,
    "merlinAssassinated" INTEGER NOT NULL,
    CONSTRAINT "PlayerLossReasons_uid_fkey" FOREIGN KEY ("uid") REFERENCES "PlayerStats" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlayerLossReasons" ("fiveRejectedProposals", "merlinAssassinated", "threeMissionFails", "threeMissionSuccessEvil", "uid") SELECT "fiveRejectedProposals", "merlinAssassinated", "threeMissionFails", "threeMissionSuccessEvil", "uid" FROM "PlayerLossReasons";
DROP TABLE "PlayerLossReasons";
ALTER TABLE "new_PlayerLossReasons" RENAME TO "PlayerLossReasons";
CREATE TABLE "new_PlayerMerlinStats" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "gamesPlayed" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "timesAssassinated" INTEGER NOT NULL,
    "survivedAssassination" INTEGER NOT NULL,
    CONSTRAINT "PlayerMerlinStats_uid_fkey" FOREIGN KEY ("uid") REFERENCES "PlayerStats" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlayerMerlinStats" ("gamesPlayed", "survivedAssassination", "timesAssassinated", "uid", "wins") SELECT "gamesPlayed", "survivedAssassination", "timesAssassinated", "uid", "wins" FROM "PlayerMerlinStats";
DROP TABLE "PlayerMerlinStats";
ALTER TABLE "new_PlayerMerlinStats" RENAME TO "PlayerMerlinStats";
CREATE TABLE "new_PlayerRoleStats" (
    "uid" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "threeMissionFails" INTEGER NOT NULL,
    "threeMissionSuccesses" INTEGER NOT NULL,
    "fiveRejectedProposals" INTEGER NOT NULL,
    "merlinAssassinated" INTEGER NOT NULL,
    "wasAssassinated" INTEGER NOT NULL,

    PRIMARY KEY ("uid", "role"),
    CONSTRAINT "PlayerRoleStats_uid_fkey" FOREIGN KEY ("uid") REFERENCES "PlayerStats" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlayerRoleStats" ("fiveRejectedProposals", "games", "losses", "merlinAssassinated", "role", "threeMissionFails", "threeMissionSuccesses", "uid", "wasAssassinated", "wins") SELECT "fiveRejectedProposals", "games", "losses", "merlinAssassinated", "role", "threeMissionFails", "threeMissionSuccesses", "uid", "wasAssassinated", "wins" FROM "PlayerRoleStats";
DROP TABLE "PlayerRoleStats";
ALTER TABLE "new_PlayerRoleStats" RENAME TO "PlayerRoleStats";
CREATE TABLE "new_PlayerStats" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isMapped" BOOLEAN NOT NULL,
    "gamesPlayed" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "goodGames" INTEGER NOT NULL,
    "goodWins" INTEGER NOT NULL,
    "evilGames" INTEGER NOT NULL,
    "evilWins" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PlayerStats" ("createdAt", "evilGames", "evilWins", "gamesPlayed", "goodGames", "goodWins", "isMapped", "name", "uid", "updatedAt", "wins") SELECT "createdAt", "evilGames", "evilWins", "gamesPlayed", "goodGames", "goodWins", "isMapped", "name", "uid", "updatedAt", "wins" FROM "PlayerStats";
DROP TABLE "PlayerStats";
ALTER TABLE "new_PlayerStats" RENAME TO "PlayerStats";
CREATE INDEX "PlayerStats_gamesPlayed_idx" ON "PlayerStats"("gamesPlayed" DESC);
CREATE TABLE "new_PlayerYearlyStats" (
    "uid" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "goodGames" INTEGER NOT NULL,
    "goodWins" INTEGER NOT NULL,
    "evilGames" INTEGER NOT NULL,
    "evilWins" INTEGER NOT NULL,

    PRIMARY KEY ("uid", "year"),
    CONSTRAINT "PlayerYearlyStats_uid_fkey" FOREIGN KEY ("uid") REFERENCES "PlayerStats" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlayerYearlyStats" ("evilGames", "evilWins", "games", "goodGames", "goodWins", "uid", "wins", "year") SELECT "evilGames", "evilWins", "games", "goodGames", "goodWins", "uid", "wins", "year" FROM "PlayerYearlyStats";
DROP TABLE "PlayerYearlyStats";
ALTER TABLE "new_PlayerYearlyStats" RENAME TO "PlayerYearlyStats";
CREATE TABLE "new_RawGameData" (
    "firebaseKey" TEXT NOT NULL PRIMARY KEY,
    "gameJson" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL
);
INSERT INTO "new_RawGameData" ("createdAt", "firebaseKey", "gameJson") SELECT "createdAt", "firebaseKey", "gameJson" FROM "RawGameData";
DROP TABLE "RawGameData";
ALTER TABLE "new_RawGameData" RENAME TO "RawGameData";
CREATE INDEX "RawGameData_createdAt_idx" ON "RawGameData"("createdAt");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "id", "username") SELECT "createdAt", "id", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PersonAnnotationStats_predicateName_idx" ON "PersonAnnotationStats"("predicateName");

-- CreateIndex
CREATE UNIQUE INDEX "PersonAnnotationStats_personId_predicateName_key" ON "PersonAnnotationStats"("personId", "predicateName");

-- CreateIndex
CREATE UNIQUE INDEX "PersonAnnotationAlignmentStats_annotationStatsId_alignment_key" ON "PersonAnnotationAlignmentStats"("annotationStatsId", "alignment");

-- CreateIndex
CREATE UNIQUE INDEX "PersonAnnotationRoleStats_annotationStatsId_role_key" ON "PersonAnnotationRoleStats"("annotationStatsId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalAnnotationRoleBaseline_predicateName_role_key" ON "GlobalAnnotationRoleBaseline"("predicateName", "role");
