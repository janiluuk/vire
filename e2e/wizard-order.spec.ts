import { expect, test } from "@playwright/test";
import {
  completeServiceOrder,
  mockCheckoutRoute,
  setupWizardE2e,
} from "./helpers/wizard-flow";

test.describe("order wizard (checkout mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await setupWizardE2e(page);
    await mockCheckoutRoute(page);
  });

  test("completes wizard and lands on thank-you (generic without paid Stripe session)", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    await completeServiceOrder(page, {
      email: "e2e-wizard@example.com",
      tier: "SSD-perus",
      delivery: "Nouto kotoa",
      hdd: "Sparkki poistaa HDD:n puolestani (+20 €)",
    });

    await expect(
      page.getByText(/Jos maksu on kesken|palaa tilaussivulle/i),
    ).toBeVisible();
  });
});
