-- AlterTable
ALTER TABLE "ComputerModel" ADD COLUMN "slug" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "careUpsell75SentAt" TIMESTAMP(3),
ADD COLUMN "careUpsell88SentAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "ComputerModel_slug_key" ON "ComputerModel"("slug");
