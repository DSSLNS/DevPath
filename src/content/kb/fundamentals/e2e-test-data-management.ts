import type { KbNote } from "@/content/types";

export const e2eTestDataManagement: KbNote = {
  id: "e2e-test-data-management",
  slug: "e2e-test-data-management",
  category: "fundamentals",
  title: "Test Data Management",
  summary:
    "Where test data comes from, how to create it, how to keep it unique and how to clean it up so tests never fight over the same user, cart or product.",
  tech: ["cypress", "playwright", "javascript"],
  difficulty: "intermediate",
  tags: ["test data", "seeding", "fixtures", "factories", "cleanup"],
  prerequisites: ["What an E2E test is", "JavaScript objects", "Making HTTP requests (`fetch`, `cy.request`, `request` fixture)"],
  explanation: [
    {
      kind: "paragraph",
      text: "E2E tests need data: users who can log in, products in stock, discount codes that are valid. Most flaky suites are really **data problems**: two tests edit the same account, a product sells out, a code expires. Test data management is deciding, for each piece of data, *who creates it, when, and who cleans it up*.",
    },
    {
      kind: "table",
      caption: "Common data strategies",
      headers: ["Strategy", "How", "Pros", "Cons"],
      rows: [
        ["Static fixtures", "JSON files loaded with `cy.fixture` or `import`", "Simple, versioned with tests", "Only good for read-only or stubbed data"],
        ["Seed per test via API", "Create user/order through an API in `beforeEach`", "Isolated, fast, realistic", "Needs test or admin APIs"],
        ["Database seed / reset", "Script or `cy.task` resets DB to a known snapshot", "Fully deterministic", "Hard on shared environments; slow for big DBs"],
        ["Shared long-lived accounts", "A few pre-created users", "Zero setup", "Tests interfere with each other; avoid for writes"],
      ],
    },
    {
      kind: "list",
      items: [
        "**Unique per run**: add a run id or timestamp to emails/usernames so parallel runs don't collide.",
        "**Created by the test that needs it**: the test owns its data and does not rely on another test.",
        "**Minimal**: create only the fields the scenario depends on, with sensible defaults (see *test data builders*).",
        "**Safe**: never use real customer data or real card numbers; use provider test cards and fake personal data.",
      ],
    },
    {
      kind: "callout",
      tone: "danger",
      title: "Never hard-code secrets",
      text: "Passwords and API keys for test accounts belong in environment variables (`Cypress.env('ADMIN_TOKEN')`, `process.env.ADMIN_TOKEN`), not in the repository.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Unique values per run",
      code: `const runId = "run42"; // in real tests: Date.now().toString(36) or crypto.randomUUID()
const email = "qa+" + runId + "@example.test";
console.log(email);`,
      output: "qa+run42@example.test",
    },
    {
      kind: "code",
      language: "js",
      title: "Cypress: seed via API",
      code: `beforeEach(() => {
  cy.request("POST", "/api/test/users", { email }).its("body").as("user");
});`,
    },
  ],
  code: {
    title: "Per-test user creation and cleanup in Playwright",
    language: "ts",
    code: `import { test as base, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

type TestUser = { id: string; email: string; password: string };

const test = base.extend<{ user: TestUser }>({
  user: async ({ request }, use) => {
    // Arrange: create a brand-new user just for this test
    const email = "qa+" + randomUUID() + "@example.test";
    const password = "Test-Password-123";
    const res = await request.post("/api/test/users", {
      data: { email, password },
      headers: { Authorization: "Bearer " + process.env.TEST_ADMIN_TOKEN },
    });
    expect(res.ok()).toBeTruthy();
    const { id } = await res.json();

    await use({ id, email, password });

    // Teardown runs even if the test failed
    await request.delete("/api/test/users/" + id, {
      headers: { Authorization: "Bearer " + process.env.TEST_ADMIN_TOKEN },
    });
  },
});

test("new user sees an empty order history", async ({ page, user }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("link", { name: "Orders" }).click();
  await expect(page.getByText("You have no orders yet")).toBeVisible();
});`,
  },
  walkthrough: [
    { line: 'const email = "qa+" + randomUUID() + "@example.test";', explanation: "A UUID makes the email unique, so parallel workers and repeated runs never collide." },
    { line: 'headers: { Authorization: "Bearer " + process.env.TEST_ADMIN_TOKEN },', explanation: "The admin token comes from the environment, never from source control." },
    { line: "await use({ id, email, password });", explanation: "Everything before `use` is setup; the test runs while `use` is awaited; everything after is teardown." },
    { line: 'await request.delete("/api/test/users/" + id, {', explanation: "Cleanup keeps the environment tidy. Fixture teardown runs even when the test fails." },
  ],
  whenToUse: [
    "Any test that writes data (orders, profile changes, carts) should create its own records.",
    "Static fixtures are fine for stubbed API responses and read-only reference data.",
    "Use a full database reset only in environments the test suite owns exclusively (local, CI containers).",
  ],
  mistakes: [
    "Sharing one test account across all tests, so tests that change the profile or cart break each other in parallel.",
    "Relying on data that someone created manually in a shared environment and that can be deleted at any time.",
    "Hard-coding IDs (`/orders/1234`) that only exist in one environment.",
    "Doing cleanup *only* at the end of the test body, where it is skipped when an assertion fails.",
  ],
  debugging: [
    "Log or attach the generated data (email, ids) to the report so you can find the record when a test fails.",
    "If a test passes alone but fails in the suite, look for shared data that another test modified.",
    "Check the environment's data directly (admin UI or API) to confirm the precondition really existed.",
  ],
  relatedNotes: ["e2e-test-isolation"],
  relatedLessons: ["objects-object-literals", "networking-crud-requests", "tooling-environment-variables", "modern-js-template-literals"],
  practice:
    "Write a helper `uniqueEmail(prefix)` that returns `prefix+<unique>@example.test`, then use it in a `beforeEach` that creates a user via `cy.request` or Playwright's `request` fixture.",
  docs: [
    { title: "Playwright: Fixtures (setup and teardown)", url: "https://playwright.dev/docs/test-fixtures" },
    { title: "Cypress: cy.request", url: "https://docs.cypress.io/api/commands/request" },
    { title: "Cypress: cy.task (database seeding)", url: "https://docs.cypress.io/api/commands/task" },
  ],
  versionNote: "Playwright 1.40+, Cypress 13+.",
};
