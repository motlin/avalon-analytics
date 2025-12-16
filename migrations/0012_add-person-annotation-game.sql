-- Migration number: 0012 	 2025-12-16T14:11:54.487Z

-- CreateTable
CREATE TABLE "PersonAnnotationGame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "annotationStatsId" TEXT NOT NULL,
    "firebaseKey" TEXT NOT NULL,
    "fired" BOOLEAN NOT NULL,
    "role" TEXT NOT NULL,
    "missionNumber" INTEGER,
    "proposalNumber" INTEGER,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "PersonAnnotationGame_annotationStatsId_fkey" FOREIGN KEY ("annotationStatsId") REFERENCES "PersonAnnotationStats" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PersonAnnotationGame_firebaseKey_fkey" FOREIGN KEY ("firebaseKey") REFERENCES "RawGameData" ("firebaseKey") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonAnnotationGame_annotationStatsId_firebaseKey_key" ON "PersonAnnotationGame"("annotationStatsId", "firebaseKey");

-- CreateIndex
CREATE INDEX "PersonAnnotationGame_firebaseKey_idx" ON "PersonAnnotationGame"("firebaseKey");

-- CreateIndex
CREATE INDEX "PersonAnnotationGame_fired_idx" ON "PersonAnnotationGame"("fired");
