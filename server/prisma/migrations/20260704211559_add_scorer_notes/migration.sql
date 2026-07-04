-- CreateTable
CREATE TABLE "ScorerNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "scorerId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScorerNote_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScorerNote_scorerId_fkey" FOREIGN KEY ("scorerId") REFERENCES "Scorer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ScorerNote_propertyId_scorerId_key" ON "ScorerNote"("propertyId", "scorerId");
