import { expect, test } from "@playwright/test";

test("home loads with hero and navigation", async ({ page }) => {
  await page.goto("/fi");
  await expect(
    page.getByRole("heading", { level: 1, name: /toisen elämän/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: /Päävalikko/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: /Toimitus ja tuki|Delivery and support/i }),
  ).toBeVisible();
});

test("health API", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.ok).toBe(true);
});

test("service page shows order wizard", async ({ page }) => {
  await page.goto("/fi/palvelu");
  await expect(
    page.getByRole("heading", { name: /Tilaus|Order/i }),
  ).toBeVisible();
});

test("privacy page loads", async ({ page }) => {
  await page.goto("/fi/tietosuoja");
  await expect(
    page.getByRole("heading", { level: 1, name: /Tietosuoja|Privacy/i }),
  ).toBeVisible();
});

test("locale switch EN shows English home hero", async ({ page }) => {
  await page.goto("/fi");
  // Locale links expose aria-label (Phase 9), which overrides the visible "EN" text.
  await page
    .getByRole("link", {
      name: /Vaihda sivusto englanniksi|Switch site to English/i,
    })
    .first()
    .click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Your computer deserves a second life|toisen elämän/i,
    }),
  ).toBeVisible();
});
