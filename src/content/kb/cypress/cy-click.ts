import type { KbNote } from "@/content/types";

export const cyClick: KbNote = {
  id: "cy-click",
  slug: "cy-click",
  category: "cypress",
  title: ".click(): Clicking Elements",
  summary:
    "`.click()` waits until the element is actionable (visible, enabled, not covered, not animating), scrolls it into view and fires the full mouse event sequence. Use `{ force: true }` only as a last resort.",
  tech: ["cypress", "javascript"],
  difficulty: "beginner",
  tags: ["click", "actions", "actionability", "force", "dblclick", "rightclick"],
  prerequisites: ["`cy.get` / `cy.contains`", "Browser events (click, mousedown, mouseup)"],
  explanation: [
    {
      kind: "paragraph",
      text:
        "Before acting, Cypress checks **actionability**: the element must be attached, visible, not `disabled`, not `readonly` for typing, not covered by another element and not moving. It retries these checks until `defaultCommandTimeout`. It then fires `pointerdown`, `mousedown`, `pointerup`, `mouseup` and `click` at the element's centre (or a given position).",
    },
    {
      kind: "list",
      items: [
        "`.click()` on the centre; `.click('topRight')` or `.click(10, 5)` for a position.",
        "`.click({ multiple: true })` clicks every matched element in sequence.",
        "`.click({ force: true })` skips actionability checks; it can hide real bugs (a modal covering the button).",
        "Related actions: `.dblclick()`, `.rightclick()`, `.trigger('mouseover')`.",
      ],
    },
    {
      kind: "callout",
      tone: "danger",
      title: "Think before using force",
      text:
        "If a user cannot click it (covered by a cookie banner, disabled while saving), your test should not either. Fix the setup (dismiss the banner, wait for the save request) instead of forcing.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Variants",
      code:
        "cy.get('[data-cy=add-to-cart]').click()\ncy.contains('button', 'Place order').click()\ncy.get('[data-cy=size-swatch]').click({ multiple: true })\ncy.get('[data-cy=rating-star]').eq(3).click()\ncy.get('[data-cy=product-image]').dblclick()\ncy.get('[data-cy=hidden-file-input]').click({ force: true }) // rare, justified case",
    },
  ],
  code: {
    title: "cypress/e2e/cart/checkout-button.cy.js",
    language: "js",
    code:
      "describe('Checkout button', () => {\n  beforeEach(() => {\n    cy.intercept('POST', '/api/cart/items').as('addItem')\n    cy.visit('/products/trail-running-shoes')\n  })\n\n  it('adds the product and goes to checkout', () => {\n    cy.get('[data-cy=size-option]').contains('42').click()\n    cy.get('[data-cy=add-to-cart]').should('be.enabled').click()\n    cy.wait('@addItem').its('response.statusCode').should('eq', 201)\n\n    cy.get('[data-cy=mini-cart-toggle]').click()\n    cy.get('[data-cy=mini-cart]').should('be.visible')\n    cy.contains('[data-cy=mini-cart] a', 'Checkout').click()\n\n    cy.location('pathname').should('eq', '/checkout')\n  })\n\n  it('keeps add-to-cart disabled until a size is chosen', () => {\n    cy.get('[data-cy=add-to-cart]').should('be.disabled')\n  })\n})",
  },
  walkthrough: [
    { line: "cy.get('[data-cy=size-option]').contains('42').click()", explanation: "Selects size 42. `.contains` chained on a subject searches inside the size options." },
    { line: "cy.get('[data-cy=add-to-cart]').should('be.enabled').click()", explanation: "The explicit assertion documents intent; `.click()` would also wait for the button to stop being disabled." },
    { line: "cy.wait('@addItem').its('response.statusCode').should('eq', 201)", explanation: "Confirms the click actually triggered the API call and it succeeded, not just that the UI changed." },
    { line: "cy.contains('[data-cy=mini-cart] a', 'Checkout').click()", explanation: "Clicks the link inside the opened mini-cart, after its visibility was asserted." },
  ],
  whenToUse: [
    "Buttons, links, checkboxes styled as custom elements, menu items, swatches.",
    "Use `.check()` for real checkboxes/radios and `.select()` for `<select>` elements instead.",
  ],
  mistakes: [
    "Adding `{ force: true }` to get past 'element is covered by another element' instead of closing the overlay.",
    "Clicking a collection by accident (`cy.get('button').click()`) and getting a 'can only be called on a single element' error.",
    "Clicking, then immediately asserting on data that is still loading, with no retried assertion or `cy.wait('@alias')`.",
    "Adding `cy.wait(1000)` before clicks 'to be safe'; actionability already waits.",
  ],
  debugging: [
    "Read the error carefully: Cypress names the element covering yours. Time-travel to that step to see it.",
    "Hover the CLICK command in the Command Log: a red dot marks the exact coordinates clicked.",
    "Check the console output of the CLICK command (click it in the log) to see which events fired and whether any handler called `preventDefault`.",
  ],
  relatedNotes: ["cy-architecture", "cy-check-uncheck", "cy-select"],
  relatedLessons: ["dom-event-listeners", "dom-event-objects", "dom-bubbling-capturing"],
  practice:
    "On a product detail page, write a test that clicks the second colour swatch, asserts the main image `src` changes, then double-clicks the image and asserts the zoom modal is visible.",
  docs: [
    { title: ".click()", url: "https://docs.cypress.io/api/commands/click" },
    { title: "Interacting with elements (actionability)", url: "https://docs.cypress.io/app/core-concepts/interacting-with-elements" },
  ],
  versionNote: "Cypress 12+",
};
