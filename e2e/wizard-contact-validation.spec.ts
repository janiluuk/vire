import { expect, test } from "@playwright/test";
import {
  goToWizardContactStep,
  mockCheckoutRoute,
  setupWizardE2e,
} from "./helpers/wizard-flow";

test.describe("order wizard contact validation", () => {
  test.beforeEach(async ({ page }) => {
    await setupWizardE2e(page);
    await mockCheckoutRoute(page);
  });

  test("shows error for invalid email and blocks checkout", async ({ page }) => {
    let checkoutPosts = 0;
    const w = await goToWizardContactStep(page);

    await page.route("**/api/checkout", async (route) => {
      if (route.request().method() === "POST") checkoutPosts += 1;
      await route.continue();
    });
    const contact = w.locator("#wiz-contact");
    await contact.clear();
    await contact.fill("foo@bar");
    await contact.blur();

    await expect(page.locator("#wiz-contact-err")).toBeVisible();
    await expect(page.locator("#wiz-contact-err")).toContainText(
      /Tarkista muoto|sähköpostia tai puhelinnumeroa/i,
    );
    await expect(contact).toHaveAttribute("aria-invalid", "true");
    await expect(
      w.getByRole("button", { name: "Siirry maksamaan" }),
    ).toHaveCount(0);
    await expect(
      w.getByRole("heading", { name: "Yhteenveto", exact: true }),
    ).toHaveCount(0);
    expect(checkoutPosts).toBe(0);
  });

  test("accepts valid email and enables payment", async ({ page }) => {
    let checkoutPosts = 0;
    const w = await goToWizardContactStep(page);

    await page.route("**/api/checkout", async (route) => {
      if (route.request().method() === "POST") checkoutPosts += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          url: `${process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:1337"}/fi/palvelu/kiitos?session_id=e2e_mock`,
          orderId: "e2e_order",
        }),
      });
    });
    await w.locator("#wiz-contact").fill("valid.wizard@example.com");

    await expect(page.locator("#wiz-contact-err")).toHaveCount(0);
    await expect(
      w.getByRole("heading", { name: "Yhteenveto", exact: true }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      w.getByRole("button", { name: "Siirry maksamaan" }),
    ).toBeEnabled();

    await w.getByRole("button", { name: "Siirry maksamaan" }).click();
    await page.waitForURL(/\/fi\/palvelu\/kiitos/, { timeout: 20_000 });
    expect(checkoutPosts).toBe(1);
  });
});
