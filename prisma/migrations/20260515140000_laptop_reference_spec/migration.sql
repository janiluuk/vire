-- Reference laptop specs (imported retail-style listings; not manufacturer-official).
CREATE TABLE "LaptopReferenceSpec" (
    "id" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "category" TEXT,
    "screenSize" TEXT,
    "screenDetail" TEXT,
    "cpu" TEXT,
    "ram" TEXT,
    "storage" TEXT,
    "gpu" TEXT,
    "operatingSystem" TEXT,
    "osVersion" TEXT,
    "weight" TEXT,
    "priceEuros" TEXT,

    CONSTRAINT "LaptopReferenceSpec_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LaptopReferenceSpec_manufacturer_modelName_idx" ON "LaptopReferenceSpec"("manufacturer", "modelName");
