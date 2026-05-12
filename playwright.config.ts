import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const standaloneDir = path.join(__dirname, ".next/standalone");

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node server.js",
    cwd: standaloneDir,
    url: "http://127.0.0.1:3000/fi",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      PORT: "3000",
      HOSTNAME: "127.0.0.1",
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://postgres:password@localhost:5432/verso",
      NEXTAUTH_SECRET:
        process.env.NEXTAUTH_SECRET ??
        "playwright-e2e-secret-playwright-e2e-secret",
      NEXTAUTH_URL: "http://127.0.0.1:3000",
      NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000",
    },
  },
});
