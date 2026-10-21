import type { KbNote } from "@/content/types";

export const pwNetworkInterception: KbNote = {
  id: "pw-network-interception",
  slug: "pw-network-interception",
  category: "playwright",
  title: "Network Interception: page.route, route.fulfill, waitForResponse",
  summary:
    "Intercept, mock, modify or block HTTP requests from the browser, and wait for specific responses to synchronize tests with the network.",
  tech: ["playwright", "typescript"],
  difficulty: "intermediate",
  tags: ["network", "mocking", "route", "fulfill", "waitForResponse", "stubbing"],
  prerequisites: ["HTTP requests and responses", "API testing basics", "Glob patterns"],
  explanation: [
    {
      kind: "paragraph",
      text: "`page.route(url, handler)` intercepts matching requests made by the page (fetch/XHR, documents, images). The handler decides what happens: `route.fulfill()` returns a fake response, `route.continue()` sends it on (optionally modified), `route.abort()` simulates a network failure, and `route.fetch()` performs the real request so you can modify the real response.",
    },
    {
      kind: "paragraph",
      text: "`page.waitForResponse(urlOrPredicate)` returns a Promise that resolves when a matching response arrives. Create the promise **before** the action that triggers the request, then await it after.",
    },
    {
      kind: "table",
      headers: ["Method", "Effect"],
      rows: [
        ["`route.fulfill({ json, status })`", "Mock response; request never hits the server"],
        ["`route.continue({ headers, postData })`", "Send the request, optionally modified"],
        ["`route.fetch()` + `route.fulfill({ response, json })`", "Patch a real response"],
        ["`route.abort('failed')`", "Simulate network error"],
        ["`route.fallback()`", "Pass to the next registered handler"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      text: "Routes registered on `context.route()` apply to every page in the context, including popups. Service workers can bypass routing; set `serviceWorkers: 'block'` in `use` if your app has one.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "ts",
      code: "await page.route('**/api/products*', (route) => route.fulfill({ json: { items: [], total: 0 } }));\nawait page.route('**/api/checkout', (route) => route.fulfill({ status: 500, json: { error: 'Internal' } }));\nawait page.route('**/*.{png,jpg}', (route) => route.abort());\nawait page.route('**/api/cart', async (route) => {\n  const response = await route.fetch();\n  const json = await response.json();\n  json.freeShippingThreshold = 0;\n  await route.fulfill({ response, json });\n});\n\nconst resPromise = page.waitForResponse((r) => r.url().includes('/api/search') && r.status() === 200);\nawait page.getByRole('searchbox').fill('shoe');\nconst res = await resPromise;\nconst data = await res.json();\n\nawait page.unroute('**/api/products*');",
    },
  ],
  code: {
    title: "tests/plp-mocked.spec.ts",
    language: "ts",
    code: `import { test, expect } from '@playwright/test';

const products = {
  items: [
    { sku: 'SHOE-1', name: 'Trail Runner 2', price: 8900, inStock: true },
    { sku: 'SHOE-2', name: 'Road Racer', price: 12000, inStock: false },
  ],
  total: 2,
};

test('renders mocked products and an out-of-stock badge', async ({ page }) => {
  await page.route('**/api/products?*', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: products });
  });

  const productsLoaded = page.waitForResponse('**/api/products?*');
  await page.goto('/category/shoes');
  await productsLoaded;

  const cards = page.getByTestId('product-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.filter({ hasText: 'Road Racer' }).getByTestId('stock-badge')).toHaveText('Out of stock');
});

test('shows an error banner when the products API fails', async ({ page }) => {
  await page.route('**/api/products?*', (route) =>
    route.fulfill({ status: 503, json: { error: 'Service Unavailable' } }),
  );

  await page.goto('/category/shoes');

  await expect(page.getByRole('alert')).toHaveText(/couldn't load products/i);
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});
`,
  },
  walkthrough: [
    { line: "await page.route('**/api/products?*', async (route) => {", explanation: "Register the route before `goto` so the very first request is intercepted. `**` matches any origin and path prefix." },
    { line: "await route.fulfill({ json: products });", explanation: "`json` serializes the body and sets `Content-Type: application/json`; status defaults to 200." },
    { line: "const productsLoaded = page.waitForResponse('**/api/products?*');", explanation: "Start waiting before navigation to avoid missing the response." },
    { line: "route.fulfill({ status: 503, json: { error: 'Service Unavailable' } }),", explanation: "Simulates a backend outage to test the error UI deterministically." },
  ],
  whenToUse: [
    "Error states that are hard to reproduce on a real backend: 500s, timeouts, empty lists, malformed data.",
    "Isolating the frontend from slow or unstable third parties (analytics, recommendations, payment provider SDK calls in UI-only tests).",
    "Synchronizing on a specific network response instead of sleeping.",
  ],
  mistakes: [
    "Registering `page.route` after `page.goto`: the initial requests already went to the real server.",
    "A glob that does not match because of the query string: `'**/api/products'` does not match `/api/products?page=2`; use `'**/api/products?*'`, a RegExp or a predicate.",
    "Mocking everything in every test, so the suite never verifies the real integration. Keep some unmocked end-to-end tests.",
    "Letting mock data drift from the real API contract; type it or generate it from the API schema.",
  ],
  debugging: [
    "Log matches: `page.on('request', (r) => console.log(r.method(), r.url()))` to confirm the exact URL.",
    "The trace viewer Network tab marks fulfilled requests so you can see whether your mock was used.",
    "If a route never fires, check for a service worker and set `serviceWorkers: 'block'`.",
  ],
  relatedNotes: ["pw-api-testing", "pw-auto-waiting"],
  relatedLessons: ["async-fetch-api", "networking-api-debugging", "async-loading-error-states", "debugging-network-inspection"],
  practice:
    "Mock the search API to return results after a 2-second delay (`await new Promise(r => setTimeout(r, 2000))` inside the handler) and assert a loading skeleton appears and then disappears.",
  docs: [
    { title: "Playwright: Mock APIs", url: "https://playwright.dev/docs/mock" },
    { title: "Playwright: Network", url: "https://playwright.dev/docs/network" },
    { title: "Playwright API: Route", url: "https://playwright.dev/docs/api/class-route" },
  ],
  versionNote: "Playwright 1.40+ (`json` option in fulfill: 1.29+)",
};
