import type { KbNote } from "@/content/types";

export const cyContains: KbNote = {
  id: "cy-contains",
  slug: "cy-contains",
  category: "cypress",
  title: "cy.contains(): Finding Elements by Text",
  summary:
    "`cy.contains(text)` finds the deepest element containing the text; `cy.contains(selector, text)` restricts the match to a selector. It is ideal for buttons, links and messages users identify by their label, and it retries like `cy.get`.",
  tech: ["cypress", "javascript"],
  difficulty: "beginner",
  tags: ["contains", "text", "selectors", "regex", "matchCase"],
  prerequisites: ["`cy.get` and CSS selectors", "Regular expressions basics (optional)"],
  explanation: [
    {
      kind: "paragraph",
      text:
        "`cy.contains()` yields **one** element: the deepest element containing the text, preferring certain elements (for example a `button` or `a` whose descendant contains the text). Pass a selector first to say exactly what kind of element you want.",
    },
    {
      kind: "list",
      items: [
        "`cy.contains('Add to cart')` matches substrings; text is whitespace-normalised.",
        "`cy.contains('[data-cy=product-card]', 'Trail Running Shoes')` yields the card element that contains the product name, not the inner heading.",
        "`cy.contains(/^Checkout$/)` uses a regex for exact matches.",
        "`{ matchCase: false }` ignores letter case.",
        "Chained off a subject (`cy.get('nav').contains('Cart')`) it searches only within that subject.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Text vs data-cy",
      text:
        "Text selectors double as an assertion that users see the right label, but they break when copy or language changes. A common pattern: `data-cy` for structural lookups, `cy.contains` for user-facing labels and messages.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Forms",
      code:
        "cy.contains('Sign in')\ncy.contains('button', 'Sign in')\ncy.contains('[data-cy=product-card]', 'Wool Beanie')\ncy.contains(/^Total: \\$\\d+\\.\\d{2}$/)\ncy.contains('free shipping', { matchCase: false })\ncy.get('[data-cy=mini-cart]').contains('Remove')",
    },
  ],
  code: {
    title: "cypress/e2e/cart/add-specific-product.cy.js",
    language: "js",
    code:
      "describe('Adding a specific product', () => {\n  beforeEach(() => {\n    cy.visit('/products')\n  })\n\n  it('adds the Wool Beanie to the cart', () => {\n    cy.contains('[data-cy=product-card]', 'Wool Beanie')\n      .find('[data-cy=add-to-cart]')\n      .click()\n\n    cy.contains('[role=status]', 'Added to cart').should('be.visible')\n\n    cy.contains('a', 'Cart').click()\n    cy.location('pathname').should('eq', '/cart')\n\n    cy.contains('[data-cy=line-item]', 'Wool Beanie')\n      .should('contain', 'Qty: 1')\n  })\n\n  it('shows the free shipping banner regardless of case', () => {\n    cy.contains('free shipping on orders over $50', { matchCase: false })\n      .should('be.visible')\n  })\n})",
  },
  walkthrough: [
    { line: "cy.contains('[data-cy=product-card]', 'Wool Beanie')", explanation: "Yields the whole product card (the element matching the selector) that contains the product name, so the next `.find` stays inside that card." },
    { line: "cy.contains('[role=status]', 'Added to cart').should('be.visible')", explanation: "Waits for the toast to appear; `cy.contains` retries until the text exists and the element is visible." },
    { line: "cy.contains('a', 'Cart').click()", explanation: "Clicks the link by its user-visible label; restricting to `a` avoids matching a heading that also says 'Cart'." },
    { line: "{ matchCase: false }", explanation: "Ignores capitalisation differences between the copy deck and the rendered text." },
  ],
  whenToUse: [
    "Clicking buttons and links by label (`cy.contains('button', 'Place order')`).",
    "Locating a row/card by a unique human-readable value (product name, order number).",
    "Asserting that a message is displayed (`cy.contains('Payment failed').should('be.visible')`).",
  ],
  mistakes: [
    "Calling `cy.contains('Cart')` without a selector and getting a heading or hidden element instead of the link.",
    "Expecting multiple elements: `cy.contains` yields only the first match. Use `cy.get(selector).filter(':contains(text)')` for all.",
    "Matching partial text unintentionally: `cy.contains('Shoes')` also matches 'Trail Running Shoes'. Use a regex for exact matches.",
    "Relying on text in a localised app where the language changes per environment.",
  ],
  debugging: [
    "Hover the CONTAINS row in the Command Log to see which element was matched; it may be a parent you did not expect.",
    "If text is not found, check for non-breaking spaces or text split across elements; try a regex.",
    "Remember text inside `<input value>` is not element text; assert `.should('have.value', ...)` instead.",
  ],
  relatedNotes: ["cy-get", "cy-find-within", "cy-click", "cy-assertions"],
  relatedLessons: ["dom-selecting-elements", "dom-updating-content", "variables-strings"],
  practice:
    "On the order history page, use `cy.contains('[data-cy=order-row]', 'ORD-1042')` to find an order row, then assert it shows status *Shipped* and click its *View details* link.",
  docs: [{ title: "cy.contains()", url: "https://docs.cypress.io/api/commands/contains" }],
  versionNote: "Cypress 12+",
};
