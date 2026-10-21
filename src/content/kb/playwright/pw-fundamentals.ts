import type { KbNote } from "@/content/types";

export const pwFundamentals: KbNote = {
  id: "pw-fundamentals",
  slug: "pw-fundamentals",
  category: "playwright",
  title: "Playwright Fundamentals: @playwright/test, test() and expect()",
  summary:
    "Playwright Test is a full test runner: it launches browsers, gives each test an isolated page, retries web-first assertions and produces HTML reports and traces.",
  tech: ["playwright", "typescript"],
  difficulty: "beginner",
  tags: ["setup", "test runner", "test", "expect", "playwright.config"],
  prerequisites: [
    "Comfortable with `async`/`await` and Promises",
    "Node.js 18+ and npm installed",
    "Basic idea of what an E2E test is",
  ],
  explanation: [
    {
      kind: "paragraph",
      text: "`@playwright/test` is the official test runner for Playwright. It bundles everything you need: a `test` function to declare tests, an `expect` function with **web-first assertions**, fixtures such as `page`, parallel workers, retries, reporters and a config file (`playwright.config.ts`). You do not need Jest or Mocha.",
    },
    {
      kind: "paragraph",
      text: "Every test receives fixtures through its first argument. The most common is `page`: a fresh browser tab inside a brand-new **browser context** (think: a clean incognito profile). Because each test gets its own context, tests do not share cookies or localStorage and can run in parallel safely.",
    },
    {
      kind: "terms",
      items: [
        { term: "test runner", definition: "The program that finds test files, runs them, and reports pass/fail. Here: `npx playwright test`." },
        { term: "fixture", definition: "A value prepared for a test and torn down after it, injected by name, e.g. `{ page }`." },
        { term: "web-first assertion", definition: "An `expect` on a locator or page that keeps retrying until it passes or times out (default 5 s)." },
        { term: "baseURL", definition: "A config option so `page.goto('/cart')` resolves against your app's origin." },
      ],
    },
    {
      kind: "diagram",
      title: "What happens when you run npx playwright test",
      variant: "flow",
      steps: [
        { label: "Load config", detail: "playwright.config.ts: testDir, projects, use options" },
        { label: "Spawn workers", detail: "Separate Node processes run test files in parallel" },
        { label: "Create fixtures", detail: "browser, then a new context and page per test" },
        { label: "Run test body", detail: "Actions auto-wait; assertions auto-retry" },
        { label: "Report", detail: "List/HTML reporter, traces and screenshots on failure" },
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: "Start with the scaffold",
      text: "`npm init playwright@latest` creates `playwright.config.ts`, an example test and an optional GitHub Actions workflow, and installs browsers.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "bash",
      title: "Install and run",
      code: "npm init playwright@latest        # scaffold config + example tests\nnpx playwright install            # download browsers\nnpx playwright test               # run all tests headless\nnpx playwright test --ui          # interactive UI mode\nnpx playwright test cart.spec.ts --headed --project=chromium\nnpx playwright show-report        # open the last HTML report",
    },
    {
      kind: "code",
      language: "ts",
      title: "Test anatomy",
      code: "import { test, expect } from '@playwright/test';\n\ntest.describe('group name', () => {\n  test('does something', async ({ page }) => {\n    await page.goto('/');\n    await expect(page).toHaveTitle(/Shop/);\n  });\n});",
    },
    {
      kind: "code",
      language: "ts",
      title: "Minimal playwright.config.ts",
      code: "import { defineConfig } from '@playwright/test';\n\nexport default defineConfig({\n  testDir: './tests',\n  retries: process.env.CI ? 2 : 0,\n  use: {\n    baseURL: 'http://localhost:3000',\n    trace: 'on-first-retry',\n  },\n});",
    },
  ],
  code: {
    title: "tests/home.spec.ts",
    language: "ts",
    code: `import { test, expect } from '@playwright/test';

test.describe('home page', () => {
  test('shows the store name and featured products', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Acme Store/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome to Acme Store');

    const featured = page.getByTestId('featured-product');
    await expect(featured).toHaveCount(4);
  });

  test('navigates to the cart', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page).toHaveURL(/\\/cart$/);
  });
});
`,
  },
  walkthrough: [
    { line: "import { test, expect } from '@playwright/test';", explanation: "Both helpers come from the test runner package, not from `playwright` (the library)." },
    { line: "test('shows the store name and featured products', async ({ page }) => {", explanation: "The callback is async and destructures the `page` fixture. Each test gets a fresh context and page." },
    { line: "await page.goto('/');", explanation: "Relative URL resolved against `use.baseURL` in the config. `goto` waits for the `load` event by default." },
    { line: "await expect(page).toHaveTitle(/Acme Store/);", explanation: "A web-first assertion: it retries until the title matches or the expect timeout (5 s) expires." },
    { line: "await expect(featured).toHaveCount(4);", explanation: "Asserts on how many elements a locator matches, retrying while products render." },
  ],
  whenToUse: [
    "Any new browser E2E suite in JavaScript/TypeScript where you want cross-browser coverage (Chromium, Firefox, WebKit).",
    "When you need parallelism, retries, traces and HTML reports out of the box without wiring several libraries together.",
    "When you also want API tests in the same runner (the `request` fixture).",
  ],
  mistakes: [
    "Forgetting `await` before actions or `expect(locator)` calls: the test races ahead and fails randomly or passes falsely. Enable the `@typescript-eslint/no-floating-promises` lint rule.",
    "Importing `expect` from Jest or another library: you lose web-first auto-retrying assertions.",
    "Hard-coding full URLs everywhere instead of setting `baseURL` once in the config.",
    "Sharing state between tests through module-level variables: tests run in parallel workers and in any order.",
  ],
  debugging: [
    "Run `npx playwright test --ui` to step through actions with a live DOM snapshot for every step.",
    "Run `npx playwright test --debug` to open the Playwright Inspector and pause before each action; add `await page.pause()` to stop at a specific line.",
    "Open `npx playwright show-report` and look at the error, the attached screenshot and the trace for the failed test.",
  ],
  relatedNotes: ["pw-browser-context-page", "pw-locators", "pw-assertions", "pw-auto-waiting"],
  relatedLessons: ["async-async-await", "async-promises", "tooling-npm", "tooling-package-json"],
  practice:
    "Scaffold a project with `npm init playwright@latest`, set `baseURL` to a local app, and write two tests: one that asserts the page title and one that clicks a navigation link and asserts the new URL with `toHaveURL`.",
  docs: [
    { title: "Playwright: Installation", url: "https://playwright.dev/docs/intro" },
    { title: "Playwright: Writing tests", url: "https://playwright.dev/docs/writing-tests" },
    { title: "Playwright: Test configuration", url: "https://playwright.dev/docs/test-configuration" },
  ],
  versionNote: "Playwright 1.40+",
};
