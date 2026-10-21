import type { KbNote } from "@/content/types";

export const cyGet: KbNote = {
  id: "cy-get",
  slug: "cy-get",
  category: "cypress",
  title: "cy.get(): Selecting Elements",
  summary:
    "`cy.get(selector)` queries the whole document with a CSS selector and retries until matching elements exist (and any chained assertion passes). Prefer dedicated `data-cy` / `data-testid` attributes over classes, ids or text that change with styling.",
  tech: ["cypress", "javascript", "dom"],
  difficulty: "beginner",
  tags: ["get", "selectors", "data-cy", "data-testid", "queries"],
  prerequisites: ["CSS selectors (`#id`, `.class`, `[attr=value]`)", "What the DOM is"],
  explanation: [
    {
      kind: "paragraph",
      text:
        "`cy.get()` yields a jQuery-wrapped collection of every matching element. It always searches from the document root (or from the current `within()` scope), never from the previous subject; use `.find()` for that.",
    },
    {
      kind: "table",
      caption: "Selector stability ranking (from Cypress best practices)",
      headers: ["Selector", "Stability", "Why"],
      rows: [
        ["`button`", "Poor", "Matches too many elements"],
        ["`.btn.btn-primary`", "Poor", "Styling changes break the test"],
        ["`#checkout`", "Fair", "Ids are often generated or reused for JS/CSS"],
        ["`[name=email]`", "Fair", "Tied to form semantics, fine for inputs"],
        ["`[data-cy=checkout]`", "Best", "Exists only for tests, isolated from CSS/JS changes"],
      ],
    },
    {
      kind: "list",
      items: [
        "Filter a collection with `.first()`, `.last()`, `.eq(index)` or `.filter(selector)`.",
        "Pass `{ timeout: 10000 }` for an element that legitimately takes longer (e.g. after a slow search).",
        "`cy.get('@alias')` retrieves an alias (see the aliases note).",
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: "Add test attributes to the app",
      text:
        "Ask developers (or add yourself) `data-cy=\"add-to-cart\"` attributes on key elements. They document which elements tests depend on and survive redesigns.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Common forms",
      code:
        "cy.get('[data-cy=product-card]')              // all product cards\ncy.get('[data-cy=product-card]').first()      // first card\ncy.get('[data-cy=product-card]').eq(2)        // third card (0-based)\ncy.get('[data-testid=search-input]')\ncy.get('input[name=email]')\ncy.get('[data-cy=order-status]', { timeout: 10000 })",
    },
  ],
  code: {
    title: "cypress/e2e/catalog/grid.cy.js",
    language: "js",
    code:
      "describe('Product grid', () => {\n  beforeEach(() => {\n    cy.visit('/products')\n  })\n\n  it('shows 12 products on the first page', () => {\n    cy.get('[data-cy=product-card]').should('have.length', 12)\n  })\n\n  it('shows name, price and image on each card', () => {\n    cy.get('[data-cy=product-card]').first().within(() => {\n      cy.get('[data-cy=product-name]').should('not.be.empty')\n      cy.get('[data-cy=product-price]').invoke('text').should('match', /^\\$\\d+\\.\\d{2}$/)\n      cy.get('img').should('have.attr', 'alt').and('not.be.empty')\n    })\n  })\n\n  it('marks out-of-stock products', () => {\n    cy.get('[data-cy=product-card]')\n      .filter('[data-stock=out]')\n      .should('have.length.at.least', 1)\n      .each(($card) => {\n        cy.wrap($card).find('[data-cy=add-to-cart]').should('be.disabled')\n      })\n  })\n})",
  },
  walkthrough: [
    { line: "cy.get('[data-cy=product-card]').should('have.length', 12)", explanation: "`cy.get` keeps re-querying until there are exactly 12 cards, so it works even if products load from an API after the page renders." },
    { line: "cy.get('[data-cy=product-card]').first().within(() => {", explanation: "Narrow to the first card; inside `within`, every `cy.get` searches only that card." },
    { line: "cy.get('[data-cy=product-price]').invoke('text').should('match', /^\\$\\d+\\.\\d{2}$/)", explanation: "`invoke('text')` yields the text string, and `match` checks it against a regular expression, here a price like `$49.99`. Query, invoke and assertion retry together." },
    { line: ".filter('[data-stock=out]')", explanation: "Narrows the yielded collection to cards whose `data-stock` attribute is `out`." },
    { line: "cy.wrap($card).find('[data-cy=add-to-cart]').should('be.disabled')", explanation: "Inside `.each`, the element is plain jQuery, so `cy.wrap` turns it back into a Cypress subject." },
  ],
  whenToUse: [
    "Any time you need an element from the page by selector.",
    "As the starting point of a chain: `cy.get(...).click()`, `cy.get(...).should(...)`.",
    "Use `cy.contains` instead when the visible text is the best way to identify the element (buttons, links).",
  ],
  mistakes: [
    "Selecting by CSS classes like `.MuiButton-root-123`, which change with every styling refactor.",
    "Expecting `cy.get` to search inside the previous subject: `cy.get('.card').get('button')` searches the whole page. Use `.find()`.",
    "Storing the result: `const cards = cy.get(...)`; you get a chainable, not elements.",
    "Clicking a collection: `cy.get('[data-cy=add-to-cart]').click()` fails if it matches several elements (unless `{ multiple: true }`).",
  ],
  debugging: [
    "Use the Selector Playground (crosshair icon in the runner) to click an element and get a suggested selector.",
    "If `cy.get` times out, check the DOM snapshot: is the element inside an iframe or shadow DOM (`includeShadowDom: true`)?",
    "Hover the GET row in the Command Log to highlight what was found and see the count.",
  ],
  relatedNotes: ["cy-contains", "cy-find-within", "cy-assertions"],
  relatedLessons: ["dom-selecting-elements", "dom-what-is-dom", "introduction-html-css-js"],
  practice:
    "On the cart page, use `cy.get` with `data-cy` selectors to assert there are 2 line items, that the second line item's quantity input has value `3`, and that the checkout button is enabled.",
  docs: [
    { title: "cy.get()", url: "https://docs.cypress.io/api/commands/get" },
    { title: "Best practices: selecting elements", url: "https://docs.cypress.io/app/core-concepts/best-practices#Selecting-Elements" },
  ],
  versionNote: "Cypress 12+",
};
