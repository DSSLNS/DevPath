import type { KbNote } from "@/content/types";

export const pwGetByText: KbNote = {
  id: "pw-get-by-text",
  slug: "pw-get-by-text",
  category: "playwright",
  title: "getByText()",
  summary:
    "Locate elements by visible text content. Ideal for messages, banners and static content; prefer getByRole for interactive elements.",
  tech: ["playwright", "typescript"],
  difficulty: "beginner",
  tags: ["locators", "text", "messages"],
  prerequisites: ["Locators overview"],
  explanation: [
    {
      kind: "paragraph",
      text: "`getByText` matches elements by their rendered text. Whitespace is normalized, matching is case-insensitive and substring by default. With `exact: true` it must match the whole text (still whitespace-normalized). A RegExp gives full control.",
    },
    {
      kind: "paragraph",
      text: "It returns the **smallest** element containing the text. Use it for non-interactive content: 'Your order has been placed', 'Free shipping over $50', 'No products found'. For buttons and links, `getByRole(..., { name })` is better because it also checks the element is a real button or link.",
    },
    {
      kind: "table",
      headers: ["Call", "Matches 'Free shipping over $50'?"],
      rows: [
        ["`getByText('free shipping')`", "Yes (substring, case-insensitive)"],
        ["`getByText('Free shipping', { exact: true })`", "No (not the full text)"],
        ["`getByText(/shipping over \\$\\d+/)`", "Yes"],
      ],
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "ts",
      code: "page.getByText('Order confirmed');\npage.getByText('In stock', { exact: true });\npage.getByText(/^\\d+ results?$/);\npage.getByTestId('cart-row').filter({ hasText: 'Wool Socks' });\nawait expect(page.getByText('Coupon applied')).toBeVisible();",
    },
  ],
  code: {
    title: "tests/empty-search.spec.ts",
    language: "ts",
    code: `import { test, expect } from '@playwright/test';

test('shows a helpful empty state for a search with no results', async ({ page }) => {
  await page.goto('/search?q=zzzz-no-such-product');

  await expect(page.getByText('No products found for "zzzz-no-such-product"')).toBeVisible();
  await expect(page.getByText(/try a different spelling/i)).toBeVisible();
  await expect(page.getByTestId('product-card')).toHaveCount(0);

  await page.getByRole('link', { name: 'Browse all products' }).click();
  await expect(page).toHaveURL(/\\/products/);
});
`,
  },
  walkthrough: [
    { line: "await page.goto('/search?q=zzzz-no-such-product');", explanation: "Navigating directly with a query string sets up the state without typing." },
    { line: "page.getByText('No products found for \"zzzz-no-such-product\"')", explanation: "Asserts the exact user-facing message, including the echoed search term." },
    { line: "page.getByText(/try a different spelling/i)", explanation: "A RegExp tolerates small copy changes such as punctuation." },
    { line: "await expect(page.getByTestId('product-card')).toHaveCount(0);", explanation: "Confirms the empty state really has no results, not just a message above stale cards." },
  ],
  whenToUse: [
    "Asserting confirmation, error, empty-state and toast messages.",
    "Filtering repeated rows or cards with `filter({ hasText })`.",
  ],
  mistakes: [
    "Using `getByText('Add to cart').click()` for buttons: it may match a hidden tooltip or help text first. Use `getByRole('button', { name })`.",
    "Asserting copy that changes often (marketing text) with `exact: true`: tests break on every content edit.",
    "Forgetting that substring matching makes `getByText('Total')` also match 'Subtotal'.",
  ],
  debugging: [
    "If a strict mode violation lists several elements, add `exact: true` or scope with a parent locator.",
    "Text inside `<input value>` is not text content; assert it with `toHaveValue` instead.",
    "Localized apps: run with a fixed `locale` in the config so the text is predictable.",
  ],
  relatedNotes: ["pw-locators", "pw-get-by-role", "pw-assertions"],
  relatedLessons: ["dom-updating-content", "variables-strings"],
  practice:
    "Write assertions for a cart page that check: the 'Subtotal' row text, a 'Free shipping unlocked' banner, and that no 'Out of stock' text appears.",
  docs: [
    { title: "Playwright: Locate by text", url: "https://playwright.dev/docs/locators#locate-by-text" },
    { title: "Playwright API: page.getByText", url: "https://playwright.dev/docs/api/class-page#page-get-by-text" },
  ],
  versionNote: "Playwright 1.27+; examples written for 1.40+",
};
