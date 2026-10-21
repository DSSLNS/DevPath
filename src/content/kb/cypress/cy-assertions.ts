import type { KbNote } from "@/content/types";

export const cyAssertions: KbNote = {
  id: "cy-assertions",
  slug: "cy-assertions",
  category: "cypress",
  title: "Assertions Overview",
  summary:
    "Cypress bundles Chai, Chai-jQuery and Sinon-Chai. Use chainers like `be.visible`, `have.text`, `have.value`, `have.length`, `contain`, `have.attr` and `have.class` with `.should()` so they retry, and negate with `not.`.",
  tech: ["cypress", "javascript"],
  difficulty: "beginner",
  tags: ["assertions", "chai", "chai-jquery", "should", "visibility"],
  prerequisites: ["`cy.get` and the command queue", "Truthy/falsy and equality in JavaScript"],
  explanation: [
    {
      kind: "paragraph",
      text:
        "An assertion describes the state you expect. Most Cypress tests end each step with one: after clicking *Add to cart*, assert the badge shows `1`. Without assertions a test only proves the clicks did not crash.",
    },
    {
      kind: "table",
      caption: "Most-used chainers",
      headers: ["Chainer", "Example", "Checks"],
      rows: [
        ["`be.visible` / `not.be.visible`", "`.should('be.visible')`", "Element is rendered and visible"],
        ["`exist` / `not.exist`", "`.should('not.exist')`", "Element is (not) in the DOM"],
        ["`have.text`", "`.should('have.text', '$49.99')`", "Exact text"],
        ["`contain`", "`.should('contain', 'Added')`", "Text includes substring"],
        ["`have.value`", "`.should('have.value', '2')`", "Input value"],
        ["`have.length`", "`.should('have.length', 3)`", "Number of elements"],
        ["`have.attr`", "`.should('have.attr', 'href', '/cart')`", "Attribute (and value)"],
        ["`have.class`", "`.should('have.class', 'is-active')`", "CSS class"],
        ["`be.disabled` / `be.enabled`", "`.should('be.disabled')`", "Disabled state"],
        ["`be.checked`", "`.should('be.checked')`", "Checkbox / radio state"],
        ["`have.css`", "`.should('have.css', 'display', 'none')`", "Computed style"],
        ["`eq` / `deep.equal`", "`.its('length').should('eq', 2)`", "Values and objects"],
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: "Default assertions",
      text:
        "Many commands have built-in assertions: `cy.get` asserts the element exists, `.click()` asserts it is actionable. Add explicit assertions for the outcome you care about.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Negative assertions can pass too early",
      text:
        "`should('not.exist')` passes instantly if the element has not appeared *yet*. First assert something that proves the page is in the right state (e.g. the spinner appeared, or the request finished), then assert absence.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Chaining assertions",
      code:
        "cy.get('[data-cy=cart-count]').should('be.visible').and('have.text', '2')\ncy.get('[data-cy=checkout]').should('have.attr', 'href', '/checkout')\ncy.get('[data-cy=line-item]').should('have.length.greaterThan', 0)\ncy.get('[data-cy=error]').should('not.exist')\ncy.get('[data-cy=promo-input]').should('have.value', 'SAVE10')",
    },
  ],
  code: {
    title: "cypress/e2e/cart/cart-summary.cy.js",
    language: "js",
    code:
      "describe('Cart summary', () => {\n  beforeEach(() => {\n    cy.intercept('GET', '/api/cart', { fixture: 'cart-two-items.json' }).as('getCart')\n    cy.visit('/cart')\n    cy.wait('@getCart')\n  })\n\n  it('shows the right totals and actions', () => {\n    cy.get('[data-cy=line-item]').should('have.length', 2)\n    cy.get('[data-cy=subtotal]').should('have.text', '$114.98')\n    cy.get('[data-cy=shipping]').should('contain', 'Free')\n\n    cy.get('[data-cy=checkout]')\n      .should('be.visible')\n      .and('be.enabled')\n      .and('have.class', 'btn-primary')\n\n    cy.get('[data-cy=empty-cart-message]').should('not.exist')\n    cy.get('[data-cy=continue-shopping]').should('have.attr', 'href', '/products')\n  })\n})",
  },
  walkthrough: [
    { line: "cy.get('[data-cy=line-item]').should('have.length', 2)", explanation: "Counting elements is a strong, simple assertion that the cart rendered both fixture items." },
    { line: "cy.get('[data-cy=subtotal]').should('have.text', '$114.98')", explanation: "`have.text` is exact; use `contain` if the element includes extra text such as a label." },
    { line: ".and('be.enabled')\n      .and('have.class', 'btn-primary')", explanation: "`and` chains more assertions on the same subject; they all retry together." },
    { line: "cy.get('[data-cy=empty-cart-message]').should('not.exist')", explanation: "Safe here because the previous assertions already proved the cart loaded." },
  ],
  whenToUse: [
    "After every meaningful action, to verify the user-visible outcome.",
    "Before an action, to wait for the right state (e.g. `be.enabled` before clicking).",
    "See the should-vs-expect note for complex checks that need a callback.",
  ],
  mistakes: [
    "Using `have.text` when the element has surrounding whitespace or extra words; prefer `contain` or trim via `invoke('text')`.",
    "Confusing `not.exist` (not in DOM) with `not.be.visible` (in DOM but hidden).",
    "Writing tests with no assertions, so they pass even when the feature is broken.",
    "Asserting on `cy.get(...).should('have.length', 0)` when you mean `not.exist`; both work but `not.exist` reads clearer.",
  ],
  debugging: [
    "Failed assertions show *expected* vs *actual* in the Command Log; click the row for the full subject in the console.",
    "Time-travel to the failing step and inspect the element in DevTools to see its real text, classes and value.",
    "If an assertion flips between pass and fail, the element may be re-rendering; assert on a stable final state.",
  ],
  relatedNotes: ["cy-get", "cy-architecture"],
  relatedLessons: ["variables-equality", "operators-truthy-falsy", "debugging-unit-testing"],
  practice:
    "For the mini-cart drawer, write assertions that it is not visible on page load, becomes visible after clicking the cart icon, contains the product name you added, and has a *View cart* link with `href=\"/cart\"`.",
  docs: [
    { title: "Assertions reference", url: "https://docs.cypress.io/app/references/assertions" },
    { title: ".should()", url: "https://docs.cypress.io/api/commands/should" },
  ],
  versionNote: "Cypress 12+",
};
