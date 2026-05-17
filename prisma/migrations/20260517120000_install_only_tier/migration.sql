-- AlterEnum
ALTER TYPE "ServiceTier" ADD VALUE IF NOT EXISTS 'INSTALL_ONLY';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "carePackageInterest" TEXT;
