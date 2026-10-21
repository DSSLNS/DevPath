import type { KbNote } from "@/content/types";

export const cySelect: KbNote = {
  id: "cy-select",
  slug: "cy-select",
  category: "cypress",
  title: ".select(): Choosing Options in Dropdowns",
  summary:
    "`.select(valueOrText)` picks an `<option>` in a native `<select>` by its visible text, `value` attribute or index, and fires `input` and `change`. Custom dropdowns built from divs need `.click()` instead.",
  tech: ["cypress", "javascript"],
  difficulty: "beginner",
  tags: ["select", "dropdown", "forms", "options"],
  prerequisites: ["HTML `<select>` and `<option>` elements", "`cy.get`"],
  explanation: [
    {
      kind: "paragraph",
      text:
        "`.select()` only works on a real `<select>` element. It matches an option by text content first, then by `value`. Passing a number selects by index. For `<select multiple>`, pass an array.",
    },
    {
      kind: "list",
      items: [
        "`.select('Price: Low to High')` uses the visible text.",
        "`.select('price-asc')` uses the `value` attribute.",
        "`.select(2)` selects the third option (0-based index).",
        "`.select(['red', 'blue'])` for multi-selects.",
        "Assert with `.should('have.value', 'price-asc')` or check the selected option text with `.find(':selected')`.",
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Custom dropdowns",
      text:
        "Component libraries often render a fake dropdown (`div[role=listbox]`). `.select()` fails on these. Click the trigger, then click the option: `cy.get('[data-cy=size-picker]').click(); cy.contains('[role=option]', 'M').click()`.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Usage",
      code:
        "cy.get('[data-cy=sort]').select('Price: Low to High')\ncy.get('[data-cy=sort]').select('price-asc')\ncy.get('[data-cy=country]').select(0)\ncy.get('[data-cy=filters-colors]').select(['red', 'blue'])\ncy.get('[data-cy=sort]').should('have.value', 'price-asc')\ncy.get('[data-cy=sort]').find(':selected').should('have.text', 'Price: Low to High')",
    },
  ],
  code: {
    title: "cypress/e2e/catalog/sort-products.cy.js",
    language: "js",
    code:
      "describe('Sorting products', () => {\n  beforeEach(() => {\n    cy.intercept('GET', '/api/products*').as('getProducts')\n    cy.visit('/products')\n    cy.wait('@getProducts')\n  })\n\n  it('sorts by price ascending', () => {\n    cy.get('[data-cy=sort]').select('Price: Low to High')\n    cy.wait('@getProducts').its('request.url').should('include', 'sort=price-asc')\n\n    cy.get('[data-cy=product-price]').then(($prices) => {\n      const values = [...$prices].map((el) => Number(el.innerText.replace('$', '')))\n      const sorted = [...values].sort((a, b) => a - b)\n      expect(values).to.deep.equal(sorted)\n    })\n  })\n\n  it('remembers the sort option after reload', () => {\n    cy.get('[data-cy=sort]').select('newest')\n    cy.reload()\n    cy.get('[data-cy=sort]').should('have.value', 'newest')\n  })\n})",
  },
  walkthrough: [
    { line: "cy.get('[data-cy=sort]').select('Price: Low to High')", explanation: "Chooses the option by visible label, which is what a user reads." },
    { line: "cy.wait('@getProducts').its('request.url').should('include', 'sort=price-asc')", explanation: "Confirms the change event triggered a new request with the right sort parameter; this is the second `getProducts` request." },
    { line: "const values = [...$prices].map((el) => Number(el.innerText.replace('$', '')))", explanation: "Turns the jQuery collection into an array of numbers so plain JavaScript can compare the order." },
    { line: "expect(values).to.deep.equal(sorted)", explanation: "An explicit Chai assertion: the displayed prices must already be in ascending order." },
    { line: "cy.get('[data-cy=sort]').select('newest')", explanation: "Selecting by the `value` attribute also works when no option text matches." },
  ],
  whenToUse: [
    "Native dropdowns: sort order, country, quantity, shipping method.",
    "Testing that changing a select triggers the right request or URL update.",
  ],
  mistakes: [
    "Calling `.select()` on a styled div dropdown and getting '.select() can only be called on a <select>'.",
    "Asserting the order of prices without waiting for the re-sorted response, so the check runs against the old list.",
    "Selecting a disabled option; Cypress errors because users cannot choose it.",
  ],
  debugging: [
    "Inspect the element in DevTools: if it is not a `<select>`, switch to click-based selection.",
    "If no option matches, check for extra whitespace in option text or use the `value` instead.",
  ],
  relatedNotes: ["cy-click", "cy-check-uncheck"],
  relatedLessons: ["dom-forms-validation", "arrays-sort-reverse", "arrays-map"],
  practice:
    "On checkout, select *Express (1-2 days)* in the shipping method `<select>` and assert the order summary's shipping line changes to `$14.99` and the total increases accordingly.",
  docs: [{ title: ".select()", url: "https://docs.cypress.io/api/commands/select" }],
  versionNote: "Cypress 12+",
};
