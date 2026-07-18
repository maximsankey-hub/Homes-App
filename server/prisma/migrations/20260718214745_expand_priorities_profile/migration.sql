-- CreateEnum
CREATE TYPE "MetricScope" AS ENUM ('ROOM', 'PROPERTY');

-- AlterTable
ALTER TABLE "CustomMetric" ADD COLUMN     "scope" "MetricScope" NOT NULL DEFAULT 'ROOM';

-- AlterTable
ALTER TABLE "PreferenceProfile" ADD COLUMN     "hasPets" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priorityBudgetVsDream" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "priorityMoveInReadyVsReno" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "PropertyMetricScore" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "scorerId" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyMetricScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PropertyMetricScore_propertyId_scorerId_metricId_key" ON "PropertyMetricScore"("propertyId", "scorerId", "metricId");

-- AddForeignKey
ALTER TABLE "PropertyMetricScore" ADD CONSTRAINT "PropertyMetricScore_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyMetricScore" ADD CONSTRAINT "PropertyMetricScore_scorerId_fkey" FOREIGN KEY ("scorerId") REFERENCES "Scorer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyMetricScore" ADD CONSTRAINT "PropertyMetricScore_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "CustomMetric"("id") ON DELETE CASCADE ON UPDATE CASCADE;
