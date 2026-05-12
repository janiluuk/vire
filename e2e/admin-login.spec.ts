import { expect, test } from "@playwright/test";

test("admin login reaches dashboard", async ({ page }) => {
  const email = process.env.ADMIN_EMAIL ?? "admin@vire.fi";
  const password = process.env.ADMIN_PASSWORD ?? "changeme";

  await page.goto("/admin/login", { waitUntil: "networkidle" });
  await page.getByLabel("Sähköposti").fill(email);
  await page.getByLabel("Salasana").fill(password);
  await page.getByRole("button", { name: "Kirjaudu" }).click();

  await expect(page).toHaveURL(/\/admin$/, { timeout: 25_000 });
  await expect(
    page.getByRole("heading", { name: /Etusivu/i }),
  ).toBeVisible();
  await expect(page.getByText(/Tervetuloa/)).toBeVisible();
});
