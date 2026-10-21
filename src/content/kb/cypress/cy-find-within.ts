import type { KbNote } from "@/content/types";

export const cyFindWithin: KbNote = {
  id: "cy-find-within",
  slug: "cy-find-within",
  category: "cypress",
  title: ".find() and .within(): Scoped Queries",
  summary:
    "`.find(selector)` searches descendants of the current subject; `.within(callback)` scopes every query in the callback to that subject. Both keep selectors short and stop tests from accidentally matching elements in another card, row or form.",
  tech: ["cypress", "javascript"],
  difficulty: "beginner",
  tags: ["find", "within", "scope", "queries"],
  prerequisites: ["`cy.get` and `cy.contains`", "Parent/child relationships in the DOM"],
  explanation: [
    {
      kind: "paragraph",
      text:
        "E-commerce pages repeat the same structure many times: product cards, cart line items, address forms. Scoping lets you write `[data-cy=price]` once and know it belongs to the right card.",
    },
    {
      kind: "table",
      headers: ["", "`.find()`", "`.within()`"],
      rows: [
        ["Shape", "Chain: `cy.get(a).find(b)`", "Callback: `cy.get(a).within(() => { ... })`"],
        ["Yields", "The found descendants", "The original subject (not the inner results)"],
        ["Best for", "One nested lookup", "Several steps on the same container (fill a form)"],
        ["Retried?", "Yes, with the parent query", "Inner queries retry individually"],
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Escaping the scope",
      text:
        "Inside `within`, `cy.get` only sees descendants. To reach something outside (a toast in the page root) use `cy.root()` for the scoped element, or finish the `within` block first.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Forms",
      code:
        "cy.get('[data-cy=line-item]').eq(0).find('[data-cy=qty]')\n\ncy.get('[data-cy=shipping-form]').within(() => {\n  cy.get('[name=city]').type('Austin')\n  cy.get('[name=zip]').type('73301')\n})\n\ncy.get('[data-cy=line-item]').first().within(() => {\n  cy.root().should('have.attr', 'data-sku', 'SKU-123')\n})",
    },
  ],
  code: {
    title: "cypress/e2e/cart/line-items.cy.js",
    language: "js",
    code:
      "describe('Cart line items', () => {\n  beforeEach(() => {\n    cy.intercept('GET', '/api/cart', { fixture: 'cart-two-items.json' }).as('getCart')\n    cy.visit('/cart')\n    cy.wait('@getCart')\n  })\n\n  it('updates quantity for one item only', () => {\n    cy.contains('[data-cy=line-item]', 'Trail Running Shoes').within(() => {\n      cy.get('[data-cy=qty-increase]').click()\n      cy.get('[data-cy=qty]').should('have.value', '2')\n      cy.get('[data-cy=line-total]').should('have.text', '$179.98')\n    })\n\n    cy.contains('[data-cy=line-item]', 'Wool Beanie')\n      .find('[data-cy=qty]')\n      .should('have.value', '1')\n  })\n\n  it('removes an item', () => {\n    cy.get('[data-cy=line-item]').should('have.length', 2)\n    cy.contains('[data-cy=line-item]', 'Wool Beanie')\n      .find('[data-cy=remove]')\n      .click()\n    cy.get('[data-cy=line-item]').should('have.length', 1)\n  })\n})",
  },
  walkthrough: [
    { line: "cy.contains('[data-cy=line-item]', 'Trail Running Shoes').within(() => {", explanation: "Picks the line item by product name and scopes the next three queries to it." },
    { line: "cy.get('[data-cy=qty-increase]').click()", explanation: "Inside `within`, this only finds the + button of the shoes row, even though every row has one." },
    { line: ".find('[data-cy=qty]')", explanation: "A single scoped lookup is simpler with `.find` than with a `within` block." },
    { line: "cy.get('[data-cy=line-item]').should('have.length', 1)", explanation: "Outside any scope again, the query sees every line item and confirms one was removed." },
  ],
  whenToUse: [
    "Interacting with one item in a repeated list (cards, rows, line items).",
    "Filling a form section (shipping vs billing address) that reuses the same field names.",
    "Asserting several facts about one component.",
  ],
  mistakes: [
    "Using `cy.get` after a subject expecting it to be scoped: `cy.get('.card').get('.price')`. Use `.find`.",
    "Trying to assert on a toast inside `within` while it renders at the page root.",
    "Expecting `within` to yield the inner element; it yields the container, so chaining `.click()` after it clicks the container.",
  ],
  debugging: [
    "In the Command Log, commands inside `within` are indented; check they ran against the expected container.",
    "If `.find` times out, confirm the element is a *descendant*, not a sibling; use `.siblings()` or `.parent()` otherwise.",
  ],
  relatedNotes: ["cy-get", "cy-contains", "cy-click"],
  relatedLessons: ["dom-selecting-elements", "dom-event-delegation", "objects-nested-objects"],
  practice:
    "On checkout, the shipping and billing forms both have `[name=zip]`. Use two `within` blocks to fill different zip codes and assert each input holds the right value.",
  docs: [
    { title: ".find()", url: "https://docs.cypress.io/api/commands/find" },
    { title: ".within()", url: "https://docs.cypress.io/api/commands/within" },
    { title: "cy.root()", url: "https://docs.cypress.io/api/commands/root" },
  ],
  versionNote: "Cypress 12+",
};
