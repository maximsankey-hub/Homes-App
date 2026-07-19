-- AlterTable
ALTER TABLE "CustomMetric" ADD COLUMN     "targetRoomName" TEXT;

-- AlterTable
ALTER TABLE "PreferenceProfile" ADD COLUMN     "householdComposition" TEXT,
ADD COLUMN     "householdCompositionOther" TEXT,
ADD COLUMN     "petTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "RenovationIdea" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;
