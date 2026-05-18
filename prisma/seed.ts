import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computerModelSlugFields } from "../lib/koneet/computer-model-db";

const prisma = new PrismaClient();

const guides = [
  {
    slug: "tarkista-levy",
    order: 0,
    titleFi: "Miten tiedän, onko koneessani HDD vai SSD?",
    titleEn: "How do I know if I have HDD or SSD?",
    descFi: "Nopea tarkistus ennen päivitystä.",
    descEn: "Quick check before upgrading.",
    category: "install",
    difficulty: "easy",
    minutesFi: 5,
  },
  {
    slug: "valitse-ssd",
    order: 1,
    titleFi: "Valitse oikea SSD vanhaan tai uuteen koneeseen",
    titleEn: "Pick the right SSD for your machine",
    descFi: "SATA, NVMe, koko ja kapasiteetti selkokielellä.",
    descEn: "SATA, NVMe, form factor, and capacity in plain language.",
    category: "hardware",
    difficulty: "medium",
    minutesFi: 12,
  },
  {
    slug: "asenna-kannettava",
    order: 2,
    titleFi: "SSD:n vaihto kannettavaan — turvallinen työjärjestys",
    titleEn: "Laptop SSD swap — safe workflow",
    descFi: "Ruuvit, akku ja M.2 / 2,5\" ilman turhia riskejä.",
    descEn: "Screws, battery, and M.2 / 2.5\" without needless risk.",
    category: "install",
    difficulty: "medium",
    minutesFi: 20,
  },
  {
    slug: "asenna-poytatietokone",
    order: 3,
    titleFi: "SSD:n vaihto pöytäkoneessa — virta, kaapelit ja tilanjako",
    titleEn: "Desktop SSD swap — power, cables, and airflow",
    descFi: "Kotelo auki, SATA/NVMe ja ilmavirtaus kuntoon.",
    descEn: "Open the case, SATA/NVMe, and tidy airflow.",
    category: "install",
    difficulty: "medium",
    minutesFi: 18,
  },
  {
    slug: "asenna-linux-usb",
    order: 4,
    titleFi: "Linux-asennus USB-medialta — käynnistysvalikko ja asennuspolku",
    titleEn: "Install Linux from USB — boot menu and install path",
    descFi: "UEFI-boot, live-kokeilu ja osioiden perusteet.",
    descEn: "UEFI boot, live session, and partitioning basics.",
    category: "install",
    difficulty: "easy",
    minutesFi: 10,
  },
  {
    slug: "siirra-tiedostot",
    order: 5,
    titleFi: "Tiedostojen siirto vanhalta levyltä — ulkoinen levy ja rsync",
    titleEn: "Move files off the old drive — external disk and rsync",
    descFi: "Varmuuskopio ennen formatointia; Windows ja Linux.",
    descEn: "Backup before wipe; Windows and Linux tips.",
    category: "backup",
    difficulty: "medium",
    minutesFi: 15,
  },
  {
    slug: "linux-mint-ensiaskeleet",
    order: 6,
    titleFi: "Linux Mint — ensiaskeleet asennuksen jälkeen",
    titleEn: "Linux Mint — first steps after install",
    descFi: "Päivitykset, ajurit, turva ja seuraavat kokeilut.",
    descEn: "Updates, drivers, basics, and what to try next.",
    category: "desktop",
    difficulty: "easy",
    minutesFi: 12,
  },
] as const;

type RefJsonRow = Record<string, string>;

async function seedLaptopReferenceSpecs() {
  const existing = await prisma.laptopReferenceSpec.count();
  if (existing > 0) return;

  const jsonPath = path.join(process.cwd(), "data/reference-laptops.json");
  const rows = JSON.parse(readFileSync(jsonPath, "utf-8")) as RefJsonRow[];
  const batchSize = 200;
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows
      .slice(i, i + batchSize)
      .map((row) => ({
        manufacturer: (row["Manufacturer"] ?? "").trim(),
        modelName: (row["Model Name"] ?? "").trim(),
        category: (row["Category"] ?? "").trim() || null,
        screenSize: (row["Screen Size"] ?? "").trim() || null,
        screenDetail: (row["Screen"] ?? "").trim() || null,
        cpu: (row["CPU"] ?? "").trim() || null,
        ram: (row["RAM"] ?? "").trim() || null,
        storage: (row["Storage"] ?? "").trim() || null,
        gpu: (row["GPU"] ?? "").trim() || null,
        operatingSystem: (row["Operating System"] ?? "").trim() || null,
        osVersion: (row["Operating System Version"] ?? "").trim() || null,
        weight: (row["Weight"] ?? "").trim() || null,
        priceEuros: (row["Price (Euros)"] ?? "").trim() || null,
      }))
      .filter((r) => r.manufacturer.length > 0 && r.modelName.length > 0);
    if (chunk.length === 0) continue;
    await prisma.laptopReferenceSpec.createMany({ data: chunk });
  }
  console.log(
    `Imported ${rows.length} LaptopReferenceSpec rows from data/reference-laptops.json`,
  );
}

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@sparkki.fi";
  const username = (process.env.ADMIN_USERNAME ?? "admin").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "changeme";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, username },
    create: {
      email,
      username,
      name: "Admin",
      role: "SUPER",
      passwordHash,
    },
  });

  const models = [
    { make: "Lenovo", model: "ThinkPad T450", yearFrom: 2015, yearTo: 2016 },
    { make: "Dell", model: "Latitude E6440", yearFrom: 2013, yearTo: 2015 },
    { make: "HP", model: "ProBook 450 G3", yearFrom: 2016, yearTo: 2017 },
    { make: "Asus", model: "VivoBook 15", yearFrom: 2018, yearTo: 2020 },
    { make: "Acer", model: "Aspire 5", yearFrom: 2019, yearTo: 2021 },
  ];

  for (const m of models) {
    await prisma.computerModel.upsert({
      where: { make_model: { make: m.make, model: m.model } },
      update: computerModelSlugFields(m.make, m.model),
      create: { ...m, ...computerModelSlugFields(m.make, m.model) },
    });
  }

  const missingSlug = await prisma.computerModel.findMany({
    where: { slug: null },
    select: { id: true, make: true, model: true },
  });
  for (const row of missingSlug) {
    await prisma.computerModel.update({
      where: { id: row.id },
      data: computerModelSlugFields(row.make, row.model),
    });
  }

  for (const g of guides) {
    await prisma.guide.upsert({
      where: { slug: g.slug },
      update: {
        titleFi: g.titleFi,
        titleEn: g.titleEn,
        descFi: g.descFi,
        descEn: g.descEn,
        category: g.category,
        difficulty: g.difficulty,
        minutesFi: g.minutesFi,
        published: true,
        order: g.order,
      },
      create: {
        slug: g.slug,
        titleFi: g.titleFi,
        titleEn: g.titleEn,
        descFi: g.descFi,
        descEn: g.descEn,
        category: g.category,
        difficulty: g.difficulty,
        minutesFi: g.minutesFi,
        published: true,
        order: g.order,
      },
    });
  }

  await seedLaptopReferenceSpecs();

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
