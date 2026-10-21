import type { KbNote } from "@/content/types";

export const e2eWhatIsE2eTesting: KbNote = {
  id: "e2e-what-is-e2e-testing",
  slug: "e2e-what-is-e2e-testing",
  category: "fundamentals",
  title: "What End-to-End Testing Is",
  summary:
    "End-to-end (E2E) tests drive a real browser through a real user journey (UI, API, database and third parties together) to prove the whole system delivers value to a user.",
  tech: ["cypress", "playwright"],
  difficulty: "beginner",
  tags: ["e2e", "fundamentals", "user journeys", "browser automation"],
  prerequisites: [
    "Basic HTML: elements, attributes and forms",
    "How a browser talks to a server over HTTP",
    "Comfort reading simple JavaScript functions",
  ],
  explanation: [
    {
      kind: "paragraph",
      text: "An **end-to-end test** starts the application the way a user would (open a URL, click, type, submit) and checks what the user can observe: text on the page, the URL, a confirmation message, an order in their account. It exercises every layer between the user and the data: the frontend bundle, the browser, the network, the API, the database and often third-party services.",
    },
    {
      kind: "paragraph",
      text: "Unit tests answer *\"does this function work?\"*. E2E tests answer *\"can a customer actually buy a product?\"*. Because they touch everything, E2E tests catch integration problems that no lower-level test can see (a renamed API field, a broken redirect, a missing environment variable), but they are also the slowest and most expensive tests to run and maintain.",
    },
    {
      kind: "diagram",
      title: "What an E2E test exercises",
      variant: "flow",
      steps: [
        { label: "Test runner", detail: "Cypress or Playwright drives a real browser" },
        { label: "Browser + frontend", detail: "HTML, CSS, JavaScript bundle, routing" },
        { label: "Network", detail: "HTTP requests, cookies, CORS, redirects" },
        { label: "Backend API", detail: "Business rules, authentication, validation" },
        { label: "Data + services", detail: "Database, search index, payment sandbox, email" },
      ],
    },
    {
      kind: "table",
      caption: "What E2E tests are good and bad at",
      headers: ["Strength", "Cost"],
      rows: [
        ["Prove critical user journeys work in a real browser", "Slow: seconds per test instead of milliseconds"],
        ["Catch integration and configuration bugs", "Many moving parts, so more causes of flakiness"],
        ["Give release confidence to the whole team", "Failures can be harder to localise"],
        ["Document behaviour in user language", "Need stable environments and test data"],
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: "Think in journeys, not pages",
      text: "Good E2E tests follow a goal: *search → product page → add to cart → checkout*. Test the business-critical paths end to end and push edge-case permutations (every validation message, every price rounding rule) down to unit or component tests.",
    },
    {
      kind: "terms",
      items: [
        { term: "System under test (SUT)", definition: "The application being tested, deployed in a test environment." },
        { term: "User journey", definition: "A sequence of steps a real user takes to reach a goal, such as placing an order." },
        { term: "Test runner", definition: "The tool that executes tests and reports results, e.g. Cypress or Playwright Test." },
      ],
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Cypress: the shape of an E2E test",
      code: `describe("feature", () => {
  it("user can reach a goal", () => {
    cy.visit("/start-page");             // arrange: open the app
    cy.get("[data-testid=action]").click(); // act: do what the user does
    cy.contains("Expected result").should("be.visible"); // assert: what the user sees
  });
});`,
    },
    {
      kind: "code",
      language: "ts",
      title: "Playwright: the same shape",
      code: `import { test, expect } from "@playwright/test";

test("user can reach a goal", async ({ page }) => {
  await page.goto("/start-page");
  await page.getByTestId("action").click();
  await expect(page.getByText("Expected result")).toBeVisible();
});`,
    },
  ],
  code: {
    title: "A complete search-to-product journey (Cypress and Playwright)",
    language: "ts",
    code: `// cypress/e2e/search.cy.js
describe("Product search", () => {
  it("finds a product and opens its detail page", () => {
    cy.visit("/");
    cy.get("[data-testid=search-input]").type("running shoes{enter}");
    cy.url().should("include", "/search?q=running");
    cy.get("[data-testid=product-card]").should("have.length.greaterThan", 0);
    cy.get("[data-testid=product-card]").first().click();
    cy.get("[data-testid=product-title]").should("be.visible");
    cy.get("[data-testid=add-to-cart]").should("be.enabled");
  });
});

// tests/search.spec.ts
import { test, expect } from "@playwright/test";

test("finds a product and opens its detail page", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("search-input").fill("running shoes");
  await page.getByTestId("search-input").press("Enter");
  await expect(page).toHaveURL(/\\/search\\?q=running/);
  const cards = page.getByTestId("product-card");
  await expect(cards.first()).toBeVisible();
  await cards.first().click();
  await expect(page.getByTestId("product-title")).toBeVisible();
  await expect(page.getByTestId("add-to-cart")).toBeEnabled();
});`,
  },
  walkthrough: [
    { line: 'cy.visit("/");', explanation: "Opens the app relative to `baseUrl` from the config, exactly like a user typing the address." },
    { line: 'cy.get("[data-testid=search-input]").type("running shoes{enter}");', explanation: "Finds the search box with a stable test id and types like a real keyboard; `{enter}` submits the form." },
    { line: 'cy.url().should("include", "/search?q=running");', explanation: "Asserts on something the user can observe (the URL). `should` retries until it passes or times out." },
    { line: 'await expect(page).toHaveURL(/\\/search\\?q=running/);', explanation: "Playwright's web-first assertion: it re-checks the URL until it matches, so no manual wait is needed." },
    { line: 'await expect(page.getByTestId("add-to-cart")).toBeEnabled();', explanation: "Ends the journey with an assertion about the user's goal: the product can be bought." },
  ],
  whenToUse: [
    "Critical revenue or safety paths: sign-up, login, search, checkout, payment, password reset.",
    "Smoke tests after a deployment to prove the environment is wired up correctly.",
    "Flows that cross many services where integration bugs are likely.",
    "Not for exhaustive input permutations: those belong in unit or component tests.",
  ],
  mistakes: [
    "Writing hundreds of E2E tests for logic that a unit test could cover in milliseconds, making the suite slow and fragile.",
    "Asserting on implementation details (CSS classes, internal state) instead of what the user can see or do.",
    "Testing many unrelated features in one giant test, so one failure hides everything after it.",
    "Running E2E tests against a shared, unstable environment and then blaming the tool for flakiness.",
  ],
  debugging: [
    "Re-run the single failing test in headed/interactive mode (`npx cypress open`, `npx playwright test --ui`) and watch the journey.",
    "Check whether the failure is in the UI, the network or the data: open the network panel or trace before changing the test.",
    "Compare against a manual run of the same journey in the same environment to rule out environment problems.",
  ],
  relatedNotes: ["e2e-test-pyramid", "e2e-test-scenarios-and-cases", "e2e-test-environments"],
  relatedLessons: ["introduction-how-websites-work", "introduction-browsers-servers-http", "debugging-unit-testing", "react-testing"],
  practice:
    "Pick an online shop you use. Write down its three most business-critical user journeys as one sentence each (goal + start + end), then sketch the steps and the single most important assertion for each.",
  docs: [
    { title: "Cypress: Introduction to Cypress", url: "https://docs.cypress.io/app/core-concepts/introduction-to-cypress" },
    { title: "Playwright: Writing tests", url: "https://playwright.dev/docs/writing-tests" },
    { title: "Martin Fowler: The Practical Test Pyramid", url: "https://martinfowler.com/articles/practical-test-pyramid.html" },
  ],
  versionNote: "Examples target Cypress 13+ and Playwright 1.40+.",
};
