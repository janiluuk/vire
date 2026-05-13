import { expect, test } from "@playwright/test";
import { disconnectPrismaE2e, skipAdminE2eIfNoDatabase } from "./db-availability";

test.beforeAll(async ({}, testInfo) => {
  await skipAdminE2eIfNoDatabase(testInfo);
});

test.afterAll(async () => {
  await disconnectPrismaE2e();
});

test("admin compatibility checks lists API runs", async ({ page, request, baseURL }) => {
  const origin = baseURL ?? "http://127.0.0.1:1337";
  const res = await request.post(`${origin}/api/compatibility`, {
    data: {
      make: "E2E Make",
      model: "E2E Model",
      ramGb: 8,
      diskType: "hdd",
      source: "web",
    },
  });
  expect(res.ok()).toBeTruthy();

  const login =
    process.env.ADMIN_LOGIN ?? process.env.ADMIN_EMAIL ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "changeme";

  await page.goto("/admin/login", { waitUntil: "networkidle" });
  await page.locator("#email").fill(login);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /Kirjaudu|Sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 25_000 });

  await page.goto("/admin/checks", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", {
      name: /Yhteensopivuustarkistukset|Compatibility checks/i,
    }),
  ).toBeVisible();
  await expect(page.getByText("E2E Make")).toBeVisible();
  await expect(page.getByText("E2E Model")).toBeVisible();
});
