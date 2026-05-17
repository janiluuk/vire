import type { Page } from "@playwright/test";

export async function loginAdmin(page: Page): Promise<void> {
  const email = process.env.ADMIN_EMAIL ?? "admin@sparkki.fi";
  const password = process.env.ADMIN_PASSWORD ?? "changeme";

  await page.goto("/admin/login", { waitUntil: "networkidle" });
  await page.getByLabel("Sähköposti").fill(email);
  await page.getByLabel("Salasana").fill(password);
  await page.getByRole("button", { name: "Kirjaudu" }).click();
  await page.waitForURL(/\/admin$/, { timeout: 25_000 });
}
