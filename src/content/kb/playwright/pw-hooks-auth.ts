import type { KbNote } from "@/content/types";

export const pwHooksAuth: KbNote = {
  id: "pw-hooks-auth",
  slug: "pw-hooks-auth",
  category: "playwright",
  title: "Hooks and Authentication with storageState",
  summary:
    "Use beforeEach/afterEach/beforeAll/afterAll for shared steps, and log in once in a setup project that saves storageState so tests start already authenticated.",
  tech: ["playwright", "typescript"],
  difficulty: "intermediate",
  tags: ["hooks", "beforeEach", "afterAll", "authentication", "storageState", "setup project"],
  prerequisites: ["Fixtures", "Cookies and localStorage", "Authentication concepts"],
  explanation: [
    {
      kind: "table",
      headers: ["Hook", "Runs", "Typical use"],
      rows: [
        ["`test.beforeEach`", "Before each test in scope", "Navigate to a start page, reset state"],
        ["`test.afterEach`", "After each test", "Attach extra evidence, clean up"],
        ["`test.beforeAll`", "Once per worker, before tests in the file/describe", "Expensive read-only setup"],
        ["`test.afterAll`", "Once per worker, after tests", "Delete data created in beforeAll"],
      ],
    },
    {
      kind: "paragraph",
      text: "Logging in through the UI before every test is slow and repeats the same steps. Playwright's recommended pattern is a **setup project**: a special test that logs in once and saves the browser's cookies and localStorage to a JSON file with `storageState`. Other projects depend on it and load that file, so every test starts logged in.",
    },
    {
      kind: "callout",
      tone: "danger",
      title: "Never commit auth files",
      text: "`playwright/.auth/*.json` contains real session cookies. Add `playwright/.auth` to `.gitignore`, and read test credentials from environment variables, never from source code.",
    },
    {
      kind: "diagram",
      title: "Setup project flow",
      variant: "flow",
      steps: [
        { label: "setup project", detail: "auth.setup.ts logs in via UI or API" },
        { label: "storageState saved", detail: "playwright/.auth/user.json" },
        { label: "chromium/firefox projects", detail: "dependencies: ['setup'], use.storageState" },
        { label: "Tests", detail: "Start authenticated in a fresh context" },
      ],
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "ts",
      title: "Hooks",
      code: "test.beforeEach(async ({ page }) => {\n  await page.goto('/account');\n});\n\ntest.afterAll(async ({ request }) => {\n  await request.delete('/api/test/orders?tag=e2e');\n});",
    },
    {
      kind: "code",
      language: "ts",
      title: "Opt out of auth for one file",
      code: "test.use({ storageState: { cookies: [], origins: [] } });",
    },
  ],
  code: {
    title: "tests/auth.setup.ts + playwright.config.ts + tests/account.spec.ts",
    language: "ts",
    code: `// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate as shopper', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_USER_EMAIL ?? 'shopper@example.test');
  await page.getByLabel('Password').fill(process.env.E2E_USER_PASSWORD ?? 'Test-Password-123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('button', { name: 'My account' })).toBeVisible();

  await page.context().storageState({ path: authFile });
});

// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  use: { baseURL: 'http://localhost:3000' },
  projects: [
    { name: 'setup', testMatch: /.*\\.setup\\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});

// tests/account.spec.ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/account/orders');
});

test('logged-in shopper sees order history', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Your orders' })).toBeVisible();
});
`,
  },
  walkthrough: [
    { line: "await page.getByLabel('Email').fill(process.env.E2E_USER_EMAIL ?? 'shopper@example.test');", explanation: "Credentials come from env vars (CI secrets); the fallback is a fake test account." },
    { line: "await expect(page.getByRole('button', { name: 'My account' })).toBeVisible();", explanation: "Wait until login has really completed before saving state, otherwise cookies may be missing." },
    { line: "await page.context().storageState({ path: authFile });", explanation: "Writes cookies and localStorage of the context to a JSON file." },
    { line: "dependencies: ['setup'],", explanation: "The chromium project runs only after the setup project succeeds." },
    { line: "use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },", explanation: "Every test context in this project is created from the saved state, so it is logged in." },
  ],
  whenToUse: [
    "Most suites where the majority of tests need a logged-in user.",
    "Multiple roles: save `admin.json` and `user.json` in setup and choose per file with `test.use({ storageState })`.",
    "Hooks for short, file-local steps; fixtures for reusable setup across files.",
  ],
  mistakes: [
    "Logging in through the UI in every `beforeEach`, multiplying test time.",
    "Sharing one account across parallel tests that mutate server-side state (e.g. the same cart): use one account per worker or per test.",
    "Committing `.auth` JSON files or hard-coding real passwords.",
    "Using `beforeAll` with the `page` fixture: `page` is test-scoped; in `beforeAll` create a page from `browser` if needed.",
  ],
  debugging: [
    "If tests land on the login page, open the saved JSON: are the cookies for the right domain, and are they expired?",
    "Run only the setup project with `npx playwright test --project=setup --headed` to watch the login.",
    "If the app stores tokens in sessionStorage, storageState does not save it; restore it with `context.addInitScript`.",
  ],
  relatedNotes: ["pw-fixtures", "pw-browser-context-page"],
  relatedLessons: ["networking-authentication", "dom-cookies", "dom-local-session-storage", "tooling-environment-variables"],
  practice:
    "Add an `admin.setup.ts` that saves `playwright/.auth/admin.json`, then write one spec that uses `test.use({ storageState: 'playwright/.auth/admin.json' })` to visit an admin-only page.",
  docs: [
    { title: "Playwright: Authentication", url: "https://playwright.dev/docs/auth" },
    { title: "Playwright API: test hooks", url: "https://playwright.dev/docs/api/class-test#test-before-each" },
    { title: "Playwright: Project dependencies", url: "https://playwright.dev/docs/test-projects#dependencies" },
  ],
  versionNote: "Playwright 1.31+ (project dependencies); examples written for 1.40+",
};
