import type { KbNote } from "@/content/types";

export const e2eTestScenariosAndCases: KbNote = {
  id: "e2e-test-scenarios-and-cases",
  slug: "e2e-test-scenarios-and-cases",
  category: "fundamentals",
  title: "Test Scenarios and Test Cases",
  summary:
    "A scenario describes *what* to verify from a user's point of view; a test case describes *exactly how*: preconditions, steps, data and expected results. Good automation starts from well-written cases.",
  tech: ["cypress", "playwright"],
  difficulty: "beginner",
  tags: ["test design", "scenarios", "test cases", "acceptance criteria"],
  prerequisites: ["What an E2E test is", "Reading acceptance criteria or user stories"],
  explanation: [
    {
      kind: "paragraph",
      text: "A **test scenario** is a one-line statement of something to verify, e.g. *\"A guest can check out with a saved address\"*. A **test case** turns it into an executable recipe: preconditions, test data, numbered steps and an expected result for each important step. One scenario usually produces several cases (happy path, validation errors, edge cases).",
    },
    {
      kind: "table",
      caption: "Anatomy of a test case",
      headers: ["Field", "Example"],
      rows: [
        ["ID / title", "CHK-003: Checkout rejects an expired card"],
        ["Preconditions", "Cart contains 1 in-stock product; user is a guest"],
        ["Test data", "Test card `4000 0000 0000 0069` (provider test card for expired), expiry 12/30"],
        ["Steps", "1. Open cart 2. Click Checkout 3. Fill address 4. Pay"],
        ["Expected result", "Error *\"Your card has expired\"* is shown, no order is created"],
        ["Priority / tags", "P1, `@checkout @negative`"],
      ],
    },
    {
      kind: "list",
      items: [
        "**Positive cases** prove the feature works with valid input.",
        "**Negative cases** prove the system rejects invalid input safely.",
        "**Boundary cases** probe limits: quantity 0, 1, max stock, max stock + 1.",
        "**State-based cases** check behaviour that depends on prior state: logged in vs guest, empty vs full cart.",
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: "Given / When / Then",
      text: "Writing cases as *Given* (preconditions) / *When* (action) / *Then* (observable outcome) maps directly onto *arrange / act / assert* in code and keeps one behaviour per test.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "text",
      title: "Scenario → cases",
      code: `Scenario: Guest checkout
  Case 1 (positive): valid address + valid test card -> order confirmation
  Case 2 (negative): missing postcode -> inline validation error
  Case 3 (negative): declined test card -> payment error, cart kept
  Case 4 (boundary): quantity = max stock -> allowed; max + 1 -> blocked`,
    },
    {
      kind: "code",
      language: "js",
      title: "Mapping a case to a test title",
      code: `describe("Checkout (guest)", () => {
  it("shows an inline error when postcode is missing", () => { /* ... */ });
});`,
    },
  ],
  code: {
    title: "Turning a written test case into a Playwright test",
    language: "ts",
    code: `import { test, expect } from "@playwright/test";

// CHK-002: Guest checkout shows an inline error when postcode is missing
// Given a guest with one product in the cart
// When they submit the address form without a postcode
// Then an inline error is shown and they stay on the address step
test.describe("Checkout (guest)", () => {
  test.beforeEach(async ({ page }) => {
    // Precondition: seed the cart through the API instead of the UI
    await page.request.post("/api/test/cart", { data: { items: [{ sku: "TSHIRT-M", qty: 1 }] } });
    await page.goto("/checkout/address");
  });

  test("CHK-002 shows an inline error when postcode is missing @negative", async ({ page }) => {
    await page.getByLabel("Full name").fill("Ada Lovelace");
    await page.getByLabel("Street").fill("1 Test Street");
    await page.getByLabel("City").fill("London");
    await page.getByRole("button", { name: "Continue to payment" }).click();

    await expect(page.getByText("Postcode is required")).toBeVisible();
    await expect(page).toHaveURL(/\\/checkout\\/address/);
  });
});`,
  },
  walkthrough: [
    { line: "// CHK-002: Guest checkout shows an inline error when postcode is missing", explanation: "Keeping the case id in a comment or title links the automated test back to the written case and to reports." },
    { line: 'await page.request.post("/api/test/cart", { data: { items: [{ sku: "TSHIRT-M", qty: 1 }] } });', explanation: "Preconditions are set up quickly through an API (a hypothetical test-only endpoint here), not by clicking through the shop." },
    { line: 'test("CHK-002 shows an inline error when postcode is missing @negative", ...', explanation: "The title states the behaviour; the `@negative` tag lets you filter with `--grep @negative`." },
    { line: "await expect(page).toHaveURL(/\\/checkout\\/address/);", explanation: "A second assertion confirms the user was not moved forward, which is part of the expected result." },
  ],
  whenToUse: [
    "Before automating: write the cases so reviewers can check coverage without reading code.",
    "When acceptance criteria are vague: writing negative and boundary cases exposes missing requirements.",
    "When prioritising which cases to automate first (critical, stable, frequently run).",
  ],
  mistakes: [
    "Writing cases with vague expected results such as \"it works\" or \"page loads correctly\".",
    "Combining many behaviours into one case, so a failure does not say which behaviour broke.",
    "Only writing happy paths; most production bugs live in negative and boundary cases.",
    "Automating every manual case blindly instead of choosing the right level for each.",
  ],
  debugging: [
    "If a test fails and nobody knows what it was supposed to prove, the case is under-specified: rewrite the title and expected result first.",
    "When a test is flaky, check whether its preconditions are actually guaranteed or merely assumed.",
  ],
  relatedNotes: ["e2e-what-is-e2e-testing", "e2e-assertions", "e2e-test-data-management"],
  relatedLessons: ["debugging-unit-testing", "dom-forms-validation", "control-flow-if-else"],
  practice:
    "For the scenario \"A user can change their password\", write one positive, two negative and one boundary test case with preconditions, steps and expected results. Then turn the positive case into a Cypress or Playwright test title.",
  docs: [
    { title: "Playwright: Annotations and tags", url: "https://playwright.dev/docs/test-annotations" },
    { title: "Cypress: Writing and organizing tests", url: "https://docs.cypress.io/app/core-concepts/writing-and-organizing-tests" },
    { title: "Martin Fowler: Given When Then", url: "https://martinfowler.com/bliki/GivenWhenThen.html" },
  ],
  versionNote: "Tag syntax in titles works in all Playwright Test versions; the `tag` option is Playwright 1.42+.",
};
