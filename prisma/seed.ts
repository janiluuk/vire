import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@verso.fi";
  const password = process.env.ADMIN_PASSWORD ?? "changeme";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name: "Admin", role: "SUPER", passwordHash },
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
      update: {},
      create: m,
    });
  }

  await prisma.guide.upsert({
    where: { slug: "tarkista-levy" },
    update: {
      titleFi: "Miten tiedän, onko koneessani HDD vai SSD?",
      titleEn: "How do I know if I have HDD or SSD?",
      descFi: "Nopea tarkistus ennen päivitystä.",
      descEn: "Quick check before upgrading.",
      category: "install",
      difficulty: "easy",
      minutesFi: 5,
      published: true,
      order: 0,
    },
    create: {
      slug: "tarkista-levy",
      titleFi: "Miten tiedän, onko koneessani HDD vai SSD?",
      titleEn: "How do I know if I have HDD or SSD?",
      descFi: "Nopea tarkistus ennen päivitystä.",
      descEn: "Quick check before upgrading.",
      category: "install",
      difficulty: "easy",
      minutesFi: 5,
      published: true,
      order: 0,
    },
  });

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
