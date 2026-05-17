import { test } from "@playwright/test";
import { disconnectPrismaE2e, skipAdminE2eIfNoDatabase } from "./db-availability";
import { loginAdmin } from "./helpers/admin-auth";
import {
  assertOrderVisibleInAdmin,
  completeServiceOrder,
  setupWizardE2e,
} from "./helpers/wizard-flow";

test.describe("order wizard → admin panel", () => {
  test.beforeAll(async ({}, testInfo) => {
    await skipAdminE2eIfNoDatabase(testInfo);
  });

  test.afterAll(async () => {
    await disconnectPrismaE2e();
  });

  test.beforeEach(async ({ page }) => {
    await setupWizardE2e(page);
  });

  test("minimal order (no extras) appears in admin", async ({ page }) => {
    test.setTimeout(90_000);
    const email = `e2e-minimal-${Date.now()}@sparkki.test`;

    await completeServiceOrder(page, {
      email,
      delivery: "Nouto kotoa",
      hdd: "Pidän HDD:n koneessa (+0 €)",
    });

    await loginAdmin(page);
    await assertOrderVisibleInAdmin(page, {
      email,
      tier: "INSTALL_ONLY",
      delivery: "HOME_PICKUP",
      hdd: "KEEP_IN_DEVICE",
      appBundles: "—",
      portableVm: "—",
    });
  });

  test("order with all extras appears in admin", async ({ page }) => {
    test.setTimeout(120_000);
    const email = `e2e-all-extras-${Date.now()}@sparkki.test`;

    await completeServiceOrder(page, {
      email,
      tier: "Täysi huolto",
      delivery: "Postitus",
      supportTitle: "Sparkki Care Pro",
      bundles: [
        "Paikallinen AI — LLM ja työkalut",
        "Mediankäsittely ja editointi",
        "Musiikkituotanto",
        "Kehittäjän peruspaketti",
      ],
      portableVm: { handoff: "Oma USB-levy tai NAS luovutuksessa" },
      hdd: "Sparkki poistaa HDD:n puolestani (sisältyy pakettiin)",
    });

    await loginAdmin(page);
    await assertOrderVisibleInAdmin(page, {
      email,
      tier: "FULL_SERVICE",
      delivery: "DROP_OFF",
      hdd: "SPARKKI_REMOVES",
      appBundles:
        "Paikallinen AI (LLM ja työkalut), Mediankäsittelypaketti, Musiikkituotantopaketti, Kehittäjän peruspaketti",
      portableVm: "Asiakkaan USB tai NAS luovutuksessa",
      notesContains: "Care-kiinnostus: PRO",
    });
  });

  test("SSD basic + home pickup + one bundle (popular combo)", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const email = `e2e-ssd-bundle-${Date.now()}@sparkki.test`;

    await completeServiceOrder(page, {
      email,
      tier: "SSD-perus",
      delivery: "Nouto kotoa",
      bundles: ["Paikallinen AI — LLM ja työkalut"],
      hdd: "Sparkki poistaa HDD:n puolestani (+20 €)",
    });

    await loginAdmin(page);
    await assertOrderVisibleInAdmin(page, {
      email,
      tier: "SSD_BASIC",
      delivery: "HOME_PICKUP",
      hdd: "SPARKKI_REMOVES",
      appBundles: "Paikallinen AI (LLM ja työkalut)",
      portableVm: "—",
    });
  });

  test("SSD + RAM + postitus + Care+ (popular combo)", async ({ page }) => {
    test.setTimeout(90_000);
    const email = `e2e-ram-care-${Date.now()}@sparkki.test`;

    await completeServiceOrder(page, {
      email,
      tier: "SSD + RAM",
      delivery: "Postitus",
      supportTitle: "Sparkki Care+",
      hdd: "Poistan HDD:n itse (+0 €)",
    });

    await loginAdmin(page);
    await assertOrderVisibleInAdmin(page, {
      email,
      tier: "SSD_RAM",
      delivery: "DROP_OFF",
      hdd: "CUSTOMER_REMOVES",
      appBundles: "—",
      portableVm: "—",
      notesContains: "Care-kiinnostus: PLUS",
    });
  });

  test("install-only + self delivery (lightweight combo)", async ({ page }) => {
    test.setTimeout(90_000);
    const email = `e2e-self-delivery-${Date.now()}@sparkki.test`;

    await completeServiceOrder(page, {
      email,
      delivery: "Omatoiminen tuonti",
      hdd: "Poistan HDD:n itse (+0 €)",
    });

    await loginAdmin(page);
    await assertOrderVisibleInAdmin(page, {
      email,
      tier: "INSTALL_ONLY",
      delivery: "SELF",
      hdd: "CUSTOMER_REMOVES",
      appBundles: "—",
      portableVm: "—",
    });
  });
});
