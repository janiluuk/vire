import { expect, test } from "@playwright/test";

test.describe("key public journeys", () => {
  test("Learn hub overview and upgrade process page", async ({ page }) => {
    await page.goto("/fi/tietoa", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Vanha tietokone pystyy vielä paljon/i,
      }),
    ).toBeVisible();

    await page.goto("/fi/tietoa/linux", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: /Päivitysprosessi/i }),
    ).toBeVisible();
  });

  test("Learn hub demo gallery slideshow", async ({ page }) => {
    await page.goto("/fi/tietoa/galleria", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: /Demogalleria/i }),
    ).toBeVisible();
    await expect(page.getByRole("region", { name: /Demogalleria/i })).toBeVisible();
    await page.getByRole("button", { name: "Seuraava" }).click();
    await expect(page.getByRole("button", { name: "Edellinen" })).toBeVisible();
  });

  test("Learn hub: stability & comfort article loads", async ({ page }) => {
    await page.goto("/fi/tietoa/vakaus", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: /Vakaus ja mukavuus/i }),
    ).toBeVisible();
  });

  test("Home lists component transparency section", async ({ page }) => {
    await page.goto("/fi", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: /Komponentit — mitä asennamme/i,
      }),
    ).toBeVisible();
    await expect(page.locator("#komponentit")).toBeVisible();
  });

  test("compatibility checker on home", async ({ page }) => {
    await page.goto("/fi#yhteensopivuus", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 2, name: /Yhteensopivuus|Compatibility/i }),
    ).toBeVisible();
    await expect(page.getByTestId("home-compatibility-checker")).toBeVisible({
      timeout: 15_000,
    });
    const computer = page.locator("#home-compat-computer");
    await computer.scrollIntoViewIfNeeded();
    await expect(computer).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: /Jatka tilaukseen|Continue to order/i,
      }),
    ).toBeVisible();
  });

  test("DIY hub lists guides section", async ({ page }) => {
    await page.goto("/fi/itse", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: /Tee itse/i }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /Oppaat/i })).toBeVisible();
  });

  test("Sparkki for Good application page", async ({ page }) => {
    await page.goto("/fi/sparkki-for-good", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: /Sparkki for Good/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/Miksi haet alennusta/i)).toBeVisible();
  });

  test("legacy /vire-for-good redirects to /sparkki-for-good with query", async ({
    page,
  }) => {
    await page.goto("/fi/vire-for-good?sent=1", {
      waitUntil: "domcontentloaded",
    });
    await expect(page).toHaveURL(/\/fi\/sparkki-for-good\?sent=1$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Sparkki for Good/i }),
    ).toBeVisible();
  });

  test("Sparkki Care landing", async ({ page }) => {
    await page.goto("/fi/care", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: /Sparkki Care/i }),
    ).toBeVisible();
  });
});
