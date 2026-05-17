-- CreateTable
CREATE TABLE "LaptopSpecsInternetCache" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "makeNorm" TEXT NOT NULL,
    "modelNorm" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "makeDisplay" TEXT NOT NULL,
    "modelDisplay" TEXT NOT NULL,
    "summary" TEXT,
    "specUrl" TEXT,
    "searxResultCount" INTEGER NOT NULL DEFAULT 0,
    "usedLlm" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaptopSpecsInternetCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LaptopSpecsInternetCache_makeNorm_modelNorm_locale_key" ON "LaptopSpecsInternetCache"("makeNorm", "modelNorm", "locale");

-- CreateIndex
CREATE INDEX "LaptopSpecsInternetCache_expiresAt_idx" ON "LaptopSpecsInternetCache"("expiresAt");

-- CreateIndex
CREATE INDEX "LaptopSpecsInternetCache_updatedAt_idx" ON "LaptopSpecsInternetCache"("updatedAt");
