import type { KbNote } from "@/content/types";

export const cyInstallationConfig: KbNote = {
  id: "cy-installation-config",
  slug: "cy-installation-config",
  category: "cypress",
  title: "Installing and Configuring Cypress",
  summary:
    "Install Cypress as a dev dependency, scaffold the project with `cypress open`, and control behaviour from `cypress.config.js`: `baseUrl`, `specPattern`, timeouts, viewport and separate `e2e` and `component` testing types.",
  tech: ["cypress", "javascript", "node"],
  difficulty: "beginner",
  tags: ["install", "config", "baseUrl", "specPattern", "component testing"],
  prerequisites: [
    "Node.js (an LTS version supported by your Cypress release) and npm installed",
    "A project with a `package.json`",
    "Basic understanding of ES modules / CommonJS exports",
  ],
  explanation: [
    {
      kind: "paragraph",
      text:
        "Cypress is an npm package that downloads a matching binary (the app plus an Electron browser) into a local cache on install. Add it as a **devDependency** so every developer and CI job uses the same pinned version from the lockfile.",
    },
    {
      kind: "paragraph",
      text:
        "The first `npx cypress open` launches the Launchpad, which asks which testing type you want and generates `cypress.config.js`, a `cypress/` folder with `e2e/`, `fixtures/` and `support/`, and example files you can delete.",
    },
    {
      kind: "table",
      headers: ["Option", "What it does", "Typical value"],
      rows: [
        ["`baseUrl`", "Prefix for `cy.visit('/path')` and `cy.request('/api')`; also makes Cypress wait for the server on start", "`http://localhost:3000`"],
        ["`specPattern`", "Glob that decides which files are specs", "`cypress/e2e/**/*.cy.{js,ts}`"],
        ["`supportFile`", "File loaded before every spec (custom commands, global hooks)", "`cypress/support/e2e.js`"],
        ["`defaultCommandTimeout`", "How long queries/assertions retry", "`4000` (ms, default)"],
        ["`viewportWidth` / `viewportHeight`", "Browser viewport size", "`1280` / `720`"],
        ["`retries`", "Automatic test retries", "`{ runMode: 2, openMode: 0 }`"],
        ["`setupNodeEvents`", "Hook into Node: tasks, plugins, dynamic config", "function"],
      ],
    },
    { kind: "heading", text: "E2E vs component testing" },
    {
      kind: "paragraph",
      text:
        "**E2E testing** visits your running app in a real browser and exercises full user journeys (login → product list → cart). **Component testing** mounts a single React/Vue/Angular/Svelte component with `cy.mount()` using your dev server bundler, without the rest of the app. Each type has its own block in the config with its own `specPattern` and support file.",
    },
    {
      kind: "callout",
      tone: "tip",
      title: "Use baseUrl",
      text:
        "Setting `baseUrl` keeps specs environment-agnostic (`cy.visit('/cart')`), and Cypress verifies the server is reachable before running, giving a clear error instead of a timeout.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "bash",
      title: "Install and open",
      code: "npm install --save-dev cypress\nnpx cypress open     # interactive runner (Launchpad)\nnpx cypress run      # headless, for CI\nnpx cypress verify   # check the binary is installed correctly",
    },
    {
      kind: "code",
      language: "json",
      title: "package.json scripts",
      code: "{\n  \"scripts\": {\n    \"cy:open\": \"cypress open --e2e --browser chrome\",\n    \"cy:run\": \"cypress run --e2e\",\n    \"cy:run:component\": \"cypress run --component\"\n  }\n}",
    },
  ],
  code: {
    title: "cypress.config.js",
    language: "js",
    code:
      "const { defineConfig } = require('cypress')\n\nmodule.exports = defineConfig({\n  viewportWidth: 1280,\n  viewportHeight: 800,\n  defaultCommandTimeout: 6000,\n  retries: { runMode: 2, openMode: 0 },\n\n  e2e: {\n    baseUrl: 'http://localhost:3000',\n    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',\n    supportFile: 'cypress/support/e2e.js',\n    setupNodeEvents(on, config) {\n      on('task', {\n        log(message) {\n          console.log(message)\n          return null\n        },\n      })\n      return config\n    },\n  },\n\n  component: {\n    devServer: {\n      framework: 'next',\n      bundler: 'webpack',\n    },\n    specPattern: 'src/**/*.cy.{jsx,tsx}',\n  },\n})",
  },
  walkthrough: [
    { line: "const { defineConfig } = require('cypress')", explanation: "`defineConfig` adds editor autocompletion and type checking for every config option." },
    { line: "retries: { runMode: 2, openMode: 0 },", explanation: "Top-level options apply to both testing types. Here failed tests retry twice in `cypress run` but never in interactive mode." },
    { line: "baseUrl: 'http://localhost:3000',", explanation: "All relative `cy.visit` and `cy.request` URLs are resolved against this. Override per environment with `--config baseUrl=...`." },
    { line: "specPattern: 'cypress/e2e/**/*.cy.{js,ts}',", explanation: "Only files matching this glob appear in the spec list and run in CI." },
    { line: "setupNodeEvents(on, config) {", explanation: "Runs in Node, not the browser. Register tasks and plugins here and return the (possibly modified) config." },
    { line: "devServer: {", explanation: "Component testing needs a bundler to mount components; here it reuses the Next.js webpack setup." },
  ],
  whenToUse: [
    "Setting up Cypress in a new or existing project.",
    "Pointing the same suite at local, staging or preview deployments by overriding `baseUrl`.",
    "Splitting quick component tests from slower end-to-end journeys.",
  ],
  mistakes: [
    "Installing Cypress globally, so CI and teammates run different versions. Keep it in `devDependencies`.",
    "Hard-coding `http://localhost:3000` in every `cy.visit` instead of using `baseUrl`.",
    "Writing browser code (like `cy.get`) inside `setupNodeEvents`; that function runs in Node only.",
    "Forgetting to start the app server before `cypress run`, then blaming Cypress for timeouts.",
    "Raising `defaultCommandTimeout` globally to hide one slow endpoint; pass `{ timeout }` to that command instead.",
  ],
  debugging: [
    "Run `npx cypress info` to see detected browsers, cache path and the resolved config.",
    "In the runner, open *Settings → Project settings → Resolved configuration* to see where each value came from (default, config file, env, CLI).",
    "Use `npx cypress verify` when the binary seems broken, and `npx cypress cache clear` followed by reinstall to repair it.",
  ],
  relatedNotes: ["cy-spec-structure"],
  relatedLessons: ["tooling-npm", "tooling-package-json", "tooling-dependencies", "tooling-nodejs-basics"],
  practice:
    "Install Cypress in a demo shop project, set `baseUrl` to your dev server, restrict `specPattern` to `cypress/e2e/**/*.cy.js`, and add `cy:open` and `cy:run` npm scripts. Verify a spec that calls `cy.visit('/')` passes.",
  docs: [
    { title: "Install Cypress", url: "https://docs.cypress.io/app/get-started/install-cypress" },
    { title: "Configuration reference", url: "https://docs.cypress.io/app/references/configuration" },
    { title: "Testing types", url: "https://docs.cypress.io/app/core-concepts/testing-types" },
  ],
  versionNote: "Cypress 10+ (cypress.config.js replaced cypress.json in v10)",
};
