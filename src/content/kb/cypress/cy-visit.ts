import type { KbNote } from "@/content/types";

export const cyVisit: KbNote = {
  id: "cy-visit",
  slug: "cy-visit",
  category: "cypress",
  title: "cy.visit(): Loading Pages",
  summary:
    "`cy.visit(url, options)` loads a page in the app iframe and waits for its `load` event. Use relative paths with `baseUrl`, query strings via `qs`, and `onBeforeLoad` to prepare `window` before the app boots.",
  tech: ["cypress", "javascript"],
  difficulty: "beginner",
  tags: ["visit", "navigation", "baseUrl", "onBeforeLoad", "location"],
  prerequisites: ["`baseUrl` configured", "Understanding of URLs, paths and query parameters"],
  explanation: [
    {
      kind: "paragraph",
      text:
        "`cy.visit()` navigates the application iframe to a URL and yields the remote `window` once the page fires `load`. It fails if the server responds with a non-2xx status or a non-HTML content type, which surfaces broken deployments early.",
    },
    {
      kind: "list",
      items: [
        "Relative URLs are resolved against `baseUrl`: `cy.visit('/products')`.",
        "`qs: { category: 'shoes', sort: 'price-asc' }` appends query parameters safely encoded.",
        "`onBeforeLoad(win)` runs before any app script, e.g. to seed `localStorage` or stub `win.navigator` APIs.",
        "`failOnStatusCode: false` lets you visit a 404 page on purpose.",
        "`timeout` overrides `pageLoadTimeout` (default 60 s) for a slow page.",
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: "Assert where you are",
      text:
        "After navigation (from a visit or a click), assert the URL with `cy.location('pathname').should('eq', '/cart')` or `cy.url().should('include', '/cart')`. Both retry until the route changes.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Do not visit external sites",
      text:
        "Test your own app. For a third-party page (payment provider, OAuth login) prefer stubbing or `cy.origin()` for the minimal steps you really need to cover.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Signatures",
      code:
        "cy.visit('/products')\ncy.visit('/products', { qs: { category: 'shoes' } })\ncy.visit({ url: '/search', qs: { q: 'jacket' }, timeout: 30000 })\ncy.visit('/missing-page', { failOnStatusCode: false })\ncy.visit('/', {\n  onBeforeLoad(win) {\n    win.localStorage.setItem('cookie-consent', 'accepted')\n  },\n})",
    },
  ],
  code: {
    title: "cypress/e2e/catalog/product-listing.cy.js",
    language: "js",
    code:
      "describe('Product listing page', () => {\n  it('filters by category through the URL', () => {\n    cy.visit('/products', {\n      qs: { category: 'shoes', sort: 'price-asc' },\n      onBeforeLoad(win) {\n        // hide the cookie banner so it does not cover elements\n        win.localStorage.setItem('cookie-consent', 'accepted')\n      },\n    })\n\n    cy.location('search').should('include', 'category=shoes')\n    cy.get('[data-cy=page-title]').should('have.text', 'Shoes')\n    cy.get('[data-cy=product-card]').should('have.length.at.least', 1)\n  })\n\n  it('shows a friendly 404 for an unknown product', () => {\n    cy.visit('/products/does-not-exist', { failOnStatusCode: false })\n    cy.get('[data-cy=not-found]').should('contain', 'Product not found')\n  })\n})",
  },
  walkthrough: [
    { line: "qs: { category: 'shoes', sort: 'price-asc' },", explanation: "Builds `/products?category=shoes&sort=price-asc` without manual string concatenation or encoding mistakes." },
    { line: "onBeforeLoad(win) {", explanation: "Runs after the new window exists but before app scripts execute, so the app reads the seeded consent flag on boot." },
    { line: "cy.location('search').should('include', 'category=shoes')", explanation: "Asserts the query string survived any client-side redirects; it retries like any query." },
    { line: "cy.visit('/products/does-not-exist', { failOnStatusCode: false })", explanation: "By default a 404 response fails the visit; this option lets you test the not-found page deliberately." },
  ],
  whenToUse: [
    "At the start of almost every E2E test, usually in `beforeEach`.",
    "Deep-linking straight to the page under test instead of clicking through the whole site.",
    "Preparing browser state (consent, feature flags in localStorage) before the app starts.",
  ],
  mistakes: [
    "Using absolute URLs everywhere, which breaks when running against staging. Use `baseUrl` + relative paths.",
    "Navigating through five pages via the UI to reach the cart in every test; visit `/cart` directly and seed the cart through the API.",
    "Adding `cy.wait(3000)` after `cy.visit`; the visit already waits for `load`, and assertions retry for dynamic content.",
    "Seeding `localStorage` before `cy.visit` with `window.localStorage` of the spec iframe instead of `onBeforeLoad(win)`.",
  ],
  debugging: [
    "If the visit times out, open the URL in a normal browser: is the server running and is `baseUrl` correct?",
    "A 'cy.visit() failed because the response was not text/html' error usually means you visited an API endpoint; use `cy.request` for that.",
    "Click the VISIT row in the Command Log to inspect the yielded window and response details.",
  ],
  relatedNotes: ["cy-installation-config", "cy-get"],
  relatedLessons: ["networking-url-query-params", "introduction-how-websites-work", "dom-local-session-storage"],
  practice:
    "Write a test that visits `/search` with `qs: { q: 'backpack' }`, asserts the search input contains `backpack`, and asserts every result card contains the word *backpack* (case-insensitive).",
  docs: [
    { title: "cy.visit()", url: "https://docs.cypress.io/api/commands/visit" },
    { title: "cy.location()", url: "https://docs.cypress.io/api/commands/location" },
  ],
  versionNote: "Cypress 12+",
};
