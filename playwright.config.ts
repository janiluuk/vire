import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const standaloneDir = path.join(__dirname, ".next/standalone");

function nonEmptyEnv(name: string, fallback: string): string {
  const v = process.env[name];
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return fallback;
}

const webPort = process.env.PLAYWRIGHT_WEB_PORT?.trim() || "1337";
const webOrigin = `http://127.0.0.1:${webPort}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? webOrigin,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Align DB schema with Prisma client (avoids admin/runtime 500s when migrations lag).
    command: `sh -c 'npx prisma migrate deploy && npx prisma db seed && cd "${standaloneDir}" && exec node server.js'`,
    cwd: __dirname,
    url: `${webOrigin}/fi`,
    // In CI, Lighthouse (or a flaky teardown) may leave :1337 bound; reuse avoids a hard
    // failure. Locally default false so `next dev` on 1337 is not mistaken for standalone.
    reuseExistingServer:
      process.env.CI === "true" || !!process.env.PLAYWRIGHT_REUSE_SERVER,
    timeout: 120_000,
    env: {
      ...process.env,
      PORT: webPort,
      HOSTNAME: "127.0.0.1",
      DATABASE_URL: nonEmptyEnv(
        "DATABASE_URL",
        "postgresql://postgres:password@127.0.0.1:5432/sparkki",
      ),
      NEXTAUTH_SECRET: nonEmptyEnv(
        "NEXTAUTH_SECRET",
        "playwright-e2e-secret-playwright-e2e-secret",
      ),
      NEXTAUTH_URL: webOrigin,
      NEXT_PUBLIC_SITE_URL: webOrigin,
      /** Persist orders in DB during Playwright wizard flows (no Stripe). */
      CHECKOUT_E2E_BYPASS: "true",
    },
  },
});
