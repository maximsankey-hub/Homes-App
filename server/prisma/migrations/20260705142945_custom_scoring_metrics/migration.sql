-- CreateEnum
CREATE TYPE "MetricCategory" AS ENUM ('EMOTIONAL', 'FUNCTIONAL');

-- CreateTable
CREATE TABLE "CustomMetric" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" "MetricCategory" NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomMetricScore" (
    "id" TEXT NOT NULL,
    "roomScoreId" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "CustomMetricScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomMetric_householdId_label_key" ON "CustomMetric"("householdId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "CustomMetricScore_roomScoreId_metricId_key" ON "CustomMetricScore"("roomScoreId", "metricId");

-- AddForeignKey
ALTER TABLE "CustomMetric" ADD CONSTRAINT "CustomMetric_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomMetricScore" ADD CONSTRAINT "CustomMetricScore_roomScoreId_fkey" FOREIGN KEY ("roomScoreId") REFERENCES "RoomScore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomMetricScore" ADD CONSTRAINT "CustomMetricScore_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "CustomMetric"("id") ON DELETE CASCADE ON UPDATE CASCADE;
