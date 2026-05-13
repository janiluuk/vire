-- AlterTable
ALTER TABLE "Order" ADD COLUMN "appBundleIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
