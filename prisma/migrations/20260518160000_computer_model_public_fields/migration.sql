-- AlterTable
ALTER TABLE "ComputerModel" ADD COLUMN "recommendedSsd" TEXT,
ADD COLUMN "ssdShopUrl" TEXT,
ADD COLUMN "estimatedBootSec" INTEGER,
ADD COLUMN "publicNotes" TEXT,
ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
