-- AlterTable
ALTER TABLE "CustomMetric" ADD COLUMN     "topicKey" TEXT;

-- CreateTable
CREATE TABLE "StylePhoto" (
    "id" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    "styleName" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StylePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StyleSwipe" (
    "id" TEXT NOT NULL,
    "scorerId" TEXT NOT NULL,
    "stylePhotoId" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StyleSwipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StyleSwipe_scorerId_stylePhotoId_key" ON "StyleSwipe"("scorerId", "stylePhotoId");

-- AddForeignKey
ALTER TABLE "StyleSwipe" ADD CONSTRAINT "StyleSwipe_scorerId_fkey" FOREIGN KEY ("scorerId") REFERENCES "Scorer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleSwipe" ADD CONSTRAINT "StyleSwipe_stylePhotoId_fkey" FOREIGN KEY ("stylePhotoId") REFERENCES "StylePhoto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
