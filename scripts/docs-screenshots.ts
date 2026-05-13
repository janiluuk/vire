/**
 * Capture full-page screenshots for docs/ (public + admin).
 *
 * Requires a running app (default http://127.0.0.1:1337):
 *   npm run dev
 *   # or standalone after build + migrate + seed
 *
 *   DOCS_SCREENSHOT_BASE_URL=http://127.0.0.1:1337 \
 *   ADMIN_EMAIL=admin@vire.fi ADMIN_PASSWORD=changeme \
 *   npx tsx scripts/docs-screenshots.ts
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "screenshots");

const BASE =
  process.env.DOCS_SCREENSHOT_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:1337";

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? process.env.ADMIN_LOGIN ?? "admin@vire.fi";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "changeme";

const PUBLIC_FI: { rel: string; file: string }[] = [
  { rel: "/fi", file: "public/fi-home.png" },
  { rel: "/fi/tietoa", file: "public/fi-tietoa-hub.png" },
  { rel: "/fi/tietoa/hyodyt", file: "public/fi-tietoa-hyodyt.png" },
  { rel: "/fi/tietoa/linux", file: "public/fi-tietoa-linux.png" },
  { rel: "/fi/tietoa/vakaus", file: "public/fi-tietoa-vakaus.png" },
  { rel: "/fi/tietoa/huolia", file: "public/fi-tietoa-huolia.png" },
  { rel: "/fi/tietoa/sovellukset/windows", file: "public/fi-tietoa-apps-windows.png" },
  { rel: "/fi/tietoa/sovellukset/mac", file: "public/fi-tietoa-apps-mac.png" },
  { rel: "/fi/palvelu", file: "public/fi-palvelu.png" },
  { rel: "/fi/palvelu/b2b", file: "public/fi-palvelu-b2b.png" },
  { rel: "/fi/palvelu/kiitos", file: "public/fi-palvelu-kiitos.png" },
  { rel: "/fi/itse", file: "public/fi-itse.png" },
  { rel: "/fi/itse/kiitos", file: "public/fi-itse-kiitos.png" },
  { rel: "/fi/itse/tarkista-levy", file: "public/fi-itse-guide-example.png" },
  { rel: "/fi/tuki", file: "public/fi-tuki.png" },
  { rel: "/fi/koneet", file: "public/fi-koneet.png" },
  { rel: "/fi/meista", file: "public/fi-meista.png" },
  { rel: "/fi/meista/yhteiso", file: "public/fi-yhteiso.png" },
  { rel: "/fi/sparkki-for-good", file: "public/fi-sparkki-for-good.png" },
  { rel: "/fi/care", file: "public/fi-care.png" },
  { rel: "/fi/care/kiitos", file: "public/fi-care-kiitos.png" },
  { rel: "/fi/tietosuoja", file: "public/fi-tietosuoja.png" },
  { rel: "/fi/tilaus", file: "public/fi-tilaus-lookup.png" },
];

const PUBLIC_EN: { rel: string; file: string }[] = [
  { rel: "/en", file: "public/en-home.png" },
  { rel: "/en/tietoa", file: "public/en-tietoa-hub.png" },
  { rel: "/en/palvelu", file: "public/en-palvelu.png" },
];

const ADMIN_POST_LOGIN: { rel: string; file: string }[] = [
  { rel: "/admin", file: "admin/admin-dashboard.png" },
  { rel: "/admin/orders", file: "admin/admin-orders.png" },
  { rel: "/admin/models", file: "admin/admin-models.png" },
  { rel: "/admin/guides", file: "admin/admin-guides.png" },
  { rel: "/admin/guides/new", file: "admin/admin-guides-new.png" },
  { rel: "/admin/usb-orders", file: "admin/admin-usb-orders.png" },
  { rel: "/admin/care", file: "admin/admin-care.png" },
  { rel: "/admin/ai-testing", file: "admin/admin-ai-testing.png" },
];

async function shot(
  url: string,
  outFile: string,
  opts?: { waitMs?: number },
) {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 },
  });
  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await new Promise((r) => setTimeout(r, opts?.waitMs ?? 800));
    const dest = path.join(OUT, outFile);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await page.screenshot({ path: dest, fullPage: true });
    console.log("wrote", dest);
  } finally {
    await browser.close();
  }
}

async function loginAdmin() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 },
  });
  try {
    await page.goto(`${BASE}/admin/login`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page.locator("#email").fill(ADMIN_EMAIL);
    await page.locator("#password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /Kirjaudu|Sign in/i }).click();
    await page.waitForURL(/\/admin$/, { timeout: 30_000 });
    await page.context().storageState({ path: path.join(OUT, ".admin-state.json") });
  } finally {
    await browser.close();
  }
}

async function shotWithStorage(url: string, outFile: string) {
  const statePath = path.join(OUT, ".admin-state.json");
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    storageState: statePath,
  });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await new Promise((r) => setTimeout(r, 1000));
    const dest = path.join(OUT, outFile);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await page.screenshot({ path: dest, fullPage: true });
    console.log("wrote", dest);
  } finally {
    await browser.close();
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  console.log("Base URL:", BASE);

  for (const { rel, file } of PUBLIC_FI) {
    await shot(`${BASE}${rel}`, file);
  }
  for (const { rel, file } of PUBLIC_EN) {
    await shot(`${BASE}${rel}`, file);
  }

  await shot(`${BASE}/admin/login`, "admin/admin-login.png", { waitMs: 600 });

  try {
    await loginAdmin();
  } catch (e) {
    console.error(
      "Admin login failed — skip authenticated admin shots. Set ADMIN_EMAIL / ADMIN_PASSWORD.",
      e,
    );
    try {
      fs.unlinkSync(path.join(OUT, ".admin-state.json"));
    } catch {
      /* */
    }
    process.exitCode = 1;
    return;
  }

  for (const { rel, file } of ADMIN_POST_LOGIN) {
    await shotWithStorage(`${BASE}${rel}`, file);
  }

  try {
    fs.unlinkSync(path.join(OUT, ".admin-state.json"));
  } catch {
    /* */
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
