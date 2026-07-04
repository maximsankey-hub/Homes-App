-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "listingPrice" INTEGER NOT NULL,
    "sqft" INTEGER NOT NULL,
    "beds" INTEGER NOT NULL,
    "baths" INTEGER NOT NULL,
    "yearBuilt" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'NOT_VISITED',
    "lastVisitedAt" DATETIME,
    "walkScore" INTEGER,
    "transitScore" INTEGER,
    "bikeScore" INTEGER,
    "safetyScore" INTEGER,
    "noiseScore" INTEGER,
    "greenSpaceScore" INTEGER,
    "sidewalkScore" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Room_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Scorer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,
    "contact" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RoomScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "scorerId" TEXT NOT NULL,
    "layout" INTEGER NOT NULL,
    "storage" INTEGER NOT NULL,
    "light" INTEGER NOT NULL,
    "vibe" INTEGER NOT NULL,
    "feeling" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoomScore_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoomScore_scorerId_fkey" FOREIGN KEY ("scorerId") REFERENCES "Scorer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "roomId" TEXT,
    "type" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Media_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Media_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RenovationIdea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "costLow" INTEGER NOT NULL,
    "costHigh" INTEGER NOT NULL,
    "feasibility" INTEGER NOT NULL,
    "need" TEXT,
    "constraintNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RenovationIdea_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NearbyPlace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "distanceText" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "icon" TEXT NOT NULL,
    "iconColor" TEXT NOT NULL,
    "iconBg" TEXT NOT NULL,
    CONSTRAINT "NearbyPlace_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PreferenceProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "method" TEXT NOT NULL DEFAULT 'BOTH',
    "freeText" TEXT,
    "weightEmotional" INTEGER NOT NULL DEFAULT 5,
    "weightStorage" INTEGER NOT NULL DEFAULT 5,
    "weightLight" INTEGER NOT NULL DEFAULT 5,
    "aestheticStyle" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PreferenceTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    CONSTRAINT "PreferenceTag_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PreferenceProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "listPrice" INTEGER NOT NULL,
    "sqft" INTEGER NOT NULL,
    "beds" INTEGER NOT NULL,
    "baths" INTEGER NOT NULL,
    "estValueLow" INTEGER NOT NULL,
    "estValueHigh" INTEGER NOT NULL,
    "confidenceScore" REAL NOT NULL,
    "avgDaysOnMarket" INTEGER NOT NULL,
    "pricePerSqft" INTEGER NOT NULL,
    "buyerEmotionalAvg" REAL NOT NULL,
    "buyerFunctionalAvg" REAL NOT NULL,
    "marketStatus" TEXT NOT NULL,
    "buyerViewsCount" INTEGER NOT NULL,
    "walkabilityScore" REAL NOT NULL,
    "parkAccessScore" REAL NOT NULL,
    "privacyScore" REAL NOT NULL,
    "schoolQualityScore" REAL NOT NULL,
    "noiseLevelScore" REAL NOT NULL,
    "buyerPriorityLight" REAL NOT NULL,
    "buyerPriorityKitchen" REAL NOT NULL,
    "buyerPriorityStorage" REAL NOT NULL,
    "buyerPriorityLayout" REAL NOT NULL,
    "fitHosting" REAL NOT NULL,
    "fitWFH" REAL NOT NULL,
    "fitOrganization" REAL NOT NULL,
    "fitFamily" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MarketComp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "sqft" INTEGER NOT NULL,
    "saleDate" DATETIME NOT NULL,
    "price" INTEGER NOT NULL,
    "diffType" TEXT NOT NULL,
    "diffAmount" INTEGER NOT NULL,
    "note" TEXT,
    CONSTRAINT "MarketComp_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ListingRoomScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "score" REAL NOT NULL,
    CONSTRAINT "ListingRoomScore_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImprovementIdea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "demandLevel" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "valueLift" INTEGER NOT NULL,
    "costLow" INTEGER NOT NULL,
    "costHigh" INTEGER NOT NULL,
    "feasibility" INTEGER NOT NULL,
    "supportingNote1" TEXT,
    "supportingNote2" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImprovementIdea_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_propertyId_name_key" ON "Room"("propertyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RoomScore_roomId_scorerId_key" ON "RoomScore"("roomId", "scorerId");
