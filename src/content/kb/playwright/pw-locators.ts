import type { KbNote } from "@/content/types";

export const pwLocators: KbNote = {
  id: "pw-locators",
  slug: "pw-locators",
  category: "playwright",
  title: "Locators Overview",
  summary:
    "Locators are lazy, auto-waiting, strict descriptions of how to find an element. Prefer user-facing locators (role, label, text) and fall back to test ids.",
  tech: ["playwright", "typescript"],
  difficulty: "beginner",
  tags: ["locators", "selectors", "filter", "chaining", "strictness"],
  prerequisites: ["[Playwright fundamentals](/kb/pw-fundamentals)", "HTML elements and attributes"],
  explanation: [
    {
      kind: "paragraph",
      text: "A **locator** is not an element; it is a recipe. `page.getByRole('button', { name: 'Add to cart' })` does nothing until you act or assert on it. At that moment Playwright queries the DOM fresh, so locators never go stale after re-renders.",
    },
    {
      kind: "paragraph",
      text: "Locators are **strict**: if an action targets a locator that matches more than one element, Playwright throws instead of guessing. Narrow the locator with chaining, `filter()`, or `nth()` when you really mean a position.",
    },
    {
      kind: "table",
      caption: "Recommended priority",
      headers: ["Locator", "Finds by", "Why"],
      rows: [
        ["`getByRole`", "ARIA role + accessible name", "Closest to how users and assistive tech see the page"],
        ["`getByLabel`", "Associated `<label>` / aria-label", "Best for form fields"],
        ["`getByPlaceholder`", "placeholder attribute", "Inputs without labels"],
        ["`getByText`", "Visible text", "Non-interactive content"],
        ["`getByAltText` / `getByTitle`", "alt / title attributes", "Images and icons"],
        ["`getByTestId`", "`data-testid`", "Stable contract when no user-facing hook exists"],
        ["`locator(css)`", "CSS or XPath", "Last resort; brittle against markup changes"],
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      text: "Run `npx playwright codegen http://localhost:3000` and hover elements: it suggests the best locator for each one.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "ts",
      title: "Chaining and filtering",
      code: "const card = page.getByTestId('product-card').filter({ hasText: 'Trail Shoe' });\nawait card.getByRole('button', { name: 'Add to cart' }).click();\n\npage.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Socks' }) });\npage.getByRole('listitem').filter({ hasNotText: 'Out of stock' });\npage.getByTestId('product-card').first();\npage.getByTestId('product-card').nth(2);\npage.getByRole('button', { name: 'Checkout' }).or(page.getByRole('button', { name: 'Sign in to checkout' }));",
    },
    {
      kind: "code",
      language: "ts",
      title: "Reading values from many elements",
      code: "const names = await page.getByTestId('product-name').allTextContents();\nconst count = await page.getByTestId('product-card').count();",
    },
  ],
  code: {
    title: "tests/plp-locators.spec.ts",
    language: "ts",
    code: `import { test, expect } from '@playwright/test';

test('adds a specific product from the listing to the cart', async ({ page }) => {
  await page.goto('/category/shoes');

  const productCard = page
    .getByTestId('product-card')
    .filter({ has: page.getByRole('heading', { name: 'Trail Runner 2' }) });

  await expect(productCard).toHaveCount(1);
  await expect(productCard.getByTestId('product-price')).toHaveText('$89.00');

  await productCard.getByRole('button', { name: 'Add to cart' }).click();

  await expect(page.getByTestId('cart-count')).toHaveText('1');
});
`,
  },
  walkthrough: [
    { line: ".getByTestId('product-card')", explanation: "Starts broad: every product card on the page (could be 24)." },
    { line: ".filter({ has: page.getByRole('heading', { name: 'Trail Runner 2' }) });", explanation: "Keeps only cards that contain a heading with that accessible name, making the locator unique." },
    { line: "await expect(productCard).toHaveCount(1);", explanation: "Guards against an ambiguous locator before acting; also documents intent." },
    { line: "await productCard.getByRole('button', { name: 'Add to cart' }).click();", explanation: "Chaining scopes the search to inside the card, so we click the button for this product only." },
  ],
  whenToUse: [
    "Every time you need to find an element: locators are the default API for interaction and assertions.",
    "Use `filter`/chaining for repeated components such as product cards, cart rows and table rows.",
  ],
  mistakes: [
    "Using `page.$()` / `page.$$()` (ElementHandles): they do not auto-wait and go stale. Use locators.",
    "Silencing strict-mode errors with `.first()` everywhere instead of writing a precise locator; the test may act on the wrong element.",
    "Long CSS chains like `div.grid > div:nth-child(3) .btn-primary` that break on any layout change.",
  ],
  debugging: [
    "Read the strict mode violation message: it lists every matched element so you can see how to narrow the locator.",
    "In UI mode or the Inspector, use the 'Pick locator' button to test a locator against the live page.",
    "Use `await locator.highlight()` while debugging headed to see what the locator matches.",
  ],
  relatedNotes: ["pw-get-by-role", "pw-get-by-label", "pw-get-by-text", "pw-get-by-test-id"],
  relatedLessons: ["dom-selecting-elements", "dom-what-is-dom"],
  practice:
    "On a product listing page, write a locator for the 'Add to cart' button of the product named 'Wool Socks' without using CSS, `nth()` or `first()`.",
  docs: [
    { title: "Playwright: Locators", url: "https://playwright.dev/docs/locators" },
    { title: "Playwright: Other locators", url: "https://playwright.dev/docs/other-locators" },
    { title: "Playwright API: Locator", url: "https://playwright.dev/docs/api/class-locator" },
  ],
  versionNote: "Playwright 1.40+ (`locator.or()` and `filter({ hasNot })` need 1.33+)",
};
