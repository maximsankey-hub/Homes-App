-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "householdId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Scorer" ALTER COLUMN "householdId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PreferenceProfile" ALTER COLUMN "householdId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "householdId" SET NOT NULL;

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_householdId_fkey";

-- DropForeignKey
ALTER TABLE "Scorer" DROP CONSTRAINT "Scorer_householdId_fkey";

-- DropForeignKey
ALTER TABLE "PreferenceProfile" DROP CONSTRAINT "PreferenceProfile_householdId_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_householdId_fkey";

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scorer" ADD CONSTRAINT "Scorer_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreferenceProfile" ADD CONSTRAINT "PreferenceProfile_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
