import type { KbNote } from "@/content/types";

export const cySpecStructure: KbNote = {
  id: "cy-spec-structure",
  slug: "cy-spec-structure",
  category: "cypress",
  title: "Test Files and Spec Structure",
  summary:
    "A Cypress project keeps specs in `cypress/e2e`, test data in `cypress/fixtures` and shared setup in `cypress/support`. Organise specs by user journey or feature, one concern per file, so they stay fast to run and easy to find.",
  tech: ["cypress", "javascript"],
  difficulty: "beginner",
  tags: ["folders", "spec files", "support file", "organisation"],
  prerequisites: ["Cypress installed (see the installation note)", "Basic ES module or CommonJS imports"],
  explanation: [
    {
      kind: "paragraph",
      text:
        "A **spec** is a test file that Cypress runs in isolation: each spec gets a fresh browser context and its own bundle. Cypress finds specs using `specPattern` (default `cypress/e2e/**/*.cy.{js,jsx,ts,tsx}`).",
    },
    {
      kind: "table",
      headers: ["Path", "Purpose"],
      rows: [
        ["`cypress.config.js`", "Project configuration"],
        ["`cypress/e2e/`", "End-to-end specs, e.g. `auth/login.cy.js`, `cart/add-to-cart.cy.js`"],
        ["`cypress/fixtures/`", "Static JSON test data used by `cy.fixture` and `cy.intercept`"],
        ["`cypress/support/e2e.js`", "Runs before every spec: imports commands, global hooks"],
        ["`cypress/support/commands.js`", "Custom commands such as `cy.login()`"],
        ["`cypress/screenshots/`, `cypress/videos/`", "Generated artifacts; add to `.gitignore`"],
      ],
    },
    {
      kind: "list",
      items: [
        "Group specs by feature or journey: `auth/`, `catalog/`, `cart/`, `checkout/`.",
        "Keep each spec focused; many small specs parallelise better in CI than one giant file.",
        "Name files after behaviour: `apply-coupon.cy.js` is clearer than `test3.cy.js`.",
        "Put reusable steps in custom commands or small helper modules, not copy-pasted blocks.",
        "Never rely on another spec having run first; each spec must set up its own state.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Helper modules are normal JavaScript",
      text:
        "Specs are bundled, so you can `import` helpers from `cypress/support/` or `cypress/pages/` like any other module. Helpers that call `cy.*` simply enqueue commands when invoked.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "bash",
      title: "Typical tree",
      code:
        "cypress/\n  e2e/\n    auth/login.cy.js\n    catalog/product-listing.cy.js\n    cart/add-to-cart.cy.js\n  fixtures/\n    products.json\n    user.json\n  support/\n    commands.js\n    e2e.js\ncypress.config.js",
    },
    {
      kind: "code",
      language: "bash",
      title: "Running a subset",
      code: "npx cypress run --spec \"cypress/e2e/cart/**/*.cy.js\"\nnpx cypress run --spec cypress/e2e/auth/login.cy.js",
    },
  ],
  code: {
    title: "cypress/e2e/cart/add-to-cart.cy.js + cypress/support/e2e.js",
    language: "js",
    code:
      "// cypress/support/e2e.js\nimport './commands'\n\nbeforeEach(() => {\n  // stub analytics in every spec so tests don't send real events\n  cy.intercept('POST', '**/analytics/**', { statusCode: 204 })\n})\n\n// cypress/e2e/cart/add-to-cart.cy.js\nimport { productCard } from '../../support/selectors'\n\ndescribe('Cart: add to cart', () => {\n  beforeEach(() => {\n    cy.visit('/products')\n  })\n\n  it('adds one product and shows it in the mini cart', () => {\n    cy.get(productCard).first().find('[data-cy=add-to-cart]').click()\n    cy.get('[data-cy=cart-count]').should('have.text', '1')\n  })\n\n  it('keeps the cart after a page reload', () => {\n    cy.get(productCard).first().find('[data-cy=add-to-cart]').click()\n    cy.reload()\n    cy.get('[data-cy=cart-count]').should('have.text', '1')\n  })\n})",
  },
  walkthrough: [
    { line: "import './commands'", explanation: "The support file loads custom commands so every spec can use them without importing." },
    { line: "cy.intercept('POST', '**/analytics/**', { statusCode: 204 })", explanation: "A `beforeEach` in the support file runs before every test in every spec, a good place for global network stubs." },
    { line: "import { productCard } from '../../support/selectors'", explanation: "Specs can import plain modules; here a shared selector constant keeps selectors in one place." },
    { line: "describe('Cart: add to cart', () => {", explanation: "One spec file per feature, with a descriptive suite name that reads well in CI reports." },
    { line: "cy.reload()", explanation: "Each test is independent: the second test sets up its own cart instead of reusing the first test's state." },
  ],
  whenToUse: [
    "When starting a suite, to agree on a folder layout before dozens of specs exist.",
    "When CI time grows: splitting large specs lets parallel machines balance the load.",
    "When the same steps appear in many specs: move them to support commands or helpers.",
  ],
  mistakes: [
    "One huge `all-tests.cy.js` file; it is slow to debug and cannot be parallelised.",
    "Specs that depend on order (spec B expects the user created in spec A).",
    "Committing `cypress/screenshots` and `cypress/videos` to git.",
    "Putting test logic in the support file's global `beforeEach` that only some specs need.",
  ],
  debugging: [
    "If a spec does not appear in the runner, check its path against `specPattern` (including the `.cy.` part).",
    "If a custom command is 'not a function', confirm the support file imports `commands.js` and `supportFile` points to it.",
    "Run a single spec with `--spec` to rule out interference from other files.",
  ],
  relatedNotes: ["cy-installation-config", "cy-describe-it"],
  relatedLessons: ["tooling-project-structure", "modern-js-es-modules", "tooling-import-export"],
  practice:
    "Reorganise a flat `cypress/e2e` folder into `auth/`, `catalog/` and `cart/` subfolders, move a repeated selector into `cypress/support/selectors.js`, and run only the cart specs with `--spec`.",
  docs: [
    { title: "Writing and organizing tests", url: "https://docs.cypress.io/app/core-concepts/writing-and-organizing-tests" },
    { title: "Best practices", url: "https://docs.cypress.io/app/core-concepts/best-practices" },
  ],
  versionNote: "Cypress 10+",
};
