import { expect, test } from "@playwright/test";

function e2eOrigin(): string {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:1337";
}

test.describe("order wizard (checkout mocked)", () => {
  test.beforeEach(async ({ page }) => {
    const origin = e2eOrigin();
    await page.route("**/api/checkout", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          url: `${origin}/fi/palvelu/kiitos?session_id=e2e_mock`,
          orderId: "e2e_order",
        }),
      });
    });
  });

  test("completes wizard and lands on thank-you (generic without paid Stripe session)", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    await page.goto("/fi/palvelu", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: /Tilaus|Order/i }),
    ).toBeVisible();

    const wizard = page.getByTestId("order-wizard");

    await wizard.locator("#wiz-computer").fill("Lenovo ThinkPad T450");

    await expect(wizard.getByRole("button", { name: "Seuraava" })).toBeEnabled({
      timeout: 15_000,
    });
    await wizard.getByRole("button", { name: "Seuraava" }).click();

    await expect(
      wizard.getByRole("heading", { name: "Palvelu", exact: true }),
    ).toBeVisible({ timeout: 15_000 });
    await wizard.getByRole("button", { name: "SSD-perus" }).click();
    await wizard.getByRole("button", { name: "Nouto kotoa" }).click();
    await wizard.getByRole("button", { name: "Seuraava" }).click();

    await expect(
      wizard.getByRole("heading", { name: /Kiintolevy \(HDD\)/ }),
    ).toBeVisible({ timeout: 15_000 });
    await wizard.getByRole("button", { name: "Seuraava" }).click();

    await wizard.locator("#wiz-contact").fill("e2e-wizard@example.com");
    await wizard.getByRole("button", { name: "Seuraava" }).click();

    await expect(
      wizard.getByRole("heading", { name: "Yhteenveto", exact: true }),
    ).toBeVisible();
    await wizard.getByRole("button", { name: "Siirry maksamaan" }).click();

    await page.waitForURL(/\/fi\/palvelu\/kiitos/, { timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: "Kiitos!", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(/Jos maksu on kesken|palaa tilaussivulle/i),
    ).toBeVisible();
  });
});
