import type { KbNote } from "@/content/types";

export const pwGetByTestId: KbNote = {
  id: "pw-get-by-test-id",
  slug: "pw-get-by-test-id",
  category: "playwright",
  title: "getByTestId() and testIdAttribute",
  summary:
    "Locate elements by a dedicated test attribute (`data-testid` by default). A stable contract between developers and testers when no good user-facing locator exists.",
  tech: ["playwright", "typescript"],
  difficulty: "beginner",
  tags: ["locators", "data-testid", "configuration", "selectors"],
  prerequisites: ["Locators overview", "HTML data attributes"],
  explanation: [
    {
      kind: "paragraph",
      text: "`page.getByTestId('cart-count')` finds `<span data-testid=\"cart-count\">`. Test ids are invisible to users and do not change when copy, styling or layout changes, which makes them very stable. The downside: they do not verify what the user sees, so combine them with text assertions.",
    },
    {
      kind: "paragraph",
      text: "If your app uses a different attribute (for example `data-test` or `data-qa`), set `testIdAttribute` in `playwright.config.ts` under `use`. All `getByTestId` calls then use that attribute.",
    },
    {
      kind: "list",
      items: [
        "Good test ids describe **what** the element is: `product-price`, `cart-row`, `checkout-submit`.",
        "Avoid ids that encode position or style: `third-button`, `red-banner`.",
        "Repeated components share an id (`product-card`); identify a specific one by filtering on text.",
      ],
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "ts",
      title: "playwright.config.ts",
      code: "import { defineConfig } from '@playwright/test';\n\nexport default defineConfig({\n  use: {\n    testIdAttribute: 'data-test',\n  },\n});",
    },
    {
      kind: "code",
      language: "ts",
      title: "Usage",
      code: "page.getByTestId('cart-count');\npage.getByTestId(/^product-card-/);\npage.getByTestId('cart-row').filter({ hasText: 'Wool Socks' }).getByTestId('qty-increase');\n\n// Alternative to config (rarely needed):\nimport { selectors } from '@playwright/test';\nselectors.setTestIdAttribute('data-qa');",
    },
  ],
  code: {
    title: "tests/cart-badge.spec.ts",
    language: "ts",
    code: `import { test, expect } from '@playwright/test';

test('cart badge updates when quantity changes', async ({ page }) => {
  await page.goto('/products/wool-socks');
  await page.getByTestId('add-to-cart').click();
  await expect(page.getByTestId('cart-count')).toHaveText('1');

  await page.goto('/cart');
  const row = page.getByTestId('cart-row').filter({ hasText: 'Wool Socks' });

  await row.getByTestId('qty-increase').click();
  await expect(row.getByTestId('qty-input')).toHaveValue('2');
  await expect(page.getByTestId('cart-count')).toHaveText('2');
  await expect(row.getByTestId('line-total')).toHaveText('$24.00');
});
`,
  },
  walkthrough: [
    { line: "await page.getByTestId('add-to-cart').click();", explanation: "Test id is stable even if the button label changes to 'Add to bag' during a copy update." },
    { line: "const row = page.getByTestId('cart-row').filter({ hasText: 'Wool Socks' });", explanation: "All rows share the same test id; filtering by visible text selects the right one." },
    { line: "await expect(row.getByTestId('qty-input')).toHaveValue('2');", explanation: "Input values are asserted with `toHaveValue`, not `toHaveText`." },
    { line: "await expect(row.getByTestId('line-total')).toHaveText('$24.00');", explanation: "Pair test ids with assertions on the user-visible value." },
  ],
  whenToUse: [
    "Dynamic or non-semantic elements: price labels, badges, product cards, chart containers.",
    "Apps with heavy localization where text changes per locale.",
    "Elements whose accessible name is unstable or missing and cannot be fixed right now.",
  ],
  mistakes: [
    "Changing `testIdAttribute` in one test file instead of the config: other files still use the default `data-testid`.",
    "Generating test ids from database ids (`product-card-8f3a…`): they differ per environment. Use semantic ids plus text filters.",
    "Using test ids for everything, even buttons with clear labels: you miss accessibility regressions that `getByRole` would catch.",
  ],
  debugging: [
    "If nothing matches, confirm the attribute name in the DOM equals `testIdAttribute` (e.g. `data-test` vs `data-testid`).",
    "Some build setups strip `data-testid` in production builds (e.g. babel plugins). Check which build your tests hit.",
    "Use `npx playwright codegen`: if test ids exist, it suggests `getByTestId` for elements without good roles.",
  ],
  relatedNotes: ["pw-locators", "pw-get-by-role", "pw-get-by-text"],
  relatedLessons: ["dom-selecting-elements"],
  practice:
    "Change your project's `testIdAttribute` to `data-test`, update one component, and write a test that asserts a product card's price and stock badge using `getByTestId` plus `filter({ hasText })`.",
  docs: [
    { title: "Playwright: Locate by test id", url: "https://playwright.dev/docs/locators#locate-by-test-id" },
    { title: "Playwright: Test use options (testIdAttribute)", url: "https://playwright.dev/docs/test-use-options" },
    { title: "Playwright API: page.getByTestId", url: "https://playwright.dev/docs/api/class-page#page-get-by-test-id" },
  ],
  versionNote: "Playwright 1.27+; `testIdAttribute` config option 1.27+",
};
