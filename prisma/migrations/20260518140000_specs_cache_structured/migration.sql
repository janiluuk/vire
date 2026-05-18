-- Structured hardware fields from SearXNG + LLM agent (CPU, RAM, storage, …)
ALTER TABLE "LaptopSpecsInternetCache" ADD COLUMN "cpu" TEXT;
ALTER TABLE "LaptopSpecsInternetCache" ADD COLUMN "ram" TEXT;
ALTER TABLE "LaptopSpecsInternetCache" ADD COLUMN "storage" TEXT;
ALTER TABLE "LaptopSpecsInternetCache" ADD COLUMN "gpu" TEXT;
ALTER TABLE "LaptopSpecsInternetCache" ADD COLUMN "display" TEXT;
ALTER TABLE "LaptopSpecsInternetCache" ADD COLUMN "weight" TEXT;
ALTER TABLE "LaptopSpecsInternetCache" ADD COLUMN "maxRamGb" INTEGER;
ALTER TABLE "LaptopSpecsInternetCache" ADD COLUMN "ssdSlot" TEXT;
ALTER TABLE "LaptopSpecsInternetCache" ADD COLUMN "yearFrom" INTEGER;
ALTER TABLE "LaptopSpecsInternetCache" ADD COLUMN "yearTo" INTEGER;
