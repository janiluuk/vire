-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "appBundles" JSONB,
ADD COLUMN     "portableVmAddon" BOOLEAN NOT NULL DEFAULT false;
