import type { KbNote } from "@/content/types";

export const cyDescribeIt: KbNote = {
  id: "cy-describe-it",
  slug: "cy-describe-it",
  category: "cypress",
  title: "describe, it and beforeEach (Mocha Structure)",
  summary:
    "Cypress uses Mocha's BDD interface: `describe` groups tests, `it` defines one test, and `beforeEach` runs shared setup before every test. `.only` and `.skip` focus or disable tests while you work.",
  tech: ["cypress", "javascript"],
  difficulty: "beginner",
  tags: ["mocha", "describe", "it", "context", "only", "skip"],
  prerequisites: ["Arrow functions and callbacks", "A spec file in `cypress/e2e`"],
  explanation: [
    {
      kind: "paragraph",
      text:
        "Cypress bundles Mocha, so `describe`, `context`, `it`, `specify`, `before`, `beforeEach`, `after` and `afterEach` are globals in every spec. `context` is an alias of `describe`; `specify` is an alias of `it`.",
    },
    {
      kind: "list",
      items: [
        "`describe(name, fn)` groups related tests and can be nested.",
        "`it(name, fn)` is a single test. It passes if every command and assertion in it passes.",
        "`beforeEach(fn)` runs before each `it` in its `describe` (and nested ones). Use it for `cy.visit` and setup.",
        "`it.only` / `describe.only` run only the focused tests; `it.skip` / `describe.skip` mark them pending.",
        "Tests and suites accept a config object: `it('...', { retries: 2, viewportWidth: 375 }, () => {})`.",
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Test isolation",
      text:
        "Since Cypress 12, `testIsolation` is on by default: before each test the page is cleared and cookies, localStorage and sessionStorage are wiped. Every `it` must set up what it needs (usually in `beforeEach`).",
    },
    {
      kind: "callout",
      tone: "tip",
      title: "Name tests as behaviour",
      text:
        "Read the suite + test name as a sentence: *'Login › shows an error for a wrong password'*. Clear names make CI failures understandable without opening the code.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Structure",
      code:
        "describe('Feature', () => {\n  beforeEach(() => { /* runs before every it */ })\n\n  context('when logged out', () => {\n    it('does something', () => { /* commands */ })\n    it.skip('not ready yet', () => {})\n  })\n\n  it('runs on a phone viewport', { viewportWidth: 375, viewportHeight: 667 }, () => {\n    // per-test configuration\n  })\n})",
    },
  ],
  code: {
    title: "cypress/e2e/auth/login.cy.js",
    language: "js",
    code:
      "describe('Login', () => {\n  beforeEach(() => {\n    cy.visit('/login')\n  })\n\n  it('logs in with valid credentials', () => {\n    cy.get('[data-cy=email]').type('shopper@example.com')\n    cy.get('[data-cy=password]').type('Test1234!', { log: false })\n    cy.get('[data-cy=login-submit]').click()\n    cy.location('pathname').should('eq', '/account')\n    cy.get('[data-cy=welcome]').should('contain', 'Welcome back')\n  })\n\n  context('with invalid input', () => {\n    it('shows an error for a wrong password', () => {\n      cy.get('[data-cy=email]').type('shopper@example.com')\n      cy.get('[data-cy=password]').type('wrong-password')\n      cy.get('[data-cy=login-submit]').click()\n      cy.get('[data-cy=login-error]')\n        .should('be.visible')\n        .and('contain', 'Invalid email or password')\n    })\n\n    it('requires an email', () => {\n      cy.get('[data-cy=login-submit]').click()\n      cy.get('[data-cy=email-error]').should('have.text', 'Email is required')\n    })\n  })\n})",
  },
  walkthrough: [
    { line: "describe('Login', () => {", explanation: "Top-level suite. Its name prefixes every test name in reports." },
    { line: "beforeEach(() => {\n    cy.visit('/login')\n  })", explanation: "Each test starts on a fresh login page; with test isolation the previous test's state is gone anyway." },
    { line: "cy.get('[data-cy=password]').type('Test1234!', { log: false })", explanation: "`log: false` keeps the password out of the Command Log and screenshots." },
    { line: "context('with invalid input', () => {", explanation: "A nested group for negative cases. It inherits the outer `beforeEach`." },
    { line: ".and('contain', 'Invalid email or password')", explanation: "`and` is an alias of `should`, chaining a second assertion on the same subject." },
  ],
  whenToUse: [
    "Every spec: `describe` + `it` is the basic shape of Cypress tests.",
    "Use nested `context` blocks to separate scenarios (logged in / logged out, empty cart / full cart).",
    "Use `.only` locally to iterate quickly on one test; never commit it.",
  ],
  mistakes: [
    "Committing `it.only`, which silently skips the rest of the suite in CI. Add a lint rule (`mocha/no-exclusive-tests`) to catch it.",
    "Writing tests that depend on the previous `it` (test 2 assumes test 1 logged in). With test isolation this fails.",
    "Using arrow functions and then trying to use `this.alias`; Mocha's `this` context only works with `function () {}` callbacks.",
    "Putting commands directly inside `describe` (outside any hook or `it`); they run at load time, not as part of a test.",
  ],
  debugging: [
    "Use `it.only` to isolate a failing test, then remove it before committing.",
    "If a hook fails, Cypress marks the remaining tests in that suite as skipped; scroll up to the first failure.",
    "Check the per-test config object if a test behaves differently (viewport, retries) from its siblings.",
  ],
  relatedNotes: ["cy-spec-structure"],
  relatedLessons: ["functions-callbacks", "functions-arrow-functions", "debugging-unit-testing"],
  practice:
    "Write a `describe('Product listing')` suite with a `beforeEach` that visits `/products`, one test that checks the grid renders, and a nested `context('on mobile')` test with `viewportWidth: 375` that checks the filter drawer button is visible.",
  docs: [
    { title: "Writing and organizing tests", url: "https://docs.cypress.io/app/core-concepts/writing-and-organizing-tests" },
    { title: "Test isolation", url: "https://docs.cypress.io/app/core-concepts/test-isolation" },
    { title: "Mocha BDD interface", url: "https://mochajs.org/#bdd" },
  ],
  versionNote: "Cypress 12+ (test isolation on by default)",
};
