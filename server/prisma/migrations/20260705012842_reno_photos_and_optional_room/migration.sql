-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "renovationIdeaId" TEXT;

-- AlterTable
ALTER TABLE "RenovationIdea" ALTER COLUMN "room" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_renovationIdeaId_fkey" FOREIGN KEY ("renovationIdeaId") REFERENCES "RenovationIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
