import type { KbNote } from "@/content/types";

export const e2eTestPyramid: KbNote = {
  id: "e2e-test-pyramid",
  slug: "e2e-test-pyramid",
  category: "fundamentals",
  title: "Unit vs Integration vs E2E: the Test Pyramid and Trophy",
  summary:
    "Different test levels trade speed for confidence. The test pyramid and the testing trophy are two models for deciding how many tests to write at each level.",
  tech: ["javascript", "cypress", "playwright"],
  difficulty: "beginner",
  tags: ["test pyramid", "testing trophy", "unit tests", "integration tests", "strategy"],
  prerequisites: [
    "What an E2E test is",
    "Writing and calling JavaScript functions",
    "Basic idea of a frontend talking to an API",
  ],
  explanation: [
    {
      kind: "paragraph",
      text: "A **unit test** checks one small piece of logic (a function, a class) in isolation, usually in milliseconds. An **integration test** checks that several pieces work together: a component with its state store, an API route with a real database, a module with its real dependencies. An **end-to-end test** drives the deployed system through the UI like a user.",
    },
    {
      kind: "table",
      caption: "Comparing test levels",
      headers: ["Level", "Scope", "Speed", "Confidence", "Failure tells you"],
      rows: [
        ["Unit", "One function/module", "ms", "Logic is correct", "Exactly which function broke"],
        ["Integration / component", "A few units together", "ms to seconds", "Pieces cooperate", "Which seam broke"],
        ["E2E", "Whole system in a browser", "seconds to minutes", "Users can reach goals", "*Something* in the journey broke"],
      ],
    },
    {
      kind: "paragraph",
      text: "The **test pyramid** (popularised by Mike Cohn and described by Martin Fowler) says: many fast unit tests at the base, fewer integration tests in the middle, and a small number of E2E tests at the top. The **testing trophy** (Kent C. Dodds) puts the biggest share on integration tests, because modern tools make them fast while giving much more confidence than isolated units, with static analysis (TypeScript, ESLint) as the base.",
    },
    {
      kind: "diagram",
      title: "Test pyramid (bottom to top)",
      variant: "stack",
      steps: [
        { label: "E2E (few)", detail: "Critical journeys in a real browser" },
        { label: "Integration / API / component (some)", detail: "Modules and services working together" },
        { label: "Unit (many)", detail: "Pure logic: price calculation, validation, formatting" },
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "The models agree on one thing",
      text: "Both say **do not** try to test everything end to end. Push each check to the *lowest* level that can catch the bug, and reserve E2E for the risks only a full system can reveal.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Unit level: pure logic, no browser",
      code: `function cartTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

console.log(cartTotal([{ price: 10, qty: 2 }, { price: 5, qty: 1 }]));`,
      output: "25",
    },
    {
      kind: "code",
      language: "ts",
      title: "E2E level: the same rule seen by the user",
      code: `test("cart shows the total", async ({ page }) => {
  await page.goto("/cart");
  await expect(page.getByTestId("cart-total")).toHaveText("$25.00");
});`,
    },
  ],
  code: {
    title: "One business rule, tested at three levels",
    language: "ts",
    code: `// 1. Unit (Vitest/Jest): every rounding and discount edge case lives here
import { describe, it, expect } from "vitest";
import { cartTotal } from "../src/cart";

describe("cartTotal", () => {
  it("multiplies price by quantity", () => {
    expect(cartTotal([{ price: 10, qty: 2 }])).toBe(20);
  });
  it("returns 0 for an empty cart", () => {
    expect(cartTotal([])).toBe(0);
  });
});

// 2. API integration (Playwright request fixture): the endpoint uses the rule
import { test, expect } from "@playwright/test";

test("cart API returns the computed total", async ({ request }) => {
  const res = await request.post("/api/cart/items", { data: { sku: "SHOE-42", qty: 2 } });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.total).toBe(body.items[0].price * 2);
});

// 3. E2E (Playwright UI): ONE happy-path check that the user sees it
test("user sees cart total after adding a product", async ({ page }) => {
  await page.goto("/products/shoe-42");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("link", { name: "Cart" }).click();
  await expect(page.getByTestId("cart-total")).toContainText("$");
});`,
  },
  walkthrough: [
    { line: "expect(cartTotal([])).toBe(0);", explanation: "Edge cases are cheap at unit level: no browser, no server, runs in milliseconds." },
    { line: 'const res = await request.post("/api/cart/items", { data: { sku: "SHOE-42", qty: 2 } });', explanation: "The API test proves the backend wires the rule correctly without paying for UI rendering." },
    { line: 'await page.getByRole("button", { name: "Add to cart" }).click();', explanation: "The E2E test focuses on the journey: can a user add an item and see a total at all." },
    { line: 'await expect(page.getByTestId("cart-total")).toContainText("$");', explanation: "The E2E assertion stays coarse on purpose; exact maths is already covered lower down." },
  ],
  whenToUse: [
    "When planning a new feature's test strategy: list risks, then assign each to the cheapest level that catches it.",
    "When an E2E suite becomes slow: look for checks that could move down to unit or API level.",
    "When a bug escaped: ask which level *should* have caught it and add the test there.",
  ],
  mistakes: [
    "The \"ice-cream cone\" anti-pattern: mostly manual and E2E tests, very few unit tests, so feedback is slow and failures are vague.",
    "Duplicating every unit-level edge case in E2E tests, multiplying run time for no extra confidence.",
    "Treating the pyramid as a strict ratio; it is a heuristic about cost and feedback, not a quota.",
  ],
  debugging: [
    "When an E2E test fails, try to reproduce the bug at a lower level (API call, unit test); if you can, add that lower-level test too.",
    "If many E2E tests fail together, suspect a shared integration problem (environment, auth, API contract) before individual tests.",
  ],
  relatedNotes: ["e2e-what-is-e2e-testing", "e2e-test-scenarios-and-cases"],
  relatedLessons: ["debugging-unit-testing", "react-testing", "functions-pure-functions", "arrays-reduce"],
  practice:
    "Take the feature \"apply a discount code at checkout\". List six risks (e.g. expired code, code stacking, rounding, UI shows new total) and label each with the lowest test level that can catch it.",
  docs: [
    { title: "Martin Fowler: Test Pyramid", url: "https://martinfowler.com/bliki/TestPyramid.html" },
    { title: "Martin Fowler: The Practical Test Pyramid", url: "https://martinfowler.com/articles/practical-test-pyramid.html" },
    { title: "Testing Library: Guiding principles", url: "https://testing-library.com/docs/guiding-principles" },
    { title: "Playwright: API testing", url: "https://playwright.dev/docs/api-testing" },
  ],
};
