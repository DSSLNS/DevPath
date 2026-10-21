import type { KbNote } from "@/content/types";

export const e2eAssertions: KbNote = {
  id: "e2e-assertions",
  slug: "e2e-assertions",
  category: "fundamentals",
  title: "Assertions in E2E Tests",
  summary:
    "Assertions are the checks that make a test a test. Learn retrying (web-first) assertions vs one-shot assertions in Cypress and Playwright, and what to assert on.",
  tech: ["cypress", "playwright"],
  difficulty: "beginner",
  tags: ["assertions", "should", "expect", "retry-ability", "web-first assertions"],
  prerequisites: ["Writing a basic Cypress or Playwright test", "Selecting elements on a page"],
  explanation: [
    {
      kind: "paragraph",
      text: "An **assertion** compares what happened with what should happen and fails the test if they differ. A test without assertions only proves that clicks did not throw, which is not much.",
    },
    {
      kind: "paragraph",
      text: "Web pages change asynchronously, so E2E tools provide **retrying assertions**. Cypress's `.should()` re-runs the previous query and the assertion until it passes or `defaultCommandTimeout` (4s by default) expires. Playwright's **web-first assertions** (`await expect(locator).toHaveText(...)`) re-check the locator until the expectation is met or the `expect` timeout (5s by default) expires.",
    },
    {
      kind: "table",
      caption: "Retrying vs non-retrying",
      headers: ["", "Cypress", "Playwright"],
      rows: [
        ["Retrying (preferred for UI)", "`cy.get(sel).should('have.text', 'Paid')`", "`await expect(locator).toHaveText('Paid')`"],
        ["One-shot (plain values)", "`expect(value).to.equal(3)` inside `.then()`", "`expect(value).toBe(3)` on an already-resolved value"],
        ["Polling a function", "`.should(($el) => { ... })` callback", "`await expect.poll(() => fn()).toBe(3)`"],
      ],
    },
    {
      kind: "list",
      items: [
        "Assert on **user-visible outcomes**: text, visibility, URL, enabled/disabled state, counts.",
        "Assert on **network results** when the UI alone can't prove it: request body sent, status returned.",
        "Prefer **specific** assertions (`toHaveText('$59.98')`) over vague ones (`toBeVisible()` on the whole page).",
        "Use **negative assertions** carefully: `should('not.exist')` passes immediately if the element hasn't appeared *yet*.",
      ],
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Cypress assertions",
      code: `cy.get("[data-testid=cart-count]").should("have.text", "2");
cy.get("[data-testid=checkout]").should("be.enabled").and("be.visible");
cy.url().should("include", "/checkout");
cy.get("[data-testid=product-card]").should("have.length", 12);`,
    },
    {
      kind: "code",
      language: "ts",
      title: "Playwright web-first assertions",
      code: `await expect(page.getByTestId("cart-count")).toHaveText("2");
await expect(page.getByRole("button", { name: "Checkout" })).toBeEnabled();
await expect(page).toHaveURL(/\\/checkout/);
await expect(page.getByTestId("product-card")).toHaveCount(12);`,
    },
  ],
  code: {
    title: "Asserting a cart update in both tools",
    language: "ts",
    code: `// Cypress
it("updates the cart total when quantity changes", () => {
  cy.intercept("PATCH", "/api/cart/items/*").as("updateItem");
  cy.visit("/cart");
  cy.get("[data-testid=qty-input]").clear().type("2");
  cy.wait("@updateItem").its("request.body").should("deep.equal", { qty: 2 });
  cy.get("[data-testid=line-total]").should("have.text", "$59.98");
  cy.get("[data-testid=cart-total]").should("contain", "$59.98");
});

// Playwright
import { test, expect } from "@playwright/test";

test("updates the cart total when quantity changes", async ({ page }) => {
  await page.goto("/cart");
  const update = page.waitForRequest((r) => r.url().includes("/api/cart/items/") && r.method() === "PATCH");
  await page.getByTestId("qty-input").fill("2");
  expect((await update).postDataJSON()).toEqual({ qty: 2 });
  await expect(page.getByTestId("line-total")).toHaveText("$59.98");
  await expect(page.getByTestId("cart-total")).toContainText("$59.98");
});`,
  },
  walkthrough: [
    { line: 'cy.wait("@updateItem").its("request.body").should("deep.equal", { qty: 2 });', explanation: "Waits for the real request and asserts on the payload the UI sent, which proves the app talked to the API correctly." },
    { line: 'cy.get("[data-testid=line-total]").should("have.text", "$59.98");', explanation: "`should` retries the `get` and the text check together until the re-rendered value appears." },
    { line: "expect((await update).postDataJSON()).toEqual({ qty: 2 });", explanation: "A one-shot `expect` is fine here because the request object is already resolved; no retrying needed." },
    { line: 'await expect(page.getByTestId("line-total")).toHaveText("$59.98");', explanation: "The `await` is essential: without it the assertion is never awaited and cannot fail the test." },
  ],
  whenToUse: [
    "Every test needs at least one assertion about the outcome it claims to verify.",
    "Use retrying assertions for anything rendered in the page; one-shot assertions for values you already have.",
    "Add intermediate assertions when the next step depends on a state being reached (e.g. modal is open).",
  ],
  mistakes: [
    "Forgetting `await` before Playwright's `expect(locator)` so the assertion never actually runs to completion.",
    "Reading text with `.invoke('text')`/`innerText()` and comparing once, losing retry-ability and creating flakiness.",
    "Using `.should('not.exist')` right after an action, before the element even had a chance to appear.",
    "Asserting only `toBeVisible()` on a container, which passes even when the content inside is wrong.",
  ],
  debugging: [
    "Read the assertion error: it shows expected vs received and, in Playwright, the call log of each retry.",
    "If a retrying assertion times out, check whether the selector matches the element you think (use the Cypress selector playground or Playwright's pick locator).",
    "Temporarily increase the timeout only to diagnose (`{ timeout: 10000 }`); if it then passes, find out *why* the app is slow.",
  ],
  relatedNotes: ["e2e-flaky-tests"],
  relatedLessons: ["debugging-unit-testing", "variables-equality", "dom-updating-content"],
  practice:
    "Write a test for a newsletter form that asserts (1) the POST request body contains the email, (2) a success message with the exact text appears, and (3) the input is cleared. Use retrying assertions for every UI check.",
  docs: [
    { title: "Playwright: Assertions", url: "https://playwright.dev/docs/test-assertions" },
    { title: "Cypress: Assertions reference", url: "https://docs.cypress.io/app/references/assertions" },
    { title: "Cypress: Retry-ability", url: "https://docs.cypress.io/app/core-concepts/retry-ability" },
  ],
  versionNote: "Cypress 12+ retries the whole query chain before `.should()`; Playwright 1.40+.",
};
