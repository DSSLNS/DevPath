import type { KbNote } from "@/content/types";

export const pwActions: KbNote = {
  id: "pw-actions",
  slug: "pw-actions",
  category: "playwright",
  title: "Actions: click, fill, press, check, selectOption, setInputFiles",
  summary:
    "Locator actions simulate real user input. Each one auto-waits for the element to be actionable before acting.",
  tech: ["playwright", "typescript"],
  difficulty: "beginner",
  tags: ["actions", "click", "fill", "keyboard", "forms", "upload"],
  prerequisites: ["Locators overview", "HTML form elements"],
  explanation: [
    {
      kind: "table",
      headers: ["Action", "Use for", "Notes"],
      rows: [
        ["`click()`", "Buttons, links, any clickable element", "Options: `button`, `modifiers`, `position`, `clickCount`"],
        ["`dblclick()`", "Double-click", ""],
        ["`fill(value)`", "Inputs, textareas, contenteditable", "Clears first, sets the value, fires `input` event"],
        ["`pressSequentially(text)`", "Typing character by character", "For autocomplete/keystroke handlers; replaces deprecated `type()`"],
        ["`press(key)`", "Keyboard keys", "'Enter', 'Escape', 'ArrowDown', 'Control+A'"],
        ["`check()` / `uncheck()`", "Checkboxes and radios", "Asserts the state actually changed"],
        ["`setChecked(bool)`", "Set a checkbox to a known state", ""],
        ["`selectOption(v)`", "Native `<select>`", "By value, `{ label }`, or `{ index }`; array for multi-select"],
        ["`setInputFiles(path)`", "`<input type=file>`", "Path, array of paths, buffer object, or `[]` to clear"],
        ["`hover()` / `focus()` / `blur()`", "Menus, tooltips, validation on blur", ""],
      ],
    },
    {
      kind: "paragraph",
      text: "Before acting, Playwright checks the element is attached, visible, stable (not animating), enabled and receives pointer events. If not, it retries until the action timeout. This is why you rarely need explicit waits.",
    },
    {
      kind: "callout",
      tone: "warning",
      text: "`force: true` skips actionability checks. It can make a test 'pass' by clicking a button hidden behind a cookie banner that a real user could never click. Use it only with a written reason.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "ts",
      code: "await page.getByRole('button', { name: 'Add to cart' }).click();\nawait page.getByLabel('Email').fill('shopper@example.test');\nawait page.getByLabel('Search').pressSequentially('runn', { delay: 50 });\nawait page.getByLabel('Search').press('Enter');\nawait page.keyboard.press('Escape');\nawait page.getByLabel('Gift wrap').check();\nawait page.getByLabel('Size').selectOption('M');\nawait page.getByLabel('Size').selectOption({ label: 'Medium' });\nawait page.getByLabel('Upload receipt').setInputFiles('fixtures/receipt.pdf');\nawait page.getByLabel('Upload receipt').setInputFiles([]);",
    },
  ],
  code: {
    title: "tests/return-request.spec.ts",
    language: "ts",
    code: `import { test, expect } from '@playwright/test';
import path from 'node:path';

test('submits a return request with a photo', async ({ page }) => {
  await page.goto('/orders/ORD-1001/return');

  await page.getByLabel('Item').selectOption({ label: 'Trail Runner 2 - Size 42' });
  await page.getByRole('radio', { name: 'Wrong size' }).check();
  await page.getByLabel('Comments').fill('Runs half a size small.');
  await page.getByLabel('Photo of item').setInputFiles(path.join(__dirname, 'fixtures', 'shoe.jpg'));
  await page.getByLabel('I confirm the item is unused').check();

  await page.getByLabel('Comments').press('Tab');
  await page.getByRole('button', { name: 'Submit return' }).click();

  await expect(page.getByRole('status')).toHaveText(/Return request RMA-\\d+ created/);
});
`,
  },
  walkthrough: [
    { line: "await page.getByLabel('Item').selectOption({ label: 'Trail Runner 2 - Size 42' });", explanation: "Select by visible label; use a plain string to select by `value`." },
    { line: "await page.getByRole('radio', { name: 'Wrong size' }).check();", explanation: "`check()` works for radios and verifies it became checked." },
    { line: "await page.getByLabel('Photo of item').setInputFiles(path.join(__dirname, 'fixtures', 'shoe.jpg'));", explanation: "Uploads a file without opening the OS file picker. Build the path relative to the test file." },
    { line: "await page.getByLabel('Comments').press('Tab');", explanation: "Moves focus like a real user, triggering blur validation." },
    { line: "await expect(page.getByRole('status')).toHaveText(/Return request RMA-\\d+ created/);", explanation: "A RegExp handles the generated return id." },
  ],
  whenToUse: [
    "Every user interaction in an E2E test.",
    "Use `pressSequentially` only when the app reacts to individual keystrokes (autocomplete, input masks); otherwise `fill` is faster and more reliable.",
  ],
  mistakes: [
    "Using `click()` on a `<select>` and then on an `<option>`: use `selectOption` for native selects.",
    "Using deprecated `page.type()` / `locator.type()`; use `fill` or `pressSequentially`.",
    "Adding `force: true` to make a flaky click pass, hiding a real overlay bug.",
    "Using `fill` on a custom JS dropdown: it is not an input. Click to open and pick the option by role.",
  ],
  debugging: [
    "When an action times out, the error log lists each actionability check it waited on (e.g. 'element is not visible', 'another element would receive the click').",
    "'Element intercepts pointer events' usually means a modal, cookie banner or sticky header covers the target: dismiss it first.",
    "For uploads, ensure the locator points at the `<input type=file>`, or use `page.waitForEvent('filechooser')` when a custom button opens the chooser.",
  ],
  relatedNotes: ["pw-auto-waiting", "pw-get-by-label", "pw-assertions"],
  relatedLessons: ["dom-event-listeners", "dom-forms-validation", "dom-event-objects"],
  practice:
    "Automate a product review form: choose a star rating radio, fill title and body, upload an image, accept the guidelines checkbox, submit, and assert the success message.",
  docs: [
    { title: "Playwright: Actions", url: "https://playwright.dev/docs/input" },
    { title: "Playwright API: Locator", url: "https://playwright.dev/docs/api/class-locator" },
  ],
  versionNote: "Playwright 1.40+ (`pressSequentially` added in 1.38)",
};
