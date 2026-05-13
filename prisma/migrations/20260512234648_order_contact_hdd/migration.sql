-- CreateEnum
CREATE TYPE "HddRemovalOption" AS ENUM ('VIRE_REMOVES', 'CUSTOMER_REMOVES', 'KEEP_IN_DEVICE');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "hddRemoval" "HddRemovalOption",
ALTER COLUMN "customerName" DROP NOT NULL,
ALTER COLUMN "customerEmail" DROP NOT NULL;
