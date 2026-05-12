import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const standaloneDir = path.join(__dirname, ".next/standalone");

function nonEmptyEnv(name: string, fallback: string): string {
  const v = process.env[name];
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return fallback;
}

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:1337",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node server.js",
    cwd: standaloneDir,
    url: "http://127.0.0.1:1337/fi",
    reuseExistingServer: !!process.env.PLAYWRIGHT_REUSE_SERVER,
    timeout: 120_000,
    env: {
      ...process.env,
      PORT: "1337",
      HOSTNAME: "127.0.0.1",
      DATABASE_URL: nonEmptyEnv(
        "DATABASE_URL",
        "postgresql://postgres:password@127.0.0.1:5432/vire",
      ),
      NEXTAUTH_SECRET: nonEmptyEnv(
        "NEXTAUTH_SECRET",
        "playwright-e2e-secret-playwright-e2e-secret",
      ),
      NEXTAUTH_URL: "http://127.0.0.1:1337",
      NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:1337",
    },
  },
});
