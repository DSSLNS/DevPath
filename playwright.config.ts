import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, testIgnore: /mobile\.spec/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec/ },
  ],
  webServer: {
    // Run against the production build: `npm run build` first. Uses a throwaway SQLite database.
    command: `rm -f .data/e2e.db* .data/e2e-mail.log && npm run db:migrate && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    env: {
      SQLITE_PATH: ".data/e2e.db",
      BETTER_AUTH_SECRET: "e2e-only-secret-not-for-production-0123456789",
      BETTER_AUTH_URL: `http://localhost:${PORT}`,
      DEVPATH_EMAIL_LOG: ".data/e2e-mail.log",
      DEVPATH_RATE_LIMIT: "off",
    },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
