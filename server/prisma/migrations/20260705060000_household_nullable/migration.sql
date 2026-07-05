-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Household_inviteCode_key" ON "Household"("inviteCode");

-- AlterTable
ALTER TABLE "Property" ADD COLUMN "householdId" TEXT;

-- AlterTable
ALTER TABLE "Scorer" ADD COLUMN "householdId" TEXT,
ADD COLUMN "supabaseUserId" TEXT;

-- AlterTable
ALTER TABLE "PreferenceProfile" ADD COLUMN "householdId" TEXT;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "householdId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Scorer_supabaseUserId_key" ON "Scorer"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PreferenceProfile_householdId_key" ON "PreferenceProfile"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_householdId_key" ON "Listing"("householdId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scorer" ADD CONSTRAINT "Scorer_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreferenceProfile" ADD CONSTRAINT "PreferenceProfile_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE SET NULL ON UPDATE CASCADE;
