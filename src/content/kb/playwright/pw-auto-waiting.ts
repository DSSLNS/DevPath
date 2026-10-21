import type { KbNote } from "@/content/types";

export const pwAutoWaiting: KbNote = {
  id: "pw-auto-waiting",
  slug: "pw-auto-waiting",
  category: "playwright",
  title: "Auto-Waiting and Actionability",
  summary:
    "Playwright waits for elements to be actionable before acting and retries assertions automatically, so fixed sleeps are almost never needed.",
  tech: ["playwright", "typescript"],
  difficulty: "intermediate",
  tags: ["waiting", "actionability", "flakiness", "timeouts"],
  prerequisites: ["Actions", "Web-first assertions", "Promises and the event loop"],
  explanation: [
    {
      kind: "paragraph",
      text: "Playwright has two kinds of automatic waiting. **Actionability checks** run before every action. **Assertion retries** run inside every web-first `expect`. Together they replace most manual waits.",
    },
    {
      kind: "table",
      caption: "Checks performed before an action",
      headers: ["Action", "Visible", "Stable", "Receives events", "Enabled", "Editable"],
      rows: [
        ["`click`, `check`, `hover`", "Yes", "Yes", "Yes", "Yes (click/check)", "-"],
        ["`fill`, `clear`", "Yes", "-", "-", "Yes", "Yes"],
        ["`selectOption`", "Yes", "-", "-", "Yes", "-"],
        ["`press`, `focus`", "-", "-", "-", "-", "-"],
      ],
    },
    {
      kind: "list",
      items: [
        "**Visible**: non-empty bounding box and no `visibility:hidden`.",
        "**Stable**: same bounding box for two animation frames (not mid-animation).",
        "**Receives events**: not covered by another element at the click point.",
        "**Enabled**: not `disabled` (including inside a disabled fieldset) and not `aria-disabled=true`.",
      ],
    },
    {
      kind: "table",
      caption: "Default timeouts",
      headers: ["Timeout", "Default", "Config"],
      rows: [
        ["Test", "30 s", "`timeout`"],
        ["Assertion (`expect`)", "5 s", "`expect: { timeout }`"],
        ["Action / navigation", "none (bounded by test timeout)", "`use: { actionTimeout, navigationTimeout }`"],
      ],
    },
    {
      kind: "callout",
      tone: "danger",
      title: "Avoid waitForTimeout",
      text: "`await page.waitForTimeout(3000)` makes tests slow when the app is fast and flaky when it is slow. Wait for a **signal** instead: a visible element, a URL, or a network response.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "ts",
      code: "// Wait for UI state\nawait expect(page.getByTestId('spinner')).toBeHidden();\nawait expect(page.getByTestId('product-card')).toHaveCount(24);\n\n// Wait for a network response triggered by an action\nconst resPromise = page.waitForResponse('**/api/cart');\nawait page.getByRole('button', { name: 'Add to cart' }).click();\nawait resPromise;\n\n// Wait for navigation result\nawait page.waitForURL('**/checkout');\n\n// Retry a whole block\nawait expect(async () => {\n  await page.getByRole('button', { name: 'Refresh' }).click();\n  await expect(page.getByTestId('stock')).toHaveText('In stock', { timeout: 1000 });\n}).toPass({ timeout: 15_000 });",
    },
  ],
  code: {
    title: "tests/apply-filter.spec.ts",
    language: "ts",
    code: `import { test, expect } from '@playwright/test';

test('applying a brand filter refreshes the grid without sleeps', async ({ page }) => {
  await page.goto('/category/shoes');
  await expect(page.getByTestId('product-card')).toHaveCount(24);

  const filtered = page.waitForResponse(
    (res) => res.url().includes('/api/products') && res.url().includes('brand=acme') && res.ok(),
  );
  await page.getByRole('checkbox', { name: 'Acme' }).check();
  await filtered;

  await expect(page.getByTestId('loading-overlay')).toBeHidden();
  await expect(page.getByTestId('product-card')).toHaveCount(6);
  await expect(page.getByTestId('product-brand')).toHaveText(Array(6).fill('Acme'));
});
`,
  },
  walkthrough: [
    { line: "await expect(page.getByTestId('product-card')).toHaveCount(24);", explanation: "Waits for the initial grid instead of sleeping after `goto`." },
    { line: "const filtered = page.waitForResponse(", explanation: "Start listening *before* the action so a fast response is not missed." },
    { line: "await page.getByRole('checkbox', { name: 'Acme' }).check();", explanation: "Auto-waits until the checkbox is visible, stable and enabled." },
    { line: "await expect(page.getByTestId('loading-overlay')).toBeHidden();", explanation: "Ensures the UI finished updating after the response arrived." },
    { line: "toHaveText(Array(6).fill('Acme'))", explanation: "An array asserts every matched element's text, in order." },
  ],
  whenToUse: [
    "Always rely on auto-waiting first; add explicit waits only for signals the UI does not expose (a background request, a download).",
    "Use `toPass` / `expect.poll` for eventually consistent backends (search indexing, order status).",
  ],
  mistakes: [
    "Using `waitForTimeout` or `setTimeout` sleeps to fix flakiness.",
    "Calling `waitForResponse` *after* the click: the response may already have arrived, so the wait hangs until timeout.",
    "Using `page.waitForLoadState('networkidle')` as a general wait; it is discouraged and unreliable with polling or analytics requests.",
    "Asserting `isVisible()` results directly: `isVisible` does not wait.",
  ],
  debugging: [
    "Read the call log in the timeout error: it shows which check kept failing (e.g. 'waiting for element to be stable').",
    "Open the trace and inspect the before/after DOM snapshots of the slow step.",
    "If a click 'succeeds' but nothing happens, the app may not have hydrated yet; wait for a hydration signal (e.g. an enabled button) before acting.",
  ],
  relatedNotes: ["pw-actions", "pw-assertions", "pw-network-interception"],
  relatedLessons: ["async-event-loop", "async-race-conditions", "async-loading-error-states"],
  practice:
    "Find a test that uses `waitForTimeout` and replace each sleep with a web-first assertion or `waitForResponse`. Run it 20 times with `--repeat-each=20` to prove it is stable.",
  docs: [
    { title: "Playwright: Auto-waiting (actionability)", url: "https://playwright.dev/docs/actionability" },
    { title: "Playwright: Timeouts", url: "https://playwright.dev/docs/test-timeouts" },
    { title: "Playwright: Assertions (toPass, poll)", url: "https://playwright.dev/docs/test-assertions" },
  ],
  versionNote: "Playwright 1.40+",
};
