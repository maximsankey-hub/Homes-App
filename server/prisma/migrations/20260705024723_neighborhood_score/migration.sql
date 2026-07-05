-- CreateTable
CREATE TABLE "NeighborhoodScore" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "scorerId" TEXT NOT NULL,
    "curbAppeal" INTEGER NOT NULL,
    "streetVibe" INTEGER NOT NULL,
    "feeling" "RoomFeeling" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NeighborhoodScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NeighborhoodScore_propertyId_scorerId_key" ON "NeighborhoodScore"("propertyId", "scorerId");

-- AddForeignKey
ALTER TABLE "NeighborhoodScore" ADD CONSTRAINT "NeighborhoodScore_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeighborhoodScore" ADD CONSTRAINT "NeighborhoodScore_scorerId_fkey" FOREIGN KEY ("scorerId") REFERENCES "Scorer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
