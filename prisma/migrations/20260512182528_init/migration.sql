-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ServiceTier" AS ENUM ('SSD_BASIC', 'SSD_RAM', 'FULL_SERVICE', 'B2B');

-- CreateEnum
CREATE TYPE "SupportTier" AS ENUM ('FULL', 'EMAIL', 'DISCORD_ONLY');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('HOME_PICKUP', 'DROP_OFF', 'SELF');

-- CreateEnum
CREATE TYPE "ModelCheckStatus" AS ENUM ('UNCHECKED', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER', 'EDITOR');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "tier" "ServiceTier" NOT NULL,
    "supportTier" "SupportTier" NOT NULL,
    "deliveryMethod" "DeliveryMethod" NOT NULL,
    "computerMake" TEXT,
    "computerModel" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "address" TEXT,
    "preferredDate" TIMESTAMP(3),
    "notes" TEXT,
    "stripeSessionId" TEXT,
    "priceEur" INTEGER NOT NULL,
    "adminNotes" TEXT,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsbOrder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "stripeSessionId" TEXT,

    CONSTRAINT "UsbOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComputerModel" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "yearFrom" INTEGER,
    "yearTo" INTEGER,
    "status" "ModelCheckStatus" NOT NULL DEFAULT 'UNCHECKED',
    "compatible" BOOLEAN,
    "verdict" TEXT,
    "ssdSlot" TEXT,
    "maxRamGb" INTEGER,
    "notes" TEXT,
    "checkedBy" TEXT,
    "checkedAt" TIMESTAMP(3),

    CONSTRAINT "ComputerModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guide" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "titleFi" TEXT NOT NULL,
    "titleEn" TEXT,
    "descFi" TEXT NOT NULL,
    "descEn" TEXT,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "minutesFi" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "videoUrl" TEXT,
    "coverImage" TEXT,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComputerModel_make_model_key" ON "ComputerModel"("make", "model");

-- CreateIndex
CREATE UNIQUE INDEX "Guide_slug_key" ON "Guide"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
