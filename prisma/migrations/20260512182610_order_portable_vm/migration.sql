-- CreateEnum
CREATE TYPE "PortableVmHandoff" AS ENUM ('CUSTOMER_STORAGE', 'SHIPPED_MEDIA');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "portableVmAddon" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "portableVmHandoff" "PortableVmHandoff";
