import type { KbNote } from "@/content/types";

export const e2eTestArchitecture: KbNote = {
  id: "e2e-test-architecture",
  slug: "e2e-test-architecture",
  category: "fundamentals",
  title: "Test Automation Architecture: Page Objects, App Actions and Helpers",
  summary:
    "How to structure an E2E codebase so tests stay readable as it grows: page objects, app actions, plain helper functions, fixtures and a predictable folder layout.",
  tech: ["cypress", "playwright", "typescript"],
  difficulty: "intermediate",
  tags: ["page object model", "app actions", "architecture", "folder structure", "maintainability"],
  prerequisites: [
    "Writing a basic Cypress or Playwright test",
    "JavaScript functions, classes and ES modules",
  ],
  explanation: [
    {
      kind: "paragraph",
      text: "As a suite grows, the same locators and steps get copied into dozens of tests. When the UI changes you must edit every copy. Architecture patterns give that knowledge **one home** so a UI change means one edit.",
    },
    {
      kind: "table",
      caption: "Three common patterns",
      headers: ["Pattern", "What it is", "Best for", "Watch out for"],
      rows: [
        ["Page Object Model (POM)", "A class/object per page or component exposing locators and user-level methods (`login(user)`)", "Playwright suites, large teams, shared vocabulary", "God objects with hundreds of methods; hiding assertions inside"],
        ["App actions", "Set state directly through the app or API (`cy.request`, `window.store.dispatch`) instead of the UI", "Fast setup of preconditions (logged-in user, seeded cart)", "Bypassing the UI you actually want to test"],
        ["Plain helper functions", "Small exported functions: `addToCart(page, sku)`, `formatPrice(n)`", "Any suite; easy to compose and tree-shake", "Helpers that grow 10 optional flags"],
      ],
    },
    {
      kind: "paragraph",
      text: "Playwright's docs recommend page objects, and its **fixtures** (`test.extend`) are a natural way to inject them. Cypress's docs favour app actions and custom commands, because Cypress already runs inside the browser with access to the app. In practice most mature suites combine them: **UI tested through page objects or helpers, preconditions set through APIs**.",
    },
    {
      kind: "code",
      language: "text",
      title: "A typical folder layout (Playwright)",
      code: `tests/
  e2e/
    checkout/
      guest-checkout.spec.ts
      saved-card.spec.ts
    search/
      search-results.spec.ts
  pages/              # page objects
    product-page.ts
    cart-page.ts
  fixtures/           # test.extend fixtures and static JSON data
    test.ts
    products.json
  support/            # API clients, data builders, utilities
    api.ts
    builders.ts
playwright.config.ts`,
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Keep assertions visible",
      text: "Page objects should expose *actions* and *locators*. Keep the important `expect` / `should` calls in the test body so a reader can see what is being verified.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "ts",
      title: "Playwright page object skeleton",
      code: `import type { Page, Locator } from "@playwright/test";

export class CartPage {
  readonly total: Locator;
  constructor(private readonly page: Page) {
    this.total = page.getByTestId("cart-total");
  }
  async goto() {
    await this.page.goto("/cart");
  }
}`,
    },
    {
      kind: "code",
      language: "js",
      title: "Cypress app action via API",
      code: `Cypress.Commands.add("seedCart", (items) => {
  cy.request("POST", "/api/test/cart", { items });
});`,
    },
  ],
  code: {
    title: "Page object + fixture + API setup in Playwright",
    language: "ts",
    code: `// tests/pages/product-page.ts
import { type Page, type Locator } from "@playwright/test";

export class ProductPage {
  readonly title: Locator;
  readonly addToCart: Locator;
  readonly cartCount: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId("product-title");
    this.addToCart = page.getByRole("button", { name: "Add to cart" });
    this.cartCount = page.getByTestId("cart-count");
  }

  async open(slug: string) {
    await this.page.goto("/products/" + slug);
  }

  async selectSize(size: string) {
    await this.page.getByRole("radio", { name: size }).check();
  }
}

// tests/fixtures/test.ts
import { test as base } from "@playwright/test";
import { ProductPage } from "../pages/product-page";

export const test = base.extend<{ productPage: ProductPage }>({
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
});
export { expect } from "@playwright/test";

// tests/e2e/product/add-to-cart.spec.ts
import { test, expect } from "../../fixtures/test";

test("adds a sized product to the cart", async ({ productPage }) => {
  await productPage.open("classic-tee");
  await productPage.selectSize("M");
  await productPage.addToCart.click();
  await expect(productPage.cartCount).toHaveText("1");
});`,
  },
  walkthrough: [
    { line: 'this.addToCart = page.getByRole("button", { name: "Add to cart" });', explanation: "Locators are lazy in Playwright, so defining them in the constructor is cheap and they re-query the DOM every time they are used." },
    { line: "async selectSize(size: string) {", explanation: "Methods describe user intent (`selectSize`) rather than mechanics (`clickRadio3`), which keeps tests readable." },
    { line: "export const test = base.extend<{ productPage: ProductPage }>({", explanation: "A custom fixture builds the page object for each test, so specs simply destructure `productPage`." },
    { line: 'await expect(productPage.cartCount).toHaveText("1");', explanation: "The assertion stays in the spec, where reviewers expect to find it." },
  ],
  whenToUse: [
    "Page objects: when several specs touch the same page or component and the team wants a shared vocabulary.",
    "App actions / API setup: for preconditions that are not the subject of the test (login, seeding data).",
    "Plain helpers: for small reusable steps and pure utilities such as price parsing.",
  ],
  mistakes: [
    "Creating one page object per URL that grows to hundreds of methods; split by component (header, mini-cart, filters) instead.",
    "Hiding assertions inside page object methods, so a test reads as a list of actions that never visibly checks anything.",
    "Logging in through the UI in every test instead of once via API/session, adding minutes to the suite.",
    "Deep inheritance chains between page objects (`BasePage → ShopPage → ProductPage`), which make changes risky.",
  ],
  debugging: [
    "When a page object locator breaks, fix it once in the page object and re-run every spec that uses it.",
    "Use the Playwright trace or the Cypress command log to see which page object method was executing when the test failed.",
    "If a helper hides too much, temporarily inline it into the test to see each step in the log.",
  ],
  relatedNotes: [],
  relatedLessons: ["advanced-classes", "modern-js-es-modules", "tooling-project-structure", "debugging-maintainable-functions"],
  practice:
    "Write a `LoginPage` page object (Playwright) or a set of plain helper functions (Cypress) with `open()` and `login(email, password)`. Then write one spec that uses it and keeps the assertion about the welcome message in the test body.",
  docs: [
    { title: "Playwright: Page object models", url: "https://playwright.dev/docs/pom" },
    { title: "Playwright: Fixtures", url: "https://playwright.dev/docs/test-fixtures" },
    { title: "Cypress: Best practices", url: "https://docs.cypress.io/app/core-concepts/best-practices" },
    { title: "Martin Fowler: PageObject", url: "https://martinfowler.com/bliki/PageObject.html" },
  ],
  versionNote: "Playwright 1.40+ (fixtures via `test.extend`), Cypress 13+.",
};
