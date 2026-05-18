-- CreateTable
CREATE TABLE "StarterKitOrder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "shippedAt" TIMESTAMP(3),
    "trackingNumber" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'fi',

    CONSTRAINT "StarterKitOrder_pkey" PRIMARY KEY ("id")
);
