import type { KbNote } from "@/content/types";

export const e2eTestEnvironments: KbNote = {
  id: "e2e-test-environments",
  slug: "e2e-test-environments",
  category: "fundamentals",
  title: "Test Environments and Configuration",
  summary:
    "Local, CI, preview, staging and production each serve a different purpose. Configure base URLs, credentials and feature flags per environment without editing test code.",
  tech: ["cypress", "playwright", "node"],
  difficulty: "intermediate",
  tags: ["environments", "configuration", "baseUrl", "env variables", "CI"],
  prerequisites: ["Environment variables in Node.js", "Running tests from the command line"],
  explanation: [
    {
      kind: "paragraph",
      text: "A **test environment** is a deployed copy of the system (frontend, APIs, database, third-party sandboxes) that tests run against. The same test file should run against any environment; only **configuration** changes: the base URL, credentials, feature flags and which tests are allowed to run.",
    },
    {
      kind: "table",
      caption: "Typical environments",
      headers: ["Environment", "Purpose", "Data", "What to run"],
      rows: [
        ["Local", "Developer feedback", "Local DB, seeded", "Specs you are working on"],
        ["CI (ephemeral)", "Gate every pull request", "Fresh containers per run", "Full or sharded suite"],
        ["Preview / review app", "Test a branch deployment", "Seeded or shared staging data", "Smoke + changed areas"],
        ["Staging", "Production-like integration", "Shared, long-lived", "Regression, third-party sandboxes"],
        ["Production", "Monitor real system", "Real data", "Read-only smoke checks only"],
      ],
    },
    {
      kind: "list",
      items: [
        "Use `baseUrl` (Cypress) / `use.baseURL` (Playwright) so tests call `cy.visit('/cart')` / `page.goto('/cart')` with relative paths.",
        "Read environment-specific values from `process.env` in the config; pass secrets from your CI secret store.",
        "Use payment, email and SMS providers' **sandbox/test modes** in non-production environments.",
        "Tag destructive tests and never run them against production.",
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Environment drift",
      text: "If tests pass on staging but fail on preview, compare configuration first: feature flags, seed data, API versions and third-party keys are the usual differences.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "cypress.config.js",
      code: `const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL || "http://localhost:3000",
  },
  env: { apiUrl: process.env.API_URL },
});`,
    },
    {
      kind: "code",
      language: "bash",
      title: "Select an environment at run time",
      code: `BASE_URL=https://staging.example.test npx playwright test
CYPRESS_BASE_URL=https://staging.example.test npx cypress run`,
    },
  ],
  code: {
    title: "playwright.config.ts driven by environment variables",
    language: "ts",
    code: `import { defineConfig, devices } from "@playwright/test";

const ENV = process.env.TEST_ENV ?? "local";

const baseURLs: Record<string, string> = {
  local: "http://localhost:3000",
  staging: "https://staging.example.test",
  production: "https://www.example.test",
};

export default defineConfig({
  testDir: "./tests",
  retries: process.env.CI ? 2 : 0,
  // Never run tests tagged @destructive against production
  grepInvert: ENV === "production" ? /@destructive/ : undefined,
  use: {
    baseURL: process.env.BASE_URL ?? baseURLs[ENV],
    trace: "on-first-retry",
    extraHTTPHeaders: process.env.API_TOKEN ? { Authorization: "Bearer " + process.env.API_TOKEN } : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Start the app automatically only for local runs
  webServer: ENV === "local" ? { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: !process.env.CI } : undefined,
});`,
  },
  walkthrough: [
    { line: 'const ENV = process.env.TEST_ENV ?? "local";', explanation: "One variable selects the environment; defaulting to local keeps developer runs simple." },
    { line: "grepInvert: ENV === \"production\" ? /@destructive/ : undefined,", explanation: "Tests tagged `@destructive` are excluded automatically when targeting production." },
    { line: "baseURL: process.env.BASE_URL ?? baseURLs[ENV],", explanation: "An explicit `BASE_URL` (e.g. a preview deployment URL from CI) overrides the default for that environment." },
    { line: 'webServer: ENV === "local" ? { command: "npm run dev", ... } : undefined,', explanation: "Playwright can start the dev server for local runs; remote environments are already deployed." },
  ],
  whenToUse: [
    "Whenever the same suite must run locally, in CI and against deployed environments.",
    "When a preview deployment per pull request should be tested before merge.",
    "When you need a small production smoke suite that must be strictly read-only.",
  ],
  mistakes: [
    "Hard-coding `https://staging...` URLs inside specs, so switching environments means editing many files.",
    "Committing real credentials in `cypress.env.json` or config files instead of using CI secrets.",
    "Running write-heavy regression suites against production or a staging environment shared with manual testers.",
  ],
  debugging: [
    "Print the resolved config at the start of the run (base URL, env name, never secrets) so logs show where tests ran.",
    "If every test fails at the first navigation, check the base URL, VPN/firewall access and authentication walls on the environment.",
    "Compare feature flag values between the environment where the test passes and where it fails.",
  ],
  relatedNotes: ["e2e-test-data-management", "e2e-flaky-tests"],
  relatedLessons: ["tooling-environment-variables", "tooling-nodejs-basics", "networking-url-query-params", "operators-nullish-coalescing"],
  practice:
    "Add a `TEST_ENV` variable to a Cypress or Playwright config that switches between a local and a staging base URL, and make one smoke test run against both by only changing the command line.",
  docs: [
    { title: "Playwright: Test configuration", url: "https://playwright.dev/docs/test-configuration" },
    { title: "Playwright: Web server", url: "https://playwright.dev/docs/test-webserver" },
    { title: "Cypress: Environment variables", url: "https://docs.cypress.io/app/references/environment-variables" },
    { title: "Cypress: Configuration", url: "https://docs.cypress.io/app/references/configuration" },
  ],
  versionNote: "Playwright 1.40+, Cypress 13+.",
};
