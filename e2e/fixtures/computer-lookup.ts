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
        imageUrl: null,
      },
    ],
    reference: {
      cpu: "Intel Core i5-4300U",
      ram: "8GB",
      storage: "500GB HDD",
      gpu: "Intel HD Graphics 4400",
      display: '14" — 1920x1080',
      weight: "1.81kg",
      summary: "E2E catalog reference summary.",
      category: "Ultrabook",
    },
    yearOptions: [2015],
    needsYearChoice: false,
    compatibility: {
      status: "compatible",
      reasons: [],
      speedGainEstimate: "2–4×",
    },
    webSpecs: null,
    discovered: null,
  },
} as const;

/** Catalog-only match: reference specs, no verified ComputerModel row, no web hints. */
export const E2E_CATALOG_ONLY_LOOKUP = {
  ok: true,
  result: {
    coerced: { make: "Dell", model: "XPS 13" },
    matches: [],
    reference: {
      cpu: "Intel Core i5 8th Gen",
      ram: "8GB",
      storage: "256GB SSD",
      gpu: "Intel UHD Graphics 620",
      display: '13.3" — Full HD',
      weight: "1.2kg",
      summary: "E2E: retail catalog row (no web lookup).",
    },
    yearOptions: [],
    needsYearChoice: false,
    compatibility: {
      status: "borderline",
      reasons: ["E2E heuristic"],
      speedGainEstimate: "—",
    },
    webSpecs: null,
    discovered: null,
  },
} as const;

export const E2E_NO_MATCH_LOOKUP = {
  ok: true,
  result: {
    coerced: { make: "Obscure", model: "Brand X999" },
    matches: [],
    reference: null,
    yearOptions: [],
    needsYearChoice: false,
    compatibility: {
      status: "borderline",
      reasons: [],
      speedGainEstimate: "—",
    },
    webSpecs: null,
    discovered: null,
  },
} as const;

async function fulfillComputerLookup(
  route: import("@playwright/test").Route,
  body: unknown,
): Promise<void> {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

export async function mockComputerLookupRoute(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.route("**/api/public/computer-lookup", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await fulfillComputerLookup(route, E2E_COMPUTER_LOOKUP);
  });
}

export async function mockCatalogOnlyComputerLookupRoute(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.route("**/api/public/computer-lookup", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await fulfillComputerLookup(route, E2E_CATALOG_ONLY_LOOKUP);
  });
}

export async function mockNoMatchComputerLookupRoute(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.route("**/api/public/computer-lookup", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await fulfillComputerLookup(route, E2E_NO_MATCH_LOOKUP);
  });
}
