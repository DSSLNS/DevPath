import type { KbNote } from "@/content/types";

export const pwAssertions: KbNote = {
  id: "pw-assertions",
  slug: "pw-assertions",
  category: "playwright",
  title: "Assertions: Web-First expect, toHaveText, toBeVisible, toHaveURL, Soft Assertions",
  summary:
    "Web-first assertions retry until the condition is met or a timeout expires. Soft assertions record failures without stopping the test.",
  tech: ["playwright", "typescript"],
  difficulty: "beginner",
  tags: ["expect", "assertions", "toHaveText", "toBeVisible", "toHaveURL", "soft"],
  prerequisites: ["Playwright fundamentals", "Locators overview"],
  explanation: [
    {
      kind: "paragraph",
      text: "When you pass a **locator** or **page** to `expect`, you get an async, auto-retrying matcher. `await expect(locator).toHaveText('3')` re-queries the element repeatedly until the text is '3' (default timeout 5 s). This removes most of the timing flakiness found in older tools.",
    },
    {
      kind: "paragraph",
      text: "When you pass a plain value (`expect(count).toBe(3)`), you get a normal synchronous Jest-style matcher that checks once. Avoid reading a value and then asserting it: `expect(await locator.textContent()).toBe('3')` does **not** retry.",
    },
    {
      kind: "table",
      headers: ["Matcher", "Checks"],
      rows: [
        ["`toBeVisible()` / `toBeHidden()`", "Visibility"],
        ["`toHaveText(t)` / `toContainText(t)`", "Full / partial text (string, RegExp or array for lists)"],
        ["`toHaveValue(v)`", "Input value"],
        ["`toHaveCount(n)`", "Number of matched elements"],
        ["`toBeEnabled()` / `toBeDisabled()` / `toBeChecked()`", "Element state"],
        ["`toHaveAttribute(name, v)` / `toHaveClass(c)`", "Attributes and classes"],
        ["`expect(page).toHaveURL(u)` / `toHaveTitle(t)`", "Page URL and title"],
        ["`expect(response).toBeOK()`", "API response status 2xx"],
      ],
    },
    {
      kind: "paragraph",
      text: "**Soft assertions** (`expect.soft`) keep the test running after a failure and mark it failed at the end. They are useful for checking many independent fields on one page, such as an order summary.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "ts",
      code: "await expect(page.getByTestId('cart-count')).toHaveText('2');\nawait expect(page.getByRole('alert')).toContainText('expired');\nawait expect(page.getByTestId('product-name')).toHaveText(['Socks', 'Shoes']);\nawait expect(page.getByRole('button', { name: 'Pay' })).toBeEnabled({ timeout: 10_000 });\nawait expect(page).toHaveURL(/\\/order\\/confirmation/);\nawait expect(page.getByText('Loading')).not.toBeVisible();\nawait expect.soft(page.getByTestId('tax')).toHaveText('$2.00');\nawait expect(page.getByTestId('total'), 'total should include tax').toHaveText('$22.00');",
    },
    {
      kind: "code",
      language: "ts",
      title: "Polling a non-DOM value",
      code: "await expect.poll(async () => {\n  const res = await page.request.get('/api/orders/ORD-1001');\n  return (await res.json()).status;\n}, { timeout: 15_000 }).toBe('shipped');",
    },
  ],
  code: {
    title: "tests/order-summary.spec.ts",
    language: "ts",
    code: `import { test, expect } from '@playwright/test';

test('order confirmation shows the correct summary', async ({ page }) => {
  await page.goto('/checkout/review');
  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page).toHaveURL(/\\/order\\/confirmation\\/ORD-\\d+/);
  await expect(page.getByRole('heading', { name: 'Thank you for your order' })).toBeVisible();

  const summary = page.getByTestId('order-summary');
  await expect.soft(summary.getByTestId('subtotal')).toHaveText('$40.00');
  await expect.soft(summary.getByTestId('shipping')).toHaveText('$5.00');
  await expect.soft(summary.getByTestId('tax')).toHaveText('$3.60');
  await expect(summary.getByTestId('total')).toHaveText('$48.60');

  await expect(page.getByRole('button', { name: 'Place order' })).toHaveCount(0);
});
`,
  },
  walkthrough: [
    { line: "await expect(page).toHaveURL(/\\/order\\/confirmation\\/ORD-\\d+/);", explanation: "Retries until navigation finishes; RegExp handles the generated order id." },
    { line: "await expect.soft(summary.getByTestId('subtotal')).toHaveText('$40.00');", explanation: "If subtotal is wrong, the test keeps going so you also learn whether shipping and tax are wrong." },
    { line: "await expect(summary.getByTestId('total')).toHaveText('$48.60');", explanation: "A hard assertion: the most important check stops the test if it fails." },
    { line: "await expect(page.getByRole('button', { name: 'Place order' })).toHaveCount(0);", explanation: "Asserts the button is gone, guarding against double submission." },
  ],
  whenToUse: [
    "Every check on page state: use locator/page assertions so they auto-retry.",
    "`expect.soft` for many independent fields on one screen.",
    "`expect.poll` or `expect(...).toPass()` for values that are not in the DOM (API status, file contents).",
  ],
  mistakes: [
    "`expect(await locator.isVisible()).toBe(true)` checks once with no retry. Use `await expect(locator).toBeVisible()`.",
    "Forgetting `await` on a web-first assertion: the test ends before the assertion runs.",
    "Raising timeouts everywhere to hide slow pages instead of waiting on the right signal.",
    "Overusing soft assertions so a test continues in a broken state and produces confusing follow-up errors.",
  ],
  debugging: [
    "The failure message shows the expected value, the last received value and a call log of each retry.",
    "Add a custom message as the second argument to `expect` so reports explain business intent.",
    "If `toHaveText` fails on whitespace, note it normalizes whitespace; for inputs use `toHaveValue`.",
  ],
  relatedNotes: ["pw-auto-waiting", "pw-locators", "pw-api-testing"],
  relatedLessons: ["async-async-await", "debugging-unit-testing", "variables-equality"],
  practice:
    "Write a test for a cart page that uses at least five different web-first matchers and one `expect.soft`, then deliberately break one value to see how soft failures are reported.",
  docs: [
    { title: "Playwright: Assertions", url: "https://playwright.dev/docs/test-assertions" },
    { title: "Playwright API: LocatorAssertions", url: "https://playwright.dev/docs/api/class-locatorassertions" },
    { title: "Playwright API: PageAssertions", url: "https://playwright.dev/docs/api/class-pageassertions" },
  ],
  versionNote: "Playwright 1.40+",
};
