-- Feature 4 (slice): anonymous compatibility checks for aggregate reporting / admin review.
CREATE TABLE "CompatibilityCheck" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'web',
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "ramGb" INTEGER,
    "diskType" TEXT,
    "status" TEXT NOT NULL,
    "reasons" JSONB NOT NULL,
    "speedGainEstimate" TEXT NOT NULL,
    "orderId" TEXT,
    "convertedToOrder" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CompatibilityCheck_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CompatibilityCheck_createdAt_idx" ON "CompatibilityCheck"("createdAt");
