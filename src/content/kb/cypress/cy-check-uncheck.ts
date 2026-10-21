import type { KbNote } from "@/content/types";

export const cyCheckUncheck: KbNote = {
  id: "cy-check-uncheck",
  slug: "cy-check-uncheck",
  category: "cypress",
  title: ".check() and .uncheck(): Checkboxes and Radios",
  summary:
    "`.check()` ticks checkboxes and selects radio buttons; `.uncheck()` unticks checkboxes. Pass a value or array of values to target specific inputs in a group, and assert with `be.checked` / `not.be.checked`.",
  tech: ["cypress", "javascript"],
  difficulty: "beginner",
  tags: ["check", "uncheck", "checkbox", "radio", "forms", "filters"],
  prerequisites: ["HTML checkbox and radio inputs", "`cy.get`"],
  explanation: [
    {
      kind: "paragraph",
      text:
        "`.check()` works on `<input type=\"checkbox\">` and `<input type=\"radio\">`. If the input is already checked it does nothing (it is idempotent), which makes tests robust. `.uncheck()` only works on checkboxes, because radios cannot be unchecked by users.",
    },
    {
      kind: "list",
      items: [
        "`cy.get('[data-cy=terms]').check()` checks a single box.",
        "`cy.get('[name=shipping]').check('express')` checks the radio with `value=\"express\"`.",
        "`cy.get('[name=brand]').check(['nike', 'adidas'])` checks several boxes in a group.",
        "Assert with `.should('be.checked')`; for a group `cy.get('[name=brand]:checked').should('have.length', 2)`.",
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Visually hidden inputs",
      text:
        "Custom-styled checkboxes often hide the real input with `opacity: 0` and show a label instead. Prefer clicking the visible `<label>` (as users do). Use `.check({ force: true })` only when there is no clickable alternative and you understand why.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Usage",
      code:
        "cy.get('[data-cy=newsletter]').check().should('be.checked')\ncy.get('[data-cy=newsletter]').uncheck().should('not.be.checked')\ncy.get('input[name=shipping]').check('express')\ncy.get('input[name=size]').check(['s', 'm'])\ncy.contains('label', 'Gift wrap').click() // custom checkbox via its label",
    },
  ],
  code: {
    title: "cypress/e2e/catalog/filters.cy.js",
    language: "js",
    code:
      "describe('Product filters', () => {\n  beforeEach(() => {\n    cy.intercept('GET', '/api/products*').as('getProducts')\n    cy.visit('/products')\n    cy.wait('@getProducts')\n  })\n\n  it('filters by two brands', () => {\n    cy.get('[data-cy=filter-brand] input[type=checkbox]').check(['nike', 'adidas'])\n\n    cy.wait('@getProducts').its('request.url')\n      .should('include', 'brand=nike')\n      .and('include', 'brand=adidas')\n\n    cy.get('[data-cy=filter-brand] input:checked').should('have.length', 2)\n    cy.get('[data-cy=active-filter-chip]').should('have.length', 2)\n  })\n\n  it('removes a brand filter', () => {\n    cy.get('[data-cy=filter-brand] input[value=nike]').check()\n    cy.get('[data-cy=active-filter-chip]').should('contain', 'Nike')\n\n    cy.get('[data-cy=filter-brand] input[value=nike]').uncheck().should('not.be.checked')\n    cy.get('[data-cy=active-filter-chip]').should('not.exist')\n  })\n\n  it('chooses express shipping in the estimator', () => {\n    cy.get('input[name=shipping-speed]').check('express')\n    cy.get('[data-cy=delivery-estimate]').should('contain', '1-2 business days')\n  })\n})",
  },
  walkthrough: [
    { line: "cy.get('[data-cy=filter-brand] input[type=checkbox]').check(['nike', 'adidas'])", explanation: "From the group of brand checkboxes, checks only those whose `value` is `nike` or `adidas`." },
    { line: ".should('include', 'brand=nike')\n      .and('include', 'brand=adidas')", explanation: "Asserts the filtered request includes both brands." },
    { line: "cy.get('[data-cy=filter-brand] input:checked').should('have.length', 2)", explanation: "The `:checked` pseudo-class counts how many boxes are ticked." },
    { line: ".uncheck().should('not.be.checked')", explanation: "Unticks the box and immediately verifies its state." },
    { line: "cy.get('input[name=shipping-speed]').check('express')", explanation: "For radios, `.check(value)` selects the one with that value." },
  ],
  whenToUse: [
    "Filter panels, terms-and-conditions boxes, newsletter opt-ins, shipping/payment method radios.",
    "Use `.click()` on a label for custom toggles that are not real inputs (e.g. `role=switch`).",
  ],
  mistakes: [
    "Calling `.uncheck()` on a radio button; it errors because radios cannot be unchecked.",
    "Using `.click()` on a checkbox to 'check' it; if it was already checked, the click unchecks it. `.check()` is idempotent.",
    "Forcing checks on hidden inputs instead of interacting with the visible label.",
  ],
  debugging: [
    "If `.check()` says the element is not visible, inspect the CSS: the input may be hidden behind a styled label.",
    "If the filter UI does not update, check the app listens to `change` (fired by Cypress) and not only to `click` on a wrapper.",
  ],
  relatedNotes: ["cy-click", "cy-select", "cy-assertions"],
  relatedLessons: ["dom-forms-validation", "dom-event-listeners", "variables-booleans"],
  practice:
    "On checkout, write a test that verifies *Place order* stays disabled until the *I accept the terms* checkbox is checked, then becomes disabled again after unchecking it.",
  docs: [
    { title: ".check()", url: "https://docs.cypress.io/api/commands/check" },
    { title: ".uncheck()", url: "https://docs.cypress.io/api/commands/uncheck" },
  ],
  versionNote: "Cypress 12+",
};
