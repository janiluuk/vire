import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

/** Critical paths called out in ROADMAP.md (FI locale, home + service). */
const PATHS = ["/fi"] as const;

for (const path of PATHS) {
  test.describe(`axe-core (${path})`, () => {
    test("no critical or serious accessibility violations", async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();

      const severe = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );

      expect(
        severe,
        severe.length > 0
          ? `${severe.map((v) => `${v.id}: ${v.help}`).join("\n")}`
          : undefined,
      ).toEqual([]);
    });
  });
}
