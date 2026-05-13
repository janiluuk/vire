import { expect, test } from "@playwright/test";

test.describe("public routes (SSG / static pages)", () => {
  test("IA rewrite /fi/meista shows about content", async ({ page }) => {
    await page.goto("/fi/meista");
    await expect(page).toHaveURL(/\/fi\/meista/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Tietoa meistä/i }),
    ).toBeVisible();
  });

  test("/fi/info redirects to tietoa hub with process heading", async ({ page }) => {
    await page.goto("/fi/info");
    await expect(page).toHaveURL(/\/fi\/tietoa\/linux/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Päivitysprosessi/i }),
    ).toBeVisible();
  });

  test("/fi/tuki support hub loads", async ({ page }) => {
    await page.goto("/fi/tuki");
    await expect(
      page.getByRole("heading", { level: 1, name: /Tuki/i }),
    ).toBeVisible();
  });

  test("/fi/tilaus order lookup hub loads", async ({ page }) => {
    await page.goto("/fi/tilaus");
    await expect(
      page.getByRole("heading", { level: 1, name: /Tilauksen seuranta/i }),
    ).toBeVisible();
  });

  test("/fi/palvelu/b2b quote form loads", async ({ page }) => {
    await page.goto("/fi/palvelu/b2b");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Yritys- ja määrätilaukset/i,
      }),
    ).toBeVisible();
  });

  test("/en/tietoa/sovellukset/windows apps grid loads", async ({ page }) => {
    await page.goto("/en/tietoa/sovellukset/windows");
    await expect(
      page.getByRole("heading", { level: 1, name: /Windows → Linux/i }),
    ).toBeVisible();
  });

  test("health returns vire service id", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { ok?: boolean; service?: string };
    expect(json.ok).toBe(true);
    expect(json.service).toBe("vire");
  });
});
