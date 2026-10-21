import type { KbNote } from "@/content/types";

export const pwGetByLabel: KbNote = {
  id: "pw-get-by-label",
  slug: "pw-get-by-label",
  category: "playwright",
  title: "getByLabel()",
  summary:
    "Locate form controls by their associated label text, `aria-label` or `aria-labelledby`. The natural way to fill login, registration and address forms.",
  tech: ["playwright", "typescript"],
  difficulty: "beginner",
  tags: ["locators", "forms", "label", "accessibility"],
  prerequisites: ["Locators overview", "HTML `<label for>` and form inputs"],
  explanation: [
    {
      kind: "paragraph",
      text: "`getByLabel(text)` finds an input, textarea or select whose **label** matches. Playwright understands `<label for=\"email\">`, labels that wrap the input, `aria-labelledby` and `aria-label`. This mirrors how a user reads a form: they look for 'Email', not for `#input-27`.",
    },
    {
      kind: "paragraph",
      text: "Like other `getBy*` text options, matching is case-insensitive substring by default. Use `{ exact: true }` when one label is a prefix of another, e.g. 'Password' vs 'Confirm password'.",
    },
    {
      kind: "callout",
      tone: "warning",
      text: "A placeholder is **not** a label. If a field only has `placeholder=\"Email\"`, `getByLabel` will not find it; use `getByPlaceholder` and consider reporting the missing label as an accessibility bug.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "ts",
      code: "page.getByLabel('Email');\npage.getByLabel('Password', { exact: true });\npage.getByLabel(/postal code|zip/i);\npage.getByLabel('Country').selectOption('GB');\npage.getByLabel('I accept the terms').check();",
    },
  ],
  code: {
    title: "tests/register.spec.ts",
    language: "ts",
    code: `import { test, expect } from '@playwright/test';

test('registers a new account', async ({ page }) => {
  const email = 'shopper+' + Date.now() + '@example.test';

  await page.goto('/register');

  await page.getByLabel('First name').fill('Ada');
  await page.getByLabel('Last name').fill('Lovelace');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('Test-Password-123');
  await page.getByLabel('Confirm password').fill('Test-Password-123');
  await page.getByLabel('Country').selectOption('GB');
  await page.getByLabel('I accept the terms and conditions').check();

  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\\/account$/);
  await expect(page.getByRole('heading', { name: 'Welcome, Ada' })).toBeVisible();
});
`,
  },
  walkthrough: [
    { line: "const email = 'shopper+' + Date.now() + '@example.test';", explanation: "A unique email per run avoids 'account already exists' when tests are re-run. `.test` is a reserved domain that never delivers mail." },
    { line: "await page.getByLabel('Password', { exact: true }).fill('Test-Password-123');", explanation: "`exact` prevents matching 'Confirm password' too, which would be a strict mode violation." },
    { line: "await page.getByLabel('Country').selectOption('GB');", explanation: "Labels work for selects too; `selectOption` picks by value or label." },
    { line: "await page.getByLabel('I accept the terms and conditions').check();", explanation: "Checkbox labels are usually the sentence next to the box." },
  ],
  whenToUse: [
    "Filling any form: login, registration, address, payment details (test data only), search fields with labels.",
    "Asserting validation state on a field, e.g. `await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true')`.",
  ],
  mistakes: [
    "Not using `exact: true` when labels overlap ('Email' vs 'Email confirmation').",
    "Using `getByLabel` for fields that only have a placeholder.",
    "Labels containing a required marker like 'Email *': substring matching still works, but `exact: true` with 'Email' will not.",
  ],
  debugging: [
    "If not found, inspect the HTML: is the `for` attribute matching the input `id`? Duplicate ids break the association.",
    "Check the Accessibility pane in DevTools: the input's computed name must contain your label text.",
    "Custom components (styled dropdowns) may need `getByRole('combobox', { name })` instead.",
  ],
  relatedNotes: ["pw-get-by-role", "pw-actions"],
  relatedLessons: ["dom-forms-validation", "dom-selecting-elements"],
  practice:
    "Write a test for an address form that fills Street, City, Postal code and Country using only `getByLabel`, then asserts the saved address is shown.",
  docs: [
    { title: "Playwright: Locate by label", url: "https://playwright.dev/docs/locators#locate-by-label" },
    { title: "Playwright API: page.getByLabel", url: "https://playwright.dev/docs/api/class-page#page-get-by-label" },
  ],
  versionNote: "Playwright 1.27+; examples written for 1.40+",
};
