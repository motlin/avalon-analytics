-- CreateTable
CREATE TABLE "PlayerGame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerUid" TEXT NOT NULL,
    "firebaseKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "PlayerGame_firebaseKey_fkey" FOREIGN KEY ("firebaseKey") REFERENCES "RawGameData" ("firebaseKey") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PlayerGame_playerUid_idx" ON "PlayerGame"("playerUid");

-- CreateIndex
CREATE INDEX "PlayerGame_firebaseKey_idx" ON "PlayerGame"("firebaseKey");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerGame_playerUid_firebaseKey_key" ON "PlayerGame"("playerUid", "firebaseKey");
