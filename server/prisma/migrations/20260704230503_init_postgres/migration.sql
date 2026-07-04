-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('NOT_VISITED', 'VISITED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'VIDEO', 'VOICE');

-- CreateEnum
CREATE TYPE "RoomFeeling" AS ENUM ('EXCITED', 'CALM', 'UNCERTAIN', 'OVERWHELMED', 'INSPIRED');

-- CreateEnum
CREATE TYPE "IdeaType" AS ENUM ('COSMETIC', 'STRUCTURAL');

-- CreateEnum
CREATE TYPE "DemandLevel" AS ENUM ('HIGH', 'MODERATE', 'LOW');

-- CreateEnum
CREATE TYPE "ScorerRole" AS ENUM ('SELF', 'PARTNER');

-- CreateEnum
CREATE TYPE "ProfileMethod" AS ENUM ('TAGS', 'FREE_TEXT', 'BOTH');

-- CreateEnum
CREATE TYPE "TagSource" AS ENUM ('MANUAL', 'AI_MAPPED');

-- CreateEnum
CREATE TYPE "PlaceCategory" AS ENUM ('GROCERY', 'PARKS', 'SCHOOLS', 'COFFEE', 'GYMS', 'FITNESS', 'RESTAURANTS', 'OTHER');

-- CreateEnum
CREATE TYPE "CompDiffType" AS ENUM ('ABOVE', 'BELOW', 'WITHIN');

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "listingPrice" INTEGER NOT NULL,
    "sqft" INTEGER NOT NULL,
    "beds" INTEGER NOT NULL,
    "baths" INTEGER NOT NULL,
    "yearBuilt" INTEGER,
    "status" "PropertyStatus" NOT NULL DEFAULT 'NOT_VISITED',
    "lastVisitedAt" TIMESTAMP(3),
    "walkScore" INTEGER,
    "transitScore" INTEGER,
    "bikeScore" INTEGER,
    "safetyScore" INTEGER,
    "noiseScore" INTEGER,
    "greenSpaceScore" INTEGER,
    "sidewalkScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScorerNote" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "scorerId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScorerNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scorer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "ScorerRole" NOT NULL,
    "initials" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,
    "contact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scorer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomScore" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "scorerId" TEXT NOT NULL,
    "layout" INTEGER NOT NULL,
    "storage" INTEGER NOT NULL,
    "light" INTEGER NOT NULL,
    "vibe" INTEGER NOT NULL,
    "feeling" "RoomFeeling" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "roomId" TEXT,
    "type" "MediaType" NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenovationIdea" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "type" "IdeaType" NOT NULL,
    "costLow" INTEGER NOT NULL,
    "costHigh" INTEGER NOT NULL,
    "feasibility" INTEGER NOT NULL,
    "need" TEXT,
    "constraintNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RenovationIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NearbyPlace" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "PlaceCategory" NOT NULL,
    "distanceText" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "icon" TEXT NOT NULL,
    "iconColor" TEXT NOT NULL,
    "iconBg" TEXT NOT NULL,

    CONSTRAINT "NearbyPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreferenceProfile" (
    "id" TEXT NOT NULL,
    "method" "ProfileMethod" NOT NULL DEFAULT 'BOTH',
    "freeText" TEXT,
    "weightEmotional" INTEGER NOT NULL DEFAULT 5,
    "weightStorage" INTEGER NOT NULL DEFAULT 5,
    "weightLight" INTEGER NOT NULL DEFAULT 5,
    "aestheticStyle" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreferenceProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreferenceTag" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "source" "TagSource" NOT NULL DEFAULT 'MANUAL',

    CONSTRAINT "PreferenceTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "listPrice" INTEGER NOT NULL,
    "sqft" INTEGER NOT NULL,
    "beds" INTEGER NOT NULL,
    "baths" INTEGER NOT NULL,
    "estValueLow" INTEGER NOT NULL,
    "estValueHigh" INTEGER NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "avgDaysOnMarket" INTEGER NOT NULL,
    "pricePerSqft" INTEGER NOT NULL,
    "buyerEmotionalAvg" DOUBLE PRECISION NOT NULL,
    "buyerFunctionalAvg" DOUBLE PRECISION NOT NULL,
    "marketStatus" TEXT NOT NULL,
    "buyerViewsCount" INTEGER NOT NULL,
    "walkabilityScore" DOUBLE PRECISION NOT NULL,
    "parkAccessScore" DOUBLE PRECISION NOT NULL,
    "privacyScore" DOUBLE PRECISION NOT NULL,
    "schoolQualityScore" DOUBLE PRECISION NOT NULL,
    "noiseLevelScore" DOUBLE PRECISION NOT NULL,
    "buyerPriorityLight" DOUBLE PRECISION NOT NULL,
    "buyerPriorityKitchen" DOUBLE PRECISION NOT NULL,
    "buyerPriorityStorage" DOUBLE PRECISION NOT NULL,
    "buyerPriorityLayout" DOUBLE PRECISION NOT NULL,
    "fitHosting" DOUBLE PRECISION NOT NULL,
    "fitWFH" DOUBLE PRECISION NOT NULL,
    "fitOrganization" DOUBLE PRECISION NOT NULL,
    "fitFamily" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketComp" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "sqft" INTEGER NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL,
    "price" INTEGER NOT NULL,
    "diffType" "CompDiffType" NOT NULL,
    "diffAmount" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "MarketComp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingRoomScore" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ListingRoomScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImprovementIdea" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "demandLevel" "DemandLevel" NOT NULL,
    "type" "IdeaType" NOT NULL,
    "valueLift" INTEGER NOT NULL,
    "costLow" INTEGER NOT NULL,
    "costHigh" INTEGER NOT NULL,
    "feasibility" INTEGER NOT NULL,
    "supportingNote1" TEXT,
    "supportingNote2" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImprovementIdea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScorerNote_propertyId_scorerId_key" ON "ScorerNote"("propertyId", "scorerId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_propertyId_name_key" ON "Room"("propertyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RoomScore_roomId_scorerId_key" ON "RoomScore"("roomId", "scorerId");

-- AddForeignKey
ALTER TABLE "ScorerNote" ADD CONSTRAINT "ScorerNote_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScorerNote" ADD CONSTRAINT "ScorerNote_scorerId_fkey" FOREIGN KEY ("scorerId") REFERENCES "Scorer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomScore" ADD CONSTRAINT "RoomScore_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomScore" ADD CONSTRAINT "RoomScore_scorerId_fkey" FOREIGN KEY ("scorerId") REFERENCES "Scorer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenovationIdea" ADD CONSTRAINT "RenovationIdea_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearbyPlace" ADD CONSTRAINT "NearbyPlace_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreferenceTag" ADD CONSTRAINT "PreferenceTag_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PreferenceProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketComp" ADD CONSTRAINT "MarketComp_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingRoomScore" ADD CONSTRAINT "ListingRoomScore_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovementIdea" ADD CONSTRAINT "ImprovementIdea_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
