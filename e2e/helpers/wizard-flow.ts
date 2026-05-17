import { expect, type Locator, type Page } from "@playwright/test";
import { mockComputerLookupRoute } from "../fixtures/computer-lookup";

export type WizardOrderConfig = {
  email: string;
  computer?: string;
  /** Service tier card label (FI). Default: install-only. */
  tier?: string;
  delivery: string;
  /** Support card title; omit for default included support. */
  supportTitle?: string;
  /** Bundle card labels to toggle on step 2. */
  bundles?: string[];
  portableVm?: { handoff: string };
  /** HDD option main label on step 3. */
  hdd: string;
};

const DEFAULT_COMPUTER = "Lenovo ThinkPad T450";
const DEFAULT_TIER = "Ei päivitystä, vain asennus";

export async function setupWizardE2e(page: Page): Promise<void> {
  await mockComputerLookupRoute(page);
}

export async function waitForWizardReady(page: Page): Promise<void> {
  await expect(page.getByTestId("order-wizard")).toHaveAttribute(
    "data-order-wizard-dialog",
    "",
    { timeout: 15_000 },
  );
  await expect(page.locator("body")).toHaveAttribute(
    "data-wizard-fullscreen",
    "true",
    { timeout: 15_000 },
  );
}

export async function mockCheckoutRoute(page: Page): Promise<void> {
  const origin =
    process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:1337";
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
}

function wizard(page: Page): Locator {
  return page.getByTestId("order-wizard");
}

async function clickNext(w: Locator): Promise<void> {
  const next = w.getByRole("button", { name: "Seuraava" });
  await expect(next).toBeEnabled({ timeout: 15_000 });
  await next.scrollIntoViewIfNeeded();
  await next.click();
}

async function openAddonsSection(w: Locator): Promise<void> {
  const details = w.locator("details").first();
  const isOpen = await details.evaluate((el) => el.hasAttribute("open"));
  if (!isOpen) {
    await details.locator("summary").click();
  }
}

export async function completeServiceOrder(
  page: Page,
  config: WizardOrderConfig,
): Promise<void> {
  const w = wizard(page);
  const computer = config.computer ?? DEFAULT_COMPUTER;
  const tier = config.tier ?? DEFAULT_TIER;

  await page.goto("/fi/tilaa", { waitUntil: "networkidle" });
  await waitForWizardReady(page);

  await w.locator("#wiz-computer").fill(computer);
  await clickNext(w);

  await expect(
    w.getByRole("heading", { name: "Palvelu", exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  if (tier !== DEFAULT_TIER) {
    await w.getByRole("button", { name: tier }).click();
  }
  await w.getByRole("button", { name: config.delivery }).click();
  await clickNext(w);

  await expect(
    w.getByRole("heading", { name: /Tuki palvelun jälkeen/i }),
  ).toBeVisible({ timeout: 15_000 });
  if (config.supportTitle) {
    await w.getByRole("radio", { name: config.supportTitle }).click();
  }

  if (config.bundles?.length || config.portableVm) {
    await openAddonsSection(w);
    for (const bundle of config.bundles ?? []) {
      await w.getByRole("button", { name: bundle }).click();
    }
    if (config.portableVm) {
      await w
        .getByRole("button", { name: "Lisää virtuaalikone / levykuva tilaukseen" })
        .click();
      await w
        .getByRole("button", { name: config.portableVm.handoff })
        .click();
    }
  }

  await clickNext(w);

  await expect(
    w.getByRole("heading", { name: /Kiintolevy \(HDD\)/ }),
  ).toBeVisible({ timeout: 15_000 });
  await w.getByRole("button", { name: config.hdd }).click();
  await clickNext(w);

  await w.locator("#wiz-contact").fill(config.email);
  await expect(
    w.getByRole("heading", { name: "Yhteenveto", exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await w.getByRole("button", { name: "Siirry maksamaan" }).click();

  await page.waitForURL(/\/fi\/palvelu\/kiitos/, { timeout: 20_000 });
  await expect(
    page.getByRole("heading", { name: "Kiitos!", exact: true }),
  ).toBeVisible();
}

function adminDd(page: Page, label: string): Locator {
  return page.locator(`dt:has-text("${label}")`).locator("..").locator("dd");
}

export type AdminOrderExpectations = {
  email: string;
  tier: string;
  delivery: string;
  hdd: string;
  appBundles?: string;
  portableVm?: string;
  notesContains?: string;
};

export async function assertOrderVisibleInAdmin(
  page: Page,
  expected: AdminOrderExpectations,
): Promise<void> {
  await page.goto(
    `/admin/orders?q=${encodeURIComponent(expected.email)}`,
    { waitUntil: "networkidle" },
  );

  await expect(
    page.getByRole("heading", { level: 1, name: "Tilaukset" }),
  ).toBeVisible();

  const rowLink = page.getByRole("link", { name: expected.email });
  await expect(rowLink).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole("cell", { name: expected.tier, exact: true }),
  ).toBeVisible();

  await rowLink.click();
  await expect(page).toHaveURL(/\/admin\/orders\/[a-z0-9]+/i, {
    timeout: 15_000,
  });

  await expect(page.getByText(expected.email)).toBeVisible();
  await expect(adminDd(page, "Taso")).toHaveText(expected.tier);
  await expect(adminDd(page, "Toimitus")).toHaveText(expected.delivery);
  await expect(adminDd(page, "HDD-poisto")).toHaveText(expected.hdd);

  if (expected.appBundles !== undefined) {
    await expect(adminDd(page, "Ohjelmapaketit")).toHaveText(
      expected.appBundles,
    );
  }
  if (expected.portableVm !== undefined) {
    await expect(adminDd(page, "Virtuaalikone / levykuva")).toHaveText(
      expected.portableVm,
    );
  }
  if (expected.notesContains) {
    await expect(adminDd(page, "Asiakkaan viesti")).toContainText(
      expected.notesContains,
    );
  }
}
