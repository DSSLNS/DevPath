import type { KbNote } from "@/content/types";

export const pwGetByRole: KbNote = {
  id: "pw-get-by-role",
  slug: "pw-get-by-role",
  category: "playwright",
  title: "getByRole()",
  summary:
    "Locate elements by ARIA role and accessible name, the way users and screen readers perceive them. The most resilient and recommended Playwright locator.",
  tech: ["playwright", "typescript"],
  difficulty: "beginner",
  tags: ["locators", "accessibility", "aria", "role"],
  prerequisites: ["[Locators overview](/kb/pw-locators)", "Semantic HTML (button, link, heading, checkbox)"],
  explanation: [
    {
      kind: "paragraph",
      text: "Every element has an implicit ARIA **role**: `<button>` is `button`, `<a href>` is `link`, `<h2>` is `heading`, `<input type=checkbox>` is `checkbox`, `<select>` is `combobox`, `<ul>` is `list`. The **accessible name** is usually the visible text, the label, or `aria-label`.",
    },
    {
      kind: "paragraph",
      text: "`getByRole` matches both. Name matching is case-insensitive and substring by default; pass `exact: true` for a full, case-sensitive match, or a RegExp for flexible matching.",
    },
    {
      kind: "table",
      headers: ["Option", "Example", "Meaning"],
      rows: [
        ["`name`", "`{ name: 'Add to cart' }`", "Accessible name (string or RegExp)"],
        ["`exact`", "`{ name: 'Cart', exact: true }`", "Do not match 'Cart (2)'"],
        ["`level`", "`{ level: 1 }`", "Heading level"],
        ["`checked`", "`{ checked: true }`", "Checkbox / radio state"],
        ["`pressed` / `expanded` / `selected` / `disabled`", "`{ expanded: false }`", "ARIA states"],
        ["`includeHidden`", "`{ includeHidden: true }`", "Also match hidden elements"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Free accessibility check",
      text: "If `getByRole` cannot find your 'button', it may be a `<div onclick>` that keyboard and screen-reader users cannot use either. That is a real bug worth reporting.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "ts",
      code: "page.getByRole('button', { name: 'Add to cart' });\npage.getByRole('link', { name: /view cart/i });\npage.getByRole('heading', { name: 'Order summary', level: 2 });\npage.getByRole('checkbox', { name: 'Gift wrap' });\npage.getByRole('combobox', { name: 'Size' });\npage.getByRole('dialog').getByRole('button', { name: 'Close' });\npage.getByRole('row', { name: /Trail Runner/ });",
    },
  ],
  code: {
    title: "tests/checkout-roles.spec.ts",
    language: "ts",
    code: `import { test, expect } from '@playwright/test';

test('shopper opens the mini cart and proceeds to checkout', async ({ page }) => {
  await page.goto('/products/trail-runner-2');

  await page.getByRole('button', { name: 'Add to cart' }).click();

  const miniCart = page.getByRole('dialog', { name: 'Your cart' });
  await expect(miniCart).toBeVisible();
  await expect(miniCart.getByRole('listitem')).toHaveCount(1);

  await miniCart.getByRole('checkbox', { name: 'Add gift wrap' }).check();
  await miniCart.getByRole('link', { name: 'Checkout' }).click();

  await expect(page.getByRole('heading', { name: 'Checkout', level: 1 })).toBeVisible();
});
`,
  },
  walkthrough: [
    { line: "page.getByRole('button', { name: 'Add to cart' })", explanation: "Finds a real button (or `role=button`) whose accessible name contains 'Add to cart'." },
    { line: "const miniCart = page.getByRole('dialog', { name: 'Your cart' });", explanation: "A dialog's name comes from `aria-labelledby` or `aria-label`. Scoping to it avoids clashes with page buttons." },
    { line: "await miniCart.getByRole('checkbox', { name: 'Add gift wrap' }).check();", explanation: "Checkbox name comes from its `<label>`. `check()` also verifies the state changed." },
    { line: "page.getByRole('heading', { name: 'Checkout', level: 1 })", explanation: "`level` narrows to `<h1>`, so an `<h2>Checkout summary</h2>` will not match." },
  ],
  whenToUse: [
    "Default choice for buttons, links, headings, form controls, dialogs, tabs, menus and table rows.",
    "When you want tests that also catch missing semantics and accessibility regressions.",
  ],
  mistakes: [
    "Assuming substring matching: `{ name: 'Cart' }` also matches 'Add to cart' and 'Cart (2)'. Use `exact: true` or a RegExp anchor.",
    "Using `getByRole('button')` for an icon-only button without an `aria-label`: it has no name. Fix the markup or use a test id.",
    "Searching for role `textbox` on a `<select>`: selects are `combobox` (single) or `listbox` (multiple/size>1).",
  ],
  debugging: [
    "Use the Accessibility tab in Chrome DevTools to see the computed role and name of an element.",
    "`await expect(page.locator('main')).toMatchAriaSnapshot(...)` (1.49+) or the codegen picker shows the accessibility tree Playwright sees.",
    "If the name never matches, check for hidden text, icons with `aria-hidden`, or extra whitespace in the label.",
  ],
  relatedNotes: ["pw-locators", "pw-get-by-label", "pw-get-by-text", "pw-actions"],
  relatedLessons: ["dom-selecting-elements", "dom-forms-validation"],
  practice:
    "Rewrite three CSS-based locators from an existing test (`.btn-primary`, `#size-select`, `h1.title`) using `getByRole` with the appropriate `name` and options.",
  docs: [
    { title: "Playwright: Locate by role", url: "https://playwright.dev/docs/locators#locate-by-role" },
    { title: "Playwright API: page.getByRole", url: "https://playwright.dev/docs/api/class-page#page-get-by-role" },
    { title: "MDN: ARIA roles", url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles" },
  ],
  versionNote: "Playwright 1.27+ (getBy* locators); examples tested against 1.40+",
};
