import type { KbNote } from "@/content/types";

export const e2eFlakyTests: KbNote = {
  id: "e2e-flaky-tests",
  slug: "e2e-flaky-tests",
  category: "fundamentals",
  title: "Flaky Tests: Causes and Cures",
  summary:
    "A flaky test passes and fails without any code change. Flakiness destroys trust in a suite. Learn the usual root causes and how to fix them instead of hiding them with retries.",
  tech: ["cypress", "playwright"],
  difficulty: "intermediate",
  tags: ["flaky tests", "retries", "race conditions", "determinism", "quarantine"],
  prerequisites: ["Retrying assertions", "Test isolation", "Basic async JavaScript"],
  explanation: [
    {
      kind: "paragraph",
      text: "A **flaky test** gives different results for the same code. Martin Fowler calls non-deterministic tests *\"a virus\"*: once people expect random failures, they ignore real ones. The goal is not zero retries but **zero unexplained failures**.",
    },
    {
      kind: "table",
      caption: "Root causes and fixes",
      headers: ["Cause", "Symptom", "Fix"],
      rows: [
        ["Racing the UI", "Click happens before the element is ready, text read before re-render", "Retrying assertions; wait for an observable state"],
        ["Fixed sleeps", "`cy.wait(2000)` too short on CI, too long locally", "Wait on network aliases or UI state"],
        ["Shared data", "Fails only in parallel or after another test", "Unique data per test"],
        ["Order dependency", "Fails when run alone", "Each test sets up its own preconditions"],
        ["Unstable environment", "Random 5xx, timeouts in third-party sandboxes", "Stub the unstable dependency or fix the env"],
        ["Time and randomness", "Fails near midnight or with certain random data", "Control the clock (`cy.clock`, `page.clock`), seed data"],
        ["Animations / layout shift", "Click lands on wrong element", "Wait for stable state; disable animations in test env"],
      ],
    },
    {
      kind: "paragraph",
      text: "**Retries** (`retries: { runMode: 2 }` in Cypress, `retries: 2` in Playwright) are a safety net for CI and a *detector*: both tools report tests that passed only on retry as flaky. Treat that report as a bug list.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Quarantine, don't ignore",
      text: "If a flaky test can't be fixed today, move it to a quarantined/tagged group with an owner and a ticket. Leaving it in the main suite trains everyone to ignore red builds.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Cypress retries (cypress.config.js)",
      code: `module.exports = defineConfig({
  retries: { runMode: 2, openMode: 0 },
});`,
    },
    {
      kind: "code",
      language: "ts",
      title: "Playwright retries + trace on retry",
      code: `export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  use: { trace: "on-first-retry" },
});`,
    },
  ],
  code: {
    title: "Fixing a classic flaky search test (Playwright)",
    language: "ts",
    code: `import { test, expect } from "@playwright/test";

// FLAKY: sleeps, then reads text once
test.skip("flaky version", async ({ page }) => {
  await page.goto("/search");
  await page.getByRole("searchbox").fill("lamp");
  await page.waitForTimeout(1000); // too short on slow CI, wasted time locally
  const count = await page.getByTestId("result-card").count(); // one-shot read
  expect(count).toBeGreaterThan(0);
});

// STABLE: waits for the response and uses retrying assertions
test("shows results for a search term", async ({ page }) => {
  await page.goto("/search");
  const searchDone = page.waitForResponse(
    (res) => res.url().includes("/api/search?q=lamp") && res.status() === 200,
  );
  await page.getByRole("searchbox").fill("lamp");
  await searchDone;
  await expect(page.getByTestId("search-status")).toHaveText(/\\d+ results/);
  await expect(page.getByTestId("result-card").first()).toContainText(/lamp/i);
});`,
  },
  walkthrough: [
    { line: "await page.waitForTimeout(1000);", explanation: "A fixed sleep guesses how long the app takes. Any guess is wrong on some machine, which is the definition of flaky." },
    { line: 'const count = await page.getByTestId("result-card").count();', explanation: "`count()` reads once. If results render 50ms later, the test fails even though the app is fine." },
    { line: "const searchDone = page.waitForResponse(", explanation: "The response promise is created *before* typing, so a fast response cannot be missed." },
    { line: 'await expect(page.getByTestId("result-card").first()).toContainText(/lamp/i);', explanation: "The web-first assertion retries until the card renders with matching text." },
  ],
  whenToUse: [
    "Whenever a test fails on CI and passes on re-run: treat it as a bug in the test, the app or the environment.",
    "When enabling retries: always pair them with flaky-test reporting (Playwright marks them `flaky`; Cypress Cloud's flaky test management).",
  ],
  mistakes: [
    "Increasing timeouts or adding sleeps until the test turns green, without finding the race.",
    "Turning on retries globally and never looking at which tests needed them.",
    "Blaming the tool: most flakiness is shared data, environment instability or real app race conditions.",
    "Deleting a flaky test that covers a critical path instead of quarantining and fixing it.",
  ],
  debugging: [
    "Reproduce locally with stress: `npx playwright test --repeat-each=20 path/to/spec.ts` or Cypress with a loop such as `Cypress._.times(20, ...)` around the `it`.",
    "Collect evidence on the failing attempt: Playwright trace on first retry, Cypress screenshots and command log.",
    "Compare the timing of network requests in the passing and failing traces: the order of events usually reveals the race.",
    "Throttle CPU/network locally to mimic slow CI machines.",
  ],
  relatedNotes: ["e2e-test-isolation", "e2e-debugging-failures"],
  relatedLessons: ["async-race-conditions", "async-timers", "async-event-loop"],
  practice:
    "Find (or write) a test that uses a fixed wait. Replace it with a network wait or a retrying assertion, then run it 20 times with `--repeat-each` (Playwright) or a loop (Cypress) to prove it is stable.",
  docs: [
    { title: "Martin Fowler: Eradicating Non-Determinism in Tests", url: "https://martinfowler.com/articles/nonDeterminism.html" },
    { title: "Cypress: Test retries", url: "https://docs.cypress.io/app/guides/test-retries" },
    { title: "Playwright: Retries", url: "https://playwright.dev/docs/test-retries" },
    { title: "Playwright: Trace viewer", url: "https://playwright.dev/docs/trace-viewer" },
  ],
  versionNote: "`page.clock` requires Playwright 1.45+; Cypress 13+.",
};
