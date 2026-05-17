/** Stable computer-lookup payload for wizard E2E (mocked API). */
export const E2E_COMPUTER_LOOKUP = {
  ok: true,
  result: {
    coerced: { make: "Lenovo", model: "ThinkPad T450" },
    matches: [
      {
        id: "e2e-wizard-match",
        make: "Lenovo",
        model: "ThinkPad T450",
        yearFrom: 2015,
        yearTo: 2016,
        compatible: true,
        verdict: null,
        ssdSlot: '2.5" SATA',
        maxRamGb: 16,
        status: "APPROVED",
      },
    ],
    reference: null,
    yearOptions: [2015],
    needsYearChoice: false,
    compatibility: {
      status: "compatible",
      reasons: [],
      speedGainEstimate: "2–4×",
    },
  },
} as const;

export async function mockComputerLookupRoute(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.route("**/api/public/computer-lookup", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(E2E_COMPUTER_LOOKUP),
    });
  });
}
