import { expect, test } from "@playwright/test";
import { disconnectPrismaE2e, skipAdminE2eIfNoDatabase } from "./db-availability";

test.beforeAll(async ({ }, testInfo) => {
  await skipAdminE2eIfNoDatabase(testInfo);
});

test.afterAll(async () => {
  await disconnectPrismaE2e();
});

test("admin can open orders list after login", async ({ page }) => {
  const email = process.env.ADMIN_EMAIL ?? "admin@vire.fi";
  const password = process.env.ADMIN_PASSWORD ?? "changeme";

  await page.goto("/admin/login", { waitUntil: "networkidle" });
  await page.getByLabel("Sähköposti").fill(email);
  await page.getByLabel("Salasana").fill(password);
  await page.getByRole("button", { name: "Kirjaudu" }).click();

  await expect(page).toHaveURL(/\/admin$/, { timeout: 25_000 });

  await page.goto("/admin/orders", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { level: 1, name: "Tilaukset" }),
  ).toBeVisible();
  await expect(
    page.getByPlaceholder(/Hae nimellä tai sähköpostilla/),
  ).toBeVisible();
});
