import type { KbNote } from "@/content/types";

export const e2eTestIsolation: KbNote = {
  id: "e2e-test-isolation",
  slug: "e2e-test-isolation",
  category: "fundamentals",
  title: "Test Isolation",
  summary:
    "An isolated test sets up everything it needs, does not depend on other tests, and leaves no state that changes another test's result. Both Cypress and Playwright isolate browser state by default.",
  tech: ["cypress", "playwright"],
  difficulty: "intermediate",
  tags: ["isolation", "test independence", "browser context", "cy.session", "storageState"],
  prerequisites: ["Writing a basic Cypress or Playwright test", "Cookies and localStorage basics"],
  explanation: [
    {
      kind: "paragraph",
      text: "A test is **isolated** when it gives the same result whether it runs alone, first, last, in parallel or after a failure. Isolation has two halves: **browser state** (cookies, localStorage, open page) and **server state** (users, carts, orders in the database).",
    },
    {
      kind: "table",
      caption: "What each tool isolates for you",
      headers: ["", "Cypress (12+)", "Playwright"],
      rows: [
        ["Browser state", "`testIsolation: true` (default) clears cookies, localStorage, sessionStorage and visits `about:blank` before each test", "Every test gets a fresh `BrowserContext` (like a new incognito profile)"],
        ["Fast re-login", "`cy.session()` caches and restores login state", "`storageState` saved by a setup project"],
        ["Server/database state", "Your responsibility", "Your responsibility"],
      ],
    },
    {
      kind: "paragraph",
      text: "Tools can wipe the browser, but they cannot undo a row you inserted on the server. Server-side isolation comes from **unique data per test** (new user, new cart) or resetting the data the test owns.",
    },
    {
      kind: "callout",
      tone: "tip",
      title: "Quick isolation check",
      text: "Run one spec alone with `.only` / `--grep`, then run the suite in random order or with more workers. If results change, something is shared.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Cypress: cache login with cy.session",
      code: `Cypress.Commands.add("login", (email, password) => {
  cy.session([email, password], () => {
    cy.request("POST", "/api/login", { email, password });
  });
});`,
    },
    {
      kind: "code",
      language: "ts",
      title: "Playwright: reuse a signed-in state",
      code: `test.use({ storageState: "playwright/.auth/user.json" });`,
    },
  ],
  code: {
    title: "Isolated tests with fresh browser state and their own server data (Cypress)",
    language: "js",
    code: `// cypress/e2e/wishlist.cy.js
describe("Wishlist", () => {
  beforeEach(() => {
    const email = "qa+" + Date.now() + "@example.test";
    // Server state: each test gets its own new user
    cy.request("POST", "/api/test/users", { email, password: "Test-Password-123" });
    // Browser state: log in once per user and cache the session
    cy.session(email, () => {
      cy.request("POST", "/api/login", { email, password: "Test-Password-123" });
    });
    cy.visit("/products/classic-tee");
  });

  it("adds a product to the wishlist", () => {
    cy.get("[data-testid=wishlist-toggle]").click();
    cy.get("[data-testid=wishlist-count]").should("have.text", "1");
  });

  it("starts with an empty wishlist", () => {
    // Passes regardless of whether the previous test ran, failed or was skipped
    cy.get("[data-testid=wishlist-count]").should("have.text", "0");
  });
});`,
  },
  walkthrough: [
    { line: 'const email = "qa+" + Date.now() + "@example.test";', explanation: "Each test creates its own user, so the wishlist added in test 1 cannot leak into test 2." },
    { line: "cy.session(email, () => {", explanation: "Caches cookies/localStorage per id. With test isolation on, Cypress restores the session after clearing browser state." },
    { line: 'cy.visit("/products/classic-tee");', explanation: "Because isolation resets the page to `about:blank`, each test must visit its own starting page." },
    { line: 'cy.get("[data-testid=wishlist-count]").should("have.text", "0");', explanation: "This test does not assume anything about the order tests run in." },
  ],
  whenToUse: [
    "Always: isolation is the default goal for every E2E test.",
    "Use `cy.session` / `storageState` to keep isolated tests fast when login is expensive.",
    "Only consider `test.describe.configure({ mode: 'serial' })` for genuinely sequential flows, and prefer to avoid it.",
  ],
  mistakes: [
    "Setting `testIsolation: false` in Cypress to make a chained set of tests pass, hiding inter-test dependencies.",
    "Relying on state created by a previous `it` block (e.g. test 2 expects the cart test 1 filled).",
    "Assuming tool isolation also resets the database; server data still needs unique records or resets.",
  ],
  debugging: [
    "If a test only fails when run after another, diff the server data both tests touch.",
    "In Cypress, check the command log for the `session` entry: it shows whether the session was created, restored or recreated after failed validation.",
    "Run Playwright with `--repeat-each=3 --workers=4` to surface isolation problems quickly.",
  ],
  relatedNotes: ["e2e-test-data-management", "e2e-flaky-tests"],
  relatedLessons: ["dom-cookies", "dom-local-session-storage", "networking-authentication"],
  practice:
    "Take two tests where the second relies on the first (e.g. \"create address\" then \"edit address\"). Refactor so the edit test creates its own address via API in `beforeEach` and passes when run alone.",
  docs: [
    { title: "Cypress: Test isolation", url: "https://docs.cypress.io/app/core-concepts/test-isolation" },
    { title: "Cypress: cy.session", url: "https://docs.cypress.io/api/commands/session" },
    { title: "Playwright: Isolation (browser contexts)", url: "https://playwright.dev/docs/browser-contexts" },
    { title: "Playwright: Authentication", url: "https://playwright.dev/docs/auth" },
  ],
  versionNote: "`testIsolation` and stable `cy.session` are Cypress 12+; Playwright 1.40+.",
};
