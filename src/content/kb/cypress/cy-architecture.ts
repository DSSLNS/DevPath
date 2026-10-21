import type { KbNote } from "@/content/types";

export const cyArchitecture: KbNote = {
  id: "cy-architecture",
  slug: "cy-architecture",
  category: "cypress",
  title: "Cypress Architecture: Browser, Command Queue and Retry-ability",
  summary:
    "Cypress runs your test code inside the browser next to your app, queues every `cy` command and executes them later, one after another, retrying queries and assertions until they pass or time out.",
  tech: ["cypress", "javascript"],
  difficulty: "beginner",
  tags: ["architecture", "command queue", "retry-ability", "chainable", "fundamentals"],
  prerequisites: [
    "Basic JavaScript functions and callbacks",
    "A rough idea of how a browser loads a page and makes network requests",
    "Awareness that Promises represent values that arrive later",
  ],
  explanation: [
    {
      kind: "paragraph",
      text:
        "Most automation tools (Selenium, WebDriver-based frameworks) run your test in a separate process and send remote commands to the browser. Cypress is different: your spec file is bundled and executed **inside the browser**, in an iframe that sits next to the iframe that holds your application. A Node.js server process runs alongside it to do things a browser cannot: read files, run tasks, proxy and intercept network traffic, take screenshots and record videos.",
    },
    {
      kind: "diagram",
      title: "What happens when Cypress runs a spec",
      variant: "flow",
      steps: [
        { label: "Node process starts", detail: "Reads cypress.config.js, runs setupNodeEvents, starts the proxy." },
        { label: "Browser launches", detail: "Chrome/Edge/Electron/Firefox opens with the Cypress runner." },
        { label: "Spec is bundled", detail: "Your spec + support file are bundled and loaded into the spec iframe." },
        { label: "Test function runs synchronously", detail: "Each cy.* call only enqueues a command; nothing touches the page yet." },
        { label: "Queue executes", detail: "Commands run one at a time; queries and assertions retry until they pass or time out." },
        { label: "Results reported", detail: "Command log, screenshots on failure, optional video, exit code for CI." },
      ],
    },
    { kind: "heading", text: "The command queue" },
    {
      kind: "paragraph",
      text:
        "Calling `cy.get('[data-cy=add-to-cart]')` does **not** find the element immediately. It adds a command to a queue and returns a *chainable* object. After your `it` callback finishes, Cypress runs the queued commands in order. Each command waits for the previous one, so you never write `await` and you never need manual sleeps between steps.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Commands are not Promises",
      text:
        "A Cypress chainable has a `.then()` method, but it is not a real Promise. Do not `await` it, do not `return` mixed Promises from it, and do not assign its result to a variable (`const btn = cy.get(...)` gives you a chainable, not an element). Use `.then()`, aliases or assertions to work with yielded values.",
    },
    { kind: "heading", text: "Retry-ability" },
    {
      kind: "paragraph",
      text:
        "Commands are split into **queries** (`get`, `find`, `contains`, `its`, `invoke`, `within`…), **assertions** (`should`, `and`) and **actions** (`click`, `type`, `select`…). Queries and the assertions attached to them are retried together until the assertion passes or `defaultCommandTimeout` (4 seconds by default) is reached. Actions are not retried, but before acting Cypress waits for the element to be actionable: attached to the DOM, visible, not disabled, not covered and not animating.",
    },
    {
      kind: "table",
      headers: ["Command type", "Examples", "Retried?"],
      rows: [
        ["Query", "`cy.get`, `.find`, `cy.contains`, `.its`, `.invoke`", "Yes, together with the assertions that follow"],
        ["Assertion", "`.should`, `.and`", "Yes, re-runs the preceding query chain"],
        ["Action", "`.click`, `.type`, `.select`, `.check`", "No, but waits for actionability first"],
        ["Other", "`cy.visit`, `cy.request`, `cy.wait`, `.then`", "No, each has its own timeout"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Consequences of running in the browser",
      text:
        "Because tests run in the browser you get direct access to `window`, `document`, `localStorage` and your app objects. The trade-offs: one browser tab per test, and visiting a different origin requires `cy.origin()`.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Enqueue, then execute",
      code:
        "it('adds a product to the cart', () => {\n  cy.visit('/products')                      // enqueued\n  cy.get('[data-cy=product-card]').first()   // enqueued (query)\n    .find('[data-cy=add-to-cart]')           // enqueued (query)\n    .click()                                 // enqueued (action)\n  cy.get('[data-cy=cart-count]')\n    .should('have.text', '1')                // retried with the get above\n})\n// When the it() callback returns, Cypress starts running the queue.",
    },
    {
      kind: "code",
      language: "js",
      title: "Working with a yielded value",
      code:
        "cy.get('[data-cy=cart-total]')\n  .invoke('text')\n  .then((text) => {\n    // plain JavaScript runs here, after the query resolved\n    const total = Number(text.replace('$', ''))\n    expect(total).to.be.greaterThan(0)\n  })",
    },
  ],
  code: {
    title: "cypress/e2e/architecture-demo.cy.js",
    language: "js",
    code:
      "describe('Cart badge', () => {\n  it('updates after adding a product', () => {\n    cy.visit('/products')\n\n    // This log prints FIRST, before any command runs\n    console.log('test body finished queuing commands')\n\n    cy.get('[data-cy=product-card]')\n      .should('have.length.greaterThan', 0)\n\n    cy.contains('[data-cy=product-card]', 'Trail Running Shoes')\n      .find('[data-cy=add-to-cart]')\n      .click()\n\n    // Retries until the badge text is 1 or 4s pass\n    cy.get('[data-cy=cart-count]').should('have.text', '1')\n\n    cy.get('[data-cy=cart-count]').then(($badge) => {\n      // Runs only after the assertion above passed\n      console.log('badge text is', $badge.text())\n    })\n  })\n})",
  },
  walkthrough: [
    { line: "cy.visit('/products')", explanation: "Enqueues a page load. The page is not loaded yet when the next line runs." },
    {
      line: "console.log('test body finished queuing commands')",
      explanation: "Plain JavaScript runs immediately, so this message appears in DevTools before Cypress visits the page. This is the clearest demonstration of the queue.",
    },
    {
      line: ".should('have.length.greaterThan', 0)",
      explanation: "The `cy.get` query is retried until at least one product card exists, which covers slow API responses without any fixed wait.",
    },
    {
      line: "cy.get('[data-cy=cart-count]').should('have.text', '1')",
      explanation: "Query plus assertion retry together: if the badge is re-rendered, Cypress re-queries the DOM and checks again.",
    },
    {
      line: "cy.get('[data-cy=cart-count]').then(($badge) => {",
      explanation: "`.then()` gives you the yielded jQuery element so you can run synchronous JavaScript once the command finished.",
    },
  ],
  whenToUse: [
    "Read this before writing your first spec, so the queue and retries make sense instead of feeling like magic.",
    "When a test behaves 'out of order' (logs appear early, variables are undefined), the command queue is usually the reason.",
    "When deciding whether you need a wait: in most cases a retried assertion replaces it.",
  ],
  mistakes: [
    "Writing `const button = cy.get('button')` and expecting an element; you get a chainable. Use `.then()` or an alias instead.",
    "Using `async/await` with Cypress commands. Commands are queued, not awaited, and mixing the two causes confusing ordering bugs.",
    "Assigning a value inside `.then()` and reading it synchronously on the next line; the next line already ran before the queue started.",
    "Putting the assertion on a separate `cy.get` chain that was already resolved, instead of chaining `.should()` directly onto the query.",
  ],
  debugging: [
    "Open the Command Log and click a command to time-travel to the DOM snapshot taken at that moment.",
    "Add `cy.log()` instead of `console.log()` when you want a message to appear in order with the commands.",
    "If an assertion times out, check whether the query is too broad or targets an element that is replaced by a re-render.",
  ],
  relatedNotes: ["cy-get"],
  relatedLessons: ["async-sync-vs-async", "async-promises", "functions-callbacks", "async-event-loop"],
  practice:
    "Write a spec that visits `/products`, logs a message with `console.log` and another with `cy.log`, then asserts the product grid has at least 3 cards. Open DevTools and explain why the two messages appear at different times.",
  docs: [
    { title: "Introduction to Cypress", url: "https://docs.cypress.io/app/core-concepts/introduction-to-cypress" },
    { title: "Retry-ability", url: "https://docs.cypress.io/app/core-concepts/retry-ability" },
    { title: "Key differences and trade-offs", url: "https://docs.cypress.io/app/references/trade-offs" },
  ],
  versionNote: "Cypress 12+ (query/command split introduced in 12)",
};
