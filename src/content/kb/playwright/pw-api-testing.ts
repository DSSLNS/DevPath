import type { KbNote } from "@/content/types";

export const pwApiTesting: KbNote = {
  id: "pw-api-testing",
  slug: "pw-api-testing",
  category: "playwright",
  title: "API Testing with the request Fixture",
  summary:
    "Playwright's APIRequestContext sends HTTP requests directly to your backend: test APIs on their own, or seed and verify data around UI tests.",
  tech: ["playwright", "typescript"],
  difficulty: "intermediate",
  tags: ["api", "request", "REST", "test data", "toBeOK"],
  prerequisites: ["HTTP methods and status codes", "JSON", "Playwright fundamentals"],
  explanation: [
    {
      kind: "paragraph",
      text: "The `request` fixture is an **APIRequestContext**. It uses `baseURL` and `extraHTTPHeaders` from the config, does not need a browser, and is much faster than UI steps. `page.request` is a variant that shares cookies with the page's context.",
    },
    {
      kind: "list",
      items: [
        "**Pure API tests**: check status codes, response schemas and business rules.",
        "**Arrange via API**: create a user, product or cart before a UI test.",
        "**Assert via API**: after a UI action, confirm the backend stored the right data.",
      ],
    },
    {
      kind: "paragraph",
      text: "Request options: `data` (JSON body; objects are serialized automatically), `form` (url-encoded), `multipart` (file uploads), `params` (query string), `headers`, and `failOnStatusCode`.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "ts",
      code: "const res = await request.get('/api/products', { params: { category: 'shoes', page: 1 } });\nawait expect(res).toBeOK();\nconst body = await res.json();\n\nawait request.post('/api/cart/items', { data: { sku: 'SOCK-1', qty: 2 } });\nawait request.patch('/api/cart/items/SOCK-1', { data: { qty: 3 } });\nawait request.delete('/api/cart/items/SOCK-1');\n\n// config\nuse: { baseURL: 'http://localhost:3000', extraHTTPHeaders: { Authorization: 'Bearer ' + process.env.API_TOKEN } }",
    },
  ],
  code: {
    title: "tests/api/cart.api.spec.ts",
    language: "ts",
    code: `import { test, expect } from '@playwright/test';

test.describe('Cart API', () => {
  test('adds an item and recalculates totals', async ({ request }) => {
    const created = await request.post('/api/carts');
    await expect(created).toBeOK();
    const { id: cartId } = await created.json();

    const added = await request.post('/api/carts/' + cartId + '/items', {
      data: { sku: 'SOCK-WOOL-M', quantity: 2 },
    });
    expect(added.status()).toBe(201);

    const cartRes = await request.get('/api/carts/' + cartId);
    const cart = await cartRes.json();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({ sku: 'SOCK-WOOL-M', quantity: 2 });
    expect(cart.subtotal).toBe(2400);
  });

  test('rejects an unknown SKU with 404', async ({ request }) => {
    const created = await request.post('/api/carts');
    const { id: cartId } = await created.json();

    const res = await request.post('/api/carts/' + cartId + '/items', {
      data: { sku: 'DOES-NOT-EXIST', quantity: 1 },
    });
    expect(res.status()).toBe(404);
    expect(await res.json()).toMatchObject({ error: 'PRODUCT_NOT_FOUND' });
  });
});
`,
  },
  walkthrough: [
    { line: "await expect(created).toBeOK();", explanation: "Asserts a 2xx status; on failure, the message includes the response body." },
    { line: "const { id: cartId } = await created.json();", explanation: "Parse JSON and destructure the new cart id for later calls." },
    { line: "data: { sku: 'SOCK-WOOL-M', quantity: 2 },", explanation: "An object passed as `data` is sent as JSON with the right Content-Type header." },
    { line: "expect(cart.items[0]).toMatchObject({ sku: 'SOCK-WOOL-M', quantity: 2 });", explanation: "Partial match: ignores extra fields like `id` or `addedAt`." },
    { line: "expect(cart.subtotal).toBe(2400);", explanation: "Money in minor units (cents) avoids floating-point rounding issues." },
  ],
  whenToUse: [
    "Fast checks of backend rules (pricing, validation, permissions) without the UI.",
    "Seeding and cleaning test data around UI tests.",
    "Verifying side effects that are not visible in the UI.",
  ],
  mistakes: [
    "Using `request` when you need the page's cookies: use `page.request` or `context.request` instead.",
    "Asserting only status codes and never the body.",
    "Calling `res.json()` on an error HTML page and getting a confusing parse error; check status first.",
  ],
  debugging: [
    "Log `await res.text()` when an API call fails unexpectedly.",
    "API calls appear in the trace viewer's Network tab with request and response bodies.",
    "Check that `baseURL` ends correctly: a path starting with `/` replaces any path in baseURL.",
  ],
  relatedNotes: ["pw-fixtures", "pw-network-interception"],
  relatedLessons: ["networking-rest-apis", "networking-crud-requests", "async-http-status-codes", "async-json", "networking-headers"],
  practice:
    "Write API tests for a promo-code endpoint: a valid code returns 200 with a discount, an expired code returns 422 with `PROMO_EXPIRED`, and a missing body returns 400.",
  docs: [
    { title: "Playwright: API testing", url: "https://playwright.dev/docs/api-testing" },
    { title: "Playwright API: APIRequestContext", url: "https://playwright.dev/docs/api/class-apirequestcontext" },
  ],
  versionNote: "Playwright 1.40+",
};
