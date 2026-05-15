import { expect, test } from "@playwright/test";

test.describe("design-system UX flows", () => {
  test("service page exposes the guided flow, migration FAQ, and business branch", async ({
    page,
  }) => {
    await page.goto("/fi/palvelu", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: /^Palvelu$/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /Miten tämä toimii/i }),
    ).toBeVisible();
    await expect(page.getByText(/Tarkistetaan kone ensin/i)).toBeVisible();
    await expect(page.getByText(/Takaisin valmiina käyttöön/i)).toBeVisible();

    await page.getByText(/Mitä siirretään\?/i).click();
    await expect(
      page.getByText(/Tiedostot, kuvat, kirjanmerkit ja sähköpostitilin asetukset/i),
    ).toBeVisible();

    await page.getByRole("link", { name: /Pyydä tarjous/i }).click();
    await expect(page).toHaveURL(/\/fi\/palvelu\/b2b$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Yritykset|yritys/i }),
    ).toBeVisible();
  });

  test("care page supports the subscription path and routes to support", async ({
    page,
  }) => {
    await page.goto("/fi/care", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: /Sparkki Care/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /Mitä Care muuttaa/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /Muistutuspolku 90 päivän jälkeen/i }),
    ).toBeVisible();

    const emailField = page.getByLabel(/Sähköposti \(laskutus\)/i);
    const submitButton = page.getByRole("button", { name: /Siirry maksamaan/i });
    await expect(emailField).toBeVisible();
    await expect(submitButton).toBeDisabled();

    await emailField.fill("maija@example.com");
    await expect(submitButton).toBeEnabled();

    await page.getByRole("link", { name: /Kysy Caresta tuesta/i }).click();
    await expect(page).toHaveURL(/\/fi\/tuki$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Tuki|Support/i }),
    ).toBeVisible();
  });

  test("common concerns flow reveals answers and post-delivery reassurance", async ({
    page,
  }) => {
    await page.goto("/fi/tietoa/huolia", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 2, name: /Yleisiä huolia/i }),
    ).toBeVisible();

    await page.getByText(/Menetänkö tiedostoni\?/i).click();
    await expect(
      page.getByText(/Ennen asennusta varmuuskopioimme tai siirrämme tärkeät tiedot/i),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        level: 3,
        name: /Et jää yksin koneen kanssa/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(/Sisältyvä tuki kattaa ensimmäiset askeleet toimituksen jälkeen/i),
    ).toBeVisible();
  });
});
