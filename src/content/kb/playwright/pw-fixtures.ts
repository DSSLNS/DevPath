import type { KbNote } from "@/content/types";

export const pwFixtures: KbNote = {
  id: "pw-fixtures",
  slug: "pw-fixtures",
  category: "playwright",
  title: "Fixtures: Built-in and Custom (test.extend)",
  summary:
    "Fixtures provide each test with exactly the setup it needs (pages, logged-in users, page objects, test data) and clean up automatically afterwards.",
  tech: ["playwright", "typescript"],
  difficulty: "intermediate",
  tags: ["fixtures", "test.extend", "page objects", "setup", "teardown"],
  prerequisites: ["Playwright fundamentals", "TypeScript generics basics", "Object destructuring"],
  explanation: [
    {
      kind: "paragraph",
      text: "A fixture is requested by name in the test signature: `async ({ page, request }) => {}`. Playwright creates only the fixtures a test asks for, runs their setup before the test, and their teardown after it, even if the test fails.",
    },
    {
      kind: "table",
      caption: "Built-in fixtures",
      headers: ["Fixture", "Scope", "What it is"],
      rows: [
        ["`page`", "test", "Isolated page in a fresh context"],
        ["`context`", "test", "The BrowserContext of `page`"],
        ["`browser`", "worker", "Shared browser instance"],
        ["`browserName`", "worker", "'chromium', 'firefox' or 'webkit'"],
        ["`request`", "test", "APIRequestContext for HTTP calls"],
      ],
    },
    {
      kind: "paragraph",
      text: "`test.extend<T>()` defines **custom fixtures**. Inside a fixture, code before `await use(value)` is setup, code after is teardown. Fixtures can depend on other fixtures, can be `worker`-scoped (shared by all tests in a worker) and can be `auto: true` (run for every test).",
    },
    {
      kind: "callout",
      tone: "tip",
      text: "Export your extended `test` and `expect` from one file (e.g. `tests/fixtures.ts`) and import them in specs instead of `@playwright/test`.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "ts",
      code: "import { test as base } from '@playwright/test';\n\ntype Fixtures = { cartPage: CartPage };\ntype WorkerFixtures = { apiToken: string };\n\nexport const test = base.extend<Fixtures, WorkerFixtures>({\n  cartPage: async ({ page }, use) => {\n    const cartPage = new CartPage(page);   // setup\n    await use(cartPage);                    // test runs here\n    // teardown (optional)\n  },\n  apiToken: [async ({}, use) => {\n    await use(process.env.API_TOKEN ?? 'test_token_123');\n  }, { scope: 'worker' }],\n});",
    },
  ],
  code: {
    title: "tests/fixtures.ts + tests/cart.spec.ts",
    language: "ts",
    code: `// tests/fixtures.ts
import { test as base, expect, type Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}
  async open() {
    await this.page.goto('/cart');
  }
  row(name: string) {
    return this.page.getByTestId('cart-row').filter({ hasText: name });
  }
}

type ShopFixtures = {
  cartPage: CartPage;
  seededProduct: { sku: string; name: string };
};

export const test = base.extend<ShopFixtures>({
  seededProduct: async ({ request }, use) => {
    const res = await request.post('/api/test/products', {
      data: { name: 'Fixture Socks', price: 1200, stock: 5 },
    });
    expect(res.ok()).toBeTruthy();
    const product = await res.json();

    await use({ sku: product.sku, name: product.name });

    await request.delete('/api/test/products/' + product.sku);
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});
export { expect };

// tests/cart.spec.ts
import { test, expect } from './fixtures';

test('a seeded product can be added to the cart', async ({ page, seededProduct, cartPage }) => {
  await page.goto('/products/' + seededProduct.sku);
  await page.getByRole('button', { name: 'Add to cart' }).click();

  await cartPage.open();
  await expect(cartPage.row(seededProduct.name)).toBeVisible();
});
`,
  },
  walkthrough: [
    { line: "export const test = base.extend<ShopFixtures>({", explanation: "Creates a new `test` function that knows about our extra fixtures, with full type safety." },
    { line: "seededProduct: async ({ request }, use) => {", explanation: "A fixture can use other fixtures; here the built-in `request` creates data through a test-only API." },
    { line: "await use({ sku: product.sku, name: product.name });", explanation: "Hands the value to the test and pauses here until the test finishes." },
    { line: "await request.delete('/api/test/products/' + product.sku);", explanation: "Teardown runs after the test, even on failure, keeping the environment clean." },
    { line: "async ({ page, seededProduct, cartPage }) => {", explanation: "The test simply asks for what it needs; unused fixtures are never created." },
  ],
  whenToUse: [
    "Reusable setup: logged-in pages, seeded products/orders, page objects, feature-flag overrides.",
    "Anything that needs guaranteed cleanup.",
    "Expensive shared resources (an auth token, a DB connection) as `worker`-scoped fixtures.",
  ],
  mistakes: [
    "Forgetting to call `await use(...)`: the test never starts and times out.",
    "Doing setup in `beforeEach` in every file instead of one reusable fixture.",
    "Using worker-scoped fixtures for mutable data that tests change, causing cross-test interference.",
    "Importing `test` from `@playwright/test` in a spec that needs custom fixtures: TypeScript will report unknown properties.",
  ],
  debugging: [
    "Fixture setup/teardown steps appear in the HTML report and trace under 'Before Hooks' / 'After Hooks'.",
    "If teardown fails, the test is marked failed even when the body passed; read the error location.",
    "Use `{ auto: true }` fixtures to attach logs (e.g. console messages) for every test.",
  ],
  relatedNotes: ["pw-hooks-auth", "pw-api-testing", "pw-browser-context-page"],
  relatedLessons: ["typescript-generics", "advanced-classes", "functions-callbacks", "objects-destructuring"],
  practice:
    "Create a `loggedInPage` fixture that logs in through the API, sets the session cookie on `context`, and yields `page`. Use it in two tests.",
  docs: [
    { title: "Playwright: Fixtures", url: "https://playwright.dev/docs/test-fixtures" },
    { title: "Playwright: Page object models", url: "https://playwright.dev/docs/pom" },
  ],
  versionNote: "Playwright 1.40+",
};
