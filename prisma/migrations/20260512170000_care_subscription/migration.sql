-- CreateEnum
CREATE TYPE "CareStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'PAUSED');

-- CreateTable
CREATE TABLE "CareSubscription" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "orderId" TEXT,
    "status" "CareStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeSubId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "notes" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'fi',

    CONSTRAINT "CareSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CareSubscription_customerEmail_key" ON "CareSubscription"("customerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "CareSubscription_stripeSubId_key" ON "CareSubscription"("stripeSubId");
