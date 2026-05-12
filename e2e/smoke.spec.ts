import { expect, test } from "@playwright/test";

test("home loads with hero and navigation", async ({ page }) => {
  await page.goto("/fi");
  await expect(
    page.getByRole("heading", { level: 1, name: /toisen elämän/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: /Päävalikko/i }),
  ).toBeVisible();
});

test("health API", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.ok).toBe(true);
});
