import type { KbNote } from "@/content/types";

export const pwBrowserContextPage: KbNote = {
  id: "pw-browser-context-page",
  slug: "pw-browser-context-page",
  category: "playwright",
  title: "Browser, BrowserContext and Page",
  summary:
    "Playwright's object model: one Browser process, many isolated BrowserContexts (like incognito profiles), each holding one or more Pages (tabs).",
  tech: ["playwright", "typescript"],
  difficulty: "beginner",
  tags: ["browser", "context", "page", "isolation", "multiple users", "popups"],
  prerequisites: ["[Playwright fundamentals](/kb/pw-fundamentals)", "Cookies and localStorage basics"],
  explanation: [
    {
      kind: "paragraph",
      text: "A **Browser** is a launched browser engine (Chromium, Firefox or WebKit). Launching is expensive, so the runner shares one browser per worker. A **BrowserContext** is a cheap, isolated session inside that browser with its own cookies, localStorage, permissions, viewport and geolocation. A **Page** is a single tab inside a context.",
    },
    {
      kind: "table",
      headers: ["Object", "Fixture", "Scope", "Typical use"],
      rows: [
        ["Browser", "`browser`", "worker", "Create extra contexts (e.g. a second user)"],
        ["BrowserContext", "`context`", "test", "Cookies, storageState, permissions, `context.route()`"],
        ["Page", "`page`", "test", "Navigate, locate, act, assert"],
      ],
    },
    {
      kind: "paragraph",
      text: "Because the runner creates a new context for every test, tests are isolated by default. When you need two users at once (a buyer and an admin), create a second context from the `browser` fixture instead of reusing the same page.",
    },
    {
      kind: "callout",
      tone: "info",
      text: "New tabs opened by the app (`target=_blank`) belong to the same context. Wait for them with `context.waitForEvent('page')` or `page.waitForEvent('popup')`.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "ts",
      title: "Creating contexts and pages manually",
      code: "const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-GB' });\nconst page = await context.newPage();\nawait context.addCookies([{ name: 'consent', value: 'yes', url: 'http://localhost:3000' }]);\nawait context.close();",
    },
    {
      kind: "code",
      language: "ts",
      title: "Handling a popup tab",
      code: "const popupPromise = page.waitForEvent('popup');\nawait page.getByRole('link', { name: 'Size guide' }).click();\nconst popup = await popupPromise;\nawait expect(popup).toHaveURL(/size-guide/);",
    },
  ],
  code: {
    title: "tests/admin-and-shopper.spec.ts",
    language: "ts",
    code: `import { test, expect } from '@playwright/test';

test('admin price change is visible to a shopper', async ({ browser }) => {
  const adminContext = await browser.newContext({ storageState: 'playwright/.auth/admin.json' });
  const shopperContext = await browser.newContext();

  const adminPage = await adminContext.newPage();
  const shopperPage = await shopperContext.newPage();

  await adminPage.goto('/admin/products/sku-123');
  await adminPage.getByLabel('Price').fill('19.99');
  await adminPage.getByRole('button', { name: 'Save' }).click();
  await expect(adminPage.getByRole('status')).toHaveText('Product saved');

  await shopperPage.goto('/products/sku-123');
  await expect(shopperPage.getByTestId('product-price')).toHaveText('$19.99');

  await adminContext.close();
  await shopperContext.close();
});
`,
  },
  walkthrough: [
    { line: "async ({ browser }) => {", explanation: "We ask for the worker-scoped `browser` fixture because we need two independent sessions." },
    { line: "await browser.newContext({ storageState: 'playwright/.auth/admin.json' });", explanation: "The admin context starts already logged in by loading saved cookies/localStorage." },
    { line: "const shopperContext = await browser.newContext();", explanation: "A clean anonymous context: no cookies shared with the admin." },
    { line: "await expect(shopperPage.getByTestId('product-price')).toHaveText('$19.99');", explanation: "Assertions work on any page; this one retries until the shopper sees the new price." },
    { line: "await adminContext.close();", explanation: "Contexts you create yourself are not auto-closed by the `page` fixture, so close them to free resources." },
  ],
  whenToUse: [
    "Multi-user flows: chat, admin vs customer, two shoppers competing for the last item in stock.",
    "Setting context-level options for one test: geolocation, permissions, locale, timezone, offline mode.",
    "Handling new tabs, popups and downloads.",
  ],
  mistakes: [
    "Launching a new browser per test with `chromium.launch()` inside tests: slow and bypasses the runner's config. Use `browser.newContext()` instead.",
    "Expecting two pages from the same context to have separate logins: they share cookies and storage.",
    "Forgetting to close manually created contexts, which leaks memory in long runs.",
  ],
  debugging: [
    "If a second user appears logged in unexpectedly, check that you created a new context instead of calling `context.newPage()` on the existing one.",
    "For popup issues, start waiting for the `popup` event before clicking, otherwise the event can fire before you listen.",
    "Use `test.use({ viewport, locale })` to change context options for a whole file instead of building contexts manually.",
  ],
  relatedNotes: ["pw-fundamentals", "pw-hooks-auth", "pw-fixtures"],
  relatedLessons: ["dom-cookies", "dom-local-session-storage", "introduction-browsers-servers-http"],
  practice:
    "Write a test that opens two contexts as two different shoppers, adds the same product to each cart, and asserts that each cart badge shows `1` (carts are not shared).",
  docs: [
    { title: "Playwright: Isolation (browser contexts)", url: "https://playwright.dev/docs/browser-contexts" },
    { title: "Playwright: Pages", url: "https://playwright.dev/docs/pages" },
    { title: "Playwright API: BrowserContext", url: "https://playwright.dev/docs/api/class-browsercontext" },
  ],
  versionNote: "Playwright 1.40+",
};
